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
      Expense.list(this.state.date.getTime(), function(expenses) {
        this.updateExpenses(expenses);
      }.bind(this), this.onExpensesFailedToLoad);
    },
    makeWeek: function(date) {
      // Minus the day from the date to get back to Monday
      // Wrap and mod to deal with Sunday being the JS first day of the week
      date.setDate(date.getDate() - ((date.getDay() - 1 + 7) % 7));
      date.setHours(0,0,0,0);
      return date;
    },
    getInitialState: function() {
      return {date: this.makeWeek(new Date()), expenses:[]};
    },
    moveWeek: function(noOfWeeks) {
      var currentDate = this.state.date;
      this.setState({expenses: [],
                     date: new Date(currentDate.setDate(currentDate.getDate() + (noOfWeeks * 7)))});
      Expense.list(this.state.date.getTime(), function(expenses) {
        this.updateExpenses(expenses);
      }.bind(this), this.onExpensesFailedToLoad);
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
                      DatePicker({date:this.state.date, moveWeek:this.moveWeek}),
                      ExpensesTable({date:this.state.date, expenses:this.state.expenses, updateExpenses: this.updateExpenses})
                     ));
    }
  });

  var DatePicker = React.createClass({
    // props moveWeek, date
    render: function() {
      var date = this.props.date.getDate();
      var month = this.props.date.getMonth() + 1;
      var year = this.props.date.getFullYear();
      return React.DOM.div({className: "datepicker ui grid"},
                           React.DOM.div({className:"column right aligned"},
                                         React.DOM.a({href:'#',onClick: function() {this.props.moveWeek(-1); return false;}.bind(this)},"<<<"),
                                         React.DOM.span({}, ' Week commencing: ' + date + '/' + month + '/' + year + ' '),
                                         React.DOM.a({href:'#',onClick: function() {this.props.moveWeek(1); return false;}.bind(this)},">>>")));
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
          {className: "time"}, "Comment"),
        React.DOM.th(
          {className: "delete"}, ""));

    }
  });

  var ExpensesDayRow = React.createClass({
    // props {datetime:, add}
    days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday",
           "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"],
    render: function() {
      var date = new Date(this.props.datetime);
      var day = this.days[date.getDay()];
      var dayOfMonth = date.getDate();
      var month = this.months[date.getMonth()];
      var year = date.getFullYear();
      return React.DOM.tr({key:day, className:"day"},
                          React.DOM.td(
                            {className: "day", colSpan:3}, day),
                          React.DOM.td(
                            {className: "date right aligned"}, dayOfMonth + ' ' + month + ', ' + year),
                          React.DOM.td(
                            {className:"", onClick:function() {
                              this.props.add(this.props.datetime);
                              return false;
                            }.bind(this)}, "[+]"));
    }
  });

  var ExpenseDeleteCell = React.createClass({
    render: function() {
      return React.DOM.a({href:"#", onClick:function() {
        Expense.delete(this.props.location, function() {
          this.props.onDelete(this);
        }.bind(this), function(error) {
          this.setState({deleting:false, error:true});
        });
        return false;
      }.bind(this)}, "[x]");
    }
  });


  var NewExpense = React.createClass({
    // props {onSave:, datetime}
    renderDatetime: function(datetime) {
      return new Date(datetime).getHours() + ":" + new Date(datetime).getMinutes();
    },
    renderAmount: function(amount) {
      return amount.toFixed(2);
    },
    getInitialState: function () {
      var datetime = this.props.datetime;
      return {datetime: datetime,
              datetimeInEdit:this.renderDatetime(datetime),
              amount:0.0,
              amountInEdit:this.renderAmount(0.0),
              description: "",
              comment: ""};
    },
    save: function(){
      Expense.save(this.state.datetime, this.state.amount, this.state.description, this.state.comment, this.onSave, this.onSaveFailed);
    },
    onSave: function(location) {
      this.props.onSave(this.state.datetime, this.state.amount, this.state.description, this.state.comment, location);
    },
    onSaveFailed: function() {
      alert('Could not save. Is your date correct?');
    },
    updateAmount: function(amount) {
      this.setState({amountInEdit:amount});
    },
    validatedUpdateAmount: function(amountStr) {
      var amountFloat = parseFloat(amountStr);
      if (!isNaN(amountFloat)) {
        this.setState({amount:amountFloat,
                      amountInEdit:this.renderAmount(amountFloat)});
      } else {
        this.setState({amountInEdit:this.renderAmount(this.state.amount)});
      }
    },
    updateDate: function(hhMMStr) {
      this.setState({datetimeInEdit: hhMMStr});
    },
    validatedUpdateDate: function(hhMMStr) {
      // Validate and update
      var hhMm = hhMMStr.split(":");
      var newTime = new Date(this.state.datetime);
      newTime.setHours(hhMm[0]);
      if (hhMm.length > 1) {
        newTime.setMinutes(hhMm[1]);
      } else {
        newTime.setMinutes(0);
      }
      if (isNaN(newTime.getTime())) {
        this.setState({datetimeInEdit:this.renderDatetime(this.state.datetime)});
      } else {
        this.setState({datetime:newTime.getTime(),
                       datetimeInEdit:this.renderDatetime(newTime.getTime())
                      });
      }
    },
    render: function() {
      return React.DOM.tr(
        {},
        React.DOM.td(
          {className: "time"},
          React.DOM.input({
            value: this.state.datetimeInEdit,
            onChange:function(e) {
              this.updateDate(e.target.value);
              return true;
            }.bind(this),
            onBlur:function(e) {
              this.validatedUpdateDate(e.target.value);
              return true;
            }.bind(this)})),
        React.DOM.td(
          {className: "amount"},
          React.DOM.input({
            value: this.state.amountInEdit,
            onChange:function(e) {
              this.updateAmount(e.target.value);
              return true;
            }.bind(this),
            onBlur: function(e) {
              this.validatedUpdateAmount(e.target.value);
            }.bind(this)})),
        React.DOM.td(
          {className: "description"},
          React.DOM.input({value:this.state.description, onChange:function(e) {
            this.setState({description:e.target.value});
            return true;
          }.bind(this)})),
        React.DOM.td(
          {className: "comment"},
          React.DOM.input({value:this.state.comment, onChange:function(e) {
            this.setState({comment:e.target.value});
            return true;
          }.bind(this)})),
        React.DOM.td({className: "save"},
                    React.DOM.button({onClick:this.save}, "Save")));

    }
  });




  var Expense_ = React.createClass({
    // props {onDelete, onUpdate}
    getInitialState: function() {
      return {deleting: false, error: false};
    },
    render: function() {
      return React.DOM.tr(
        {},
        React.DOM.td({className: "time", contentEditable:true, onBlur:function(e) {
          var timeStr = e.currentTarget.textContent;
          var hhMm = timeStr.split(":");
          var newTime = new Date(this.state.time);
          newTime.setHours(hhMm[0]);
          newTime.setMinutes(hhMm[1]);
          if (!isNaN(newTime.getTime())) {
            this.setState({time:newTime});
            return true;
          } else {
            return false;
          }
        }.bind(this)}, new Date(this.props.datetime).getHours() + ':' + new Date(this.props.datetime).getMinutes()),
        React.DOM.td({className: "amount", contentEditable:true, onBlur:function(e) {
          var amountStr = e.currentTarget.textContent;
          var amountFloat = parseFloat(amountStr);
          if (!isNaN(amountFloat)) {
            this.setState({amount:amountFloat});
            return true;
          } else {
            return false;
          }
        }.bind(this)}, this.props.amount.toFixed(2)),
        React.DOM.td({className: "description", contentEditable:true, onBlur:function(e) {
          this.setState({description:e.currentTarget.textContent});
          return true;
        }.bind(this)}, this.props.description),
        React.DOM.td({className: "comment", contentEditable:true, onBlur:function(e) {
          this.setState({comment:e.currentTarget.textContent});
          return true;
        }.bind(this)}, this.props.comment),
        React.DOM.td({className: "update" + (this.state.deleting ? " deleting" : "") + (this.state.error ? " error" : "")},
                    ExpenseDeleteCell({location: this.props.location, onDelete:this.props.onDelete})));
    }
  });

  var ExpensesTable = React.createClass({
    // props {expenses:, updateExpenses, date }
    dummy: [],
    getInitialState: function() {
      return {adding:undefined};
    },
    displayName: 'ExpenseTable',
    logout: function() {
      Login.logout(this.props.signalLoggedOut, function() {console.log("Could not logout");});
      return false;
    },
    render: function() {
      var dayHeaderRows = [];
      for(var i=0; i < 7; i++) {
        var dateCopy = new Date(this.props.date.getTime());
        dateCopy.setDate(dateCopy.getDate() + i);
        dayHeaderRows.push(ExpensesDayRow({datetime:dateCopy.getTime(), key:dateCopy.getTime(), add:function(time) {
          this.setState({adding:time});
        }.bind(this)}));
      }
      if (this.state.adding !== undefined) {
        dayHeaderRows.push(NewExpense({datetime:this.state.adding, onSave:function(datetime, amount, description, comment, location){
          var newExpenses = this.props.expenses;
          newExpenses.push({
            datetime: datetime,
            amount: amount,
            description:description,
            comment: comment,
            location: location
          });
          this.setState({adding: undefined});
          this.props.updateExpenses(newExpenses);
        }.bind(this)}));
      }
      var keyedExpenses = this.props.expenses.map(Expense_)
      .map(function(x, idx) {
        x.props['key'] = x.props['location'];
        x.props.onDelete = function() {
          var newExps = this.props.expenses;
          var removes = this.props.expenses.splice(idx,1);
          this.props.updateExpenses(newExps);
        }.bind(this);
        return x;
      }.bind(this));
      var expenses = dayHeaderRows.concat(keyedExpenses).sort(function(a,b) {
        if (a.props.datetime === b.props.datetime) {
          if (!a.props.hasOwnProperty("amount")) {
            return -1;
          } else if (!b.props.hasOwnProperty("amount")) {
            return 1;
          } else if (a.props.editing) {
            return -1;
          } else {
            return 1;
          }
        }
        else {
          return a.props.datetime - b.props.datetime;
        }
      });

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
                             ExpensesPage({timestamp: 1417046144581, signalLoggedOut: this.logOut, username:this.state.username}));

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
