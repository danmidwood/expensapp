var x = require(["lib/react/react", "lib/jquery/dist/jquery", "login", "expense"], function(React, jQuery, Login, Expense) {

  var LoginPage  = React.createClass({
    displayName: 'Login',
    getInitialState: function() {return {username: '', password: '', message: undefined, error:undefined, joining: false, loading: false};},
    loginSuccess: function(username) {
      this.setState({loading:false, message:undefined, error:undefined});
      this.props.signalLoggedIn(username);
    },
    invalidCredentials: function() {
      this.setState({loading:false, message:undefined, error: 'Credentials invalid'});
    },
    doLogin: function(e) {
      this.setState({loading:true, message:"Logging in", error:undefined});
      Login.login(this.state.username, this.state.password, this.loginSuccess, this.invalidCredentials);
      return false;
    },
    joinedSuccess: function(username, password) {
      this.setState({loading:false, message:undefined});
      console.log("Account created, now logging in");
      this.doLogin();
    },
    errorJoining: function() {
      this.setState({loading:false, message: undefined, error: 'An error occured'});
    },
    doJoin: function(e) {
      this.setState({loading:true, message:"Joining", error:undefined});
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
      var extraFormClasses = "" +
            ((this.state.message != undefined) ? " info" : "") +
            ((this.state.error != undefined) ? " error" : "") +
            (this.state.loading ? " loading" : "");
;
      return (React.DOM.div({},
                            React.DOM.form({className: "login_form ui form input" + extraFormClasses, onSubmit: (this.state.joining ? this.doJoin : this.doLogin)},
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
                                           React.DOM.div({className:'ui info message'}, this.state.message),
                                           React.DOM.div({className:'ui error message'}, this.state.error),
                                           React.DOM.button({id: "login", className: "ui primary button right floated"}, (this.state.joining ? "Join" : "Log in"))),
                            React.DOM.div({}, React.DOM.a({className:'info', href:"#", onClick:function() {
                              this.setState({joining: !this.state.joining});
                              return false;
                            }.bind(this)}, (this.state.joining ? "Already a member? Click here to log in." : "New to Expensapp? Click here to join.")))));
    }
  });


  var ExpensesPage = React.createClass({
    displayName: 'Expenses',
    componentDidMount: function() {
      Expense.list(1417046144581, function(expenses) {
        setTimeout(function() {this.setState({loading:false});}.bind(this), 3000);
        this.updateExpenses(expenses);
      }.bind(this), this.onExpensesFailedToLoad);
    },
    getInitialState: function() {
      return {expenses:[]};
    },
    updateExpenses: function(expenses){
      this.setState({expenses: expenses});
    },
    onExpensesFailedToLoad: function() {
    },
    logout: function() {
      Login.logout(this.props.signalLoggedOut, function() {console.log("Could not logout");});
      return false;
    },
    render: function() {
      return (
        React.DOM.div({className: "twelve wide column loading"},
                      React.DOM.p({}, "Hi " + this.props.username + "! You are logged in. "),
                      React.DOM.a({onClick:this.logout, href:'#'}, "Logout"),
                      ExpensesTable({expenses:this.state.expenses, updateExpenses: this.updateExpenses})
                     ));
    }
  });

  var ExpensesTableHeader = React.createClass({
    render: function() {
      return React.DOM.tr(
        {className:"floated"},
        React.DOM.th(
          {className: "time"}, "Time"),
        React.DOM.th(
          {className: "time"}, "Amount"),
        React.DOM.th(
          {className: "time"}, "Description"),
        React.DOM.th(
          {className: "time"}, "Comment"));
    }
  });

  var ExpensesDayRow = React.createClass({
    // props {timestamp:}
    days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday",
           "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"],
    render: function() {
      var date = new Date(this.props.timestamp);
      var day = this.days[date.getDay()];
      var dayOfMonth = date.getDate();
      var month = this.months[date.getMonth()];
      var year = date.getFullYear();
      return React.DOM.tr({key:day, className:"day"},
                          React.DOM.td(
                            {className: "day", colSpan:3}, day),
                          React.DOM.td(
                            {className: "date right aligned"}, dayOfMonth + ' ' + month + ', ' + year));
    }
  });

  var Expense_ = React.createClass({
    // props {expense:}
    render: function() {
      return React.DOM.tr(
        {},
        React.DOM.td({className: "time"}, new Date(this.props.datetime).getHours() + ':' + new Date(this.props.datetime).getMinutes()),
        React.DOM.td({className: "amount"}, this.props.amount.toFixed(2)),
        React.DOM.td({className: "description"}, this.props.description),
        React.DOM.td({className: "comment"}, this.props.comment));
    }
  });

  var ExpensesTable = React.createClass({
    // props {expenses:, updateExpenses }
    dummy: [],
    displayName: 'ExpenseTable',
    logout: function() {
      Login.logout(this.props.signalLoggedOut, function() {console.log("Could not logout");});
      return false;
    },
    render: function() {
      var timestamp = 1416236040581;
      var expenses = this.props.expenses.sort(
        function(a,b) {
          return a.datetime - b.datetime;
        }
      ).map(Expense_)
      .map(function(x) {
        x.props['key'] = x.props['location'];
        return x;
      })
      .reduce(function(previous,current,idx,array) {
        if (previous.length === 0){
          previous.push(ExpensesDayRow({timestamp:current.props.datetime, key:current.props.datetime}));
        } else {
          var last = previous[previous.length - 1];
          var lastDate = new Date(last.props.datetime).getDate();
          var currentDate = new Date(current.props.datetime).getDate();
          if (lastDate !== currentDate) {
            previous.push(ExpensesDayRow({timestamp:current.props.datetime, key:current.props.datetime}));
          }
        }
        previous.push(current);
        return previous;
      },[]);
      return (
        React.DOM.table(
          {className:"ui compact celled table"},
          React.DOM.thead(
            {},
            ExpensesTableHeader()
          ),
          React.DOM.tbody(
            {},
            expenses
          )
        ));
    }
  });




  var App = React.createClass({
    displayName: 'App',
    lorem: ["Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.",
              "Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions.",
              "Completely synergize resource sucking relationships via premier niche markets. Professionally cultivate one-to-one customer service with robust ideas. Dynamically innovate resource-leveling customer service for state of the art customer service.",
              "Objectively innovate empowered manufactured products whereas parallel platforms. Holisticly predominate extensible testing procedures for reliable supply chains. Dramatically engage top-line web services vis-a-vis cutting-edge deliverables."],
    getInitialState: function() {
      return {loggedIn: false};
    },
    logIn: function(username) {
      this.setState({loggedIn: true, username:username});
    },
    logOut: function() {
      this.setState({loggedIn: false, username:undefined});
    },
    componentDidMount: function() {
      Login.isLoggedIn(this.logIn, this.logOut);
      setInterval(function() {
        Login.isLoggedIn(this.logIn, this.logOut);
      }.bind(this), 10000);
    },
    render: function() {
      if (this.state.loggedIn) {
        return React.DOM.div({id:"container", className: "row"},
                             React.DOM.div({id: "marketing_bg", className: "four wide column"},
                                           React.DOM.div({id: "marketing"}, this.lorem.slice(2).map(function(x) {return React.DOM.p({key:x}, x);}))
                                          ),
                             ExpensesPage({signalLoggedOut: this.logOut, username:this.state.username}));

      } else {
        return React.DOM.div({id:"container", className: "row"},
                             React.DOM.div({id: "marketing_bg", className: "ten wide column"},
                                           React.DOM.div({id: "marketing"}, this.lorem.map(function(x) {return React.DOM.p({key:x}, x);}))
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
