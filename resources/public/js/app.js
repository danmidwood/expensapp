var x = require(["lib/react/react", "lib/jquery/dist/jquery", "login", "expense"], function(React, jQuery, Login, Expense) {

  var LoginPage  = React.createClass({
    displayName: 'Login',
    getInitialState: function() {return {username: '', password: '', message: undefined, joining: false, loading: false};},
    loginSuccess: function(username) {
      this.setState({loading:false, message:undefined});
      this.props.signalLoggedIn(username);
    },
    invalidCredentials: function() {
      this.setState({loading:false});
      this.setState({message: 'Credentials invalid'});
    },
    doLogin: function(e) {
      this.setState({loading:true, message:"Logging in"});
      Login.login(this.state.username, this.state.password, this.loginSuccess, this.invalidCredentials);
      return false;
    },
    joinedSuccess: function(username, password) {
      this.setState({loading:false});
      console.log("Account created, now loggin in");
      this.doLogin();
    },
    errorJoining: function() {
      this.setState({loading:false, message: 'An error occured'});
    },
    doJoin: function(e) {
      this.setState({loading:true, message:"Joining"});
      Login.join(this.state.username, this.state.password, this.joinedSuccess, this.errorJoining);
      return false;
    },
    handleUsernameChanged: function(e) { // TODO: Is there a way to auto bind these?
      this.setState({username: e.target.value});
    },
    handlePasswordChanged: function(e) {
      this.setState({password: e.target.value});
    },
    render: function() {
      return (React.DOM.div({},
                            React.DOM.form({className: "login_form ui input form" + (this.state.loading ? " loading" : ""), onSubmit: (this.state.joining ? this.doJoin : this.doLogin)},
                                           React.DOM.div({className: "ui labeled field input"},
                                                         React.DOM.div({className:"ui label"},"Username:"),
                                                         React.DOM.input({id: "username",
                                                                          value: this.state.username,
                                                                          onChange: this.handleUsernameChanged})),
                                           React.DOM.div({className: "ui labeled field input"},
                                                         React.DOM.div({className:"ui label"},"Password:"),
                                                         React.DOM.input({id: "password",
                                                                          type: 'password',
                                                                          value: this.state.password,
                                                                          onChange: this.handlePasswordChanged})),
                                           React.DOM.button({id: "login", className: "ui primary button right floated"}, (this.state.joining ? "Join" : "Log in"))),
                            React.DOM.p({className:'message'}, this.state.message),
                            React.DOM.a({className:'info', href:"#", onClick:function() {
                              this.setState({joining: !this.state.joining});
                              return false;
                            }.bind(this)}, (this.state.joining ? "Already a member? Click here to log in." : "New to Expensapp? Click here to join."))));
    }
  });




  var ExpensesPage = React.createClass({
    displayName: 'Expenses',
    logout: function() {
      Login.logout(this.props.signalLoggedOut, function() {console.log("Could not logout");});
      return false;
    },
    render: function() {
      return (
        React.DOM.div({className: "overlay"},
                      React.DOM.p({}, "Hi " + this.props.username + "! You are logged in. "),
                      React.DOM.a({onClick:this.logout, href:'#'}, "Logout")
                     ));
    }
  });


var lorem = ["Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.",
              "Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions.",
              "Completely synergize resource sucking relationships via premier niche markets. Professionally cultivate one-to-one customer service with robust ideas. Dynamically innovate resource-leveling customer service for state of the art customer service.",
              "Objectively innovate empowered manufactured products whereas parallel platforms. Holisticly predominate extensible testing procedures for reliable supply chains. Dramatically engage top-line web services vis-a-vis cutting-edge deliverables."];


  var App = React.createClass({
    displayName: 'App',
    getInitialState: function() {
      return {loggedIn: false};
    },
    logIn: function(username) {
      this.setState({loggedIn: true, username:username});
    },
    logOut: function() {
      this.setState({loggedIn: false});
    },
    componentDidMount: function() {
      // check if logged in
    },
    render: function() {
      if (this.state.loggedIn) {
        return ExpensesPage({signalLoggedOut: this.logOut, username:this.state.username});
      } else {
        return React.DOM.div({id:"container", className: "row"},
                             React.DOM.div({id: "marketing_bg", className: "ten wide column"},
                                           React.DOM.div({id: "marketing"}, lorem.map(function(x) {return React.DOM.p({}, x);}))
                                          ),
                             React.DOM.div({className:"column", id: "login_box"},
                                           LoginPage({signalLoggedIn: this.logIn})));

      }
    }
  });



  React.renderComponent(
    App(),
    document.getElementById('outer-container')
  );


});
