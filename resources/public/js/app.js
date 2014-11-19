var x = require(["lib/react/react", "lib/jquery/dist/jquery", "login", "expense"], function(React, jQuery, Login, Expense) {

  var LoginPage  = React.createClass({
    displayName: 'Login',
    getInitialState: function() {return {username: '', password: '', error: undefined};},
    loginSuccess: function(username) {
      this.props.signalLoggedIn(username);
    },
    invalidCredentials: function() {
      this.setState({error: 'Credentials invalid'});
    },
    doLogin: function(e) {
      Login.login(this.state.username, this.state.password, this.loginSuccess, this.invalidCredentials);
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
                            React.DOM.form({className: "login_form", onSubmit: this.doLogin},
                                           React.DOM.input({id: "username",
                                                            value: this.state.username,
                                                            onChange: this.handleUsernameChanged}),
                                           React.DOM.input({id: "password",
                                                            type: 'password',
                                                            value: this.state.password,
                                                            onChange: this.handlePasswordChanged}),
                                           React.DOM.button({id: "login"}, "Log in")),
                            React.DOM.p({className:'error'}, this.state.error)));
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
        return LoginPage({signalLoggedIn: this.logIn});
      }
    }
  });



  React.renderComponent(
    App(),
    document.getElementById('app')
  );


});
