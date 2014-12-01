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
    replaceExpense: function(expense){
      var newExpenses = this.state.expenses.filter(function(value) {
        return value.location !== expense.location;
      });
      if (expense.datetime >= this.state.date.getTime()
         && expense.datetime < this.state.date.getTime() + 604800000) {
        // if it's still on this week.. 604800000 === one week
        newExpenses.push(expense);
      }
      this.setState({expenses: newExpenses});
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
                      React.DOM.div({className:"ui grid"},
                                    React.DOM.div({className:"welcomeMessage five wide column"},
                                                  React.DOM.span({}, "Hi " + this.props.username + ", get tracking those expenses. "),
                                                  React.DOM.a({onClick:this.logout, href:'#'}, "Logout")),
                                    DatePicker({date:this.state.date, moveWeek:this.moveWeek})),
                      ExpensesTable({date:this.state.date, expenses:this.state.expenses,
                                     updateExpenses: this.updateExpenses, replaceExpense:this.replaceExpense})
                     ));
    }
  });

  var DatePicker = React.createClass({
    // props moveWeek, date
    render: function() {
      var date = this.props.date.getDate();
      var month = this.props.date.getMonth() + 1;
      var year = this.props.date.getFullYear();
      return React.DOM.div({className:"datepicker eleven wide column right aligned"},
                           React.DOM.a({href:'#',onClick: function() {this.props.moveWeek(-1); return false;}.bind(this)},"<<<"),
                           React.DOM.span({className: "weekCommencing"}, ' Week commencing: ' + date + '/' + month + '/' + year + ' '),
                           React.DOM.a({href:'#',onClick: function() {this.props.moveWeek(1); return false;}.bind(this)},">>>"));
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
          {className: "time"},
          React.DOM.span({},"Description > "),
          React.DOM.label({}, "filter:",
                          React.DOM.input(
                            {onChange: function(e) {
                              this.props.filterDescription(e.target.value);
                              return true;
                            }.bind(this)}))),
        React.DOM.th(
          {className: "time"},
          React.DOM.span({},"Comment > "),
          React.DOM.label({}, "filter:",
                          React.DOM.input(
                            {onChange: function(e) {
                              this.props.filterComment(e.target.value);
                              return true;
                            }.bind(this)}))),
        React.DOM.th(
          {className: "action"}, ""));

    }
  });

  var TotalRow = React.createClass({
    render: function() {
      var totalAmount = this.props.expenses.reduce(function(a,b) {
        var newTotal = a.total + b.amount;
        var newNumber = a.number + 1;
        return {total:newTotal, number:newNumber};
      },
      {total:0, number:0});

      return React.DOM.tr(
        {className:"subHeader"},
        React.DOM.th(
          {className: ""}),
        React.DOM.th(
          {className: "total", colSpan: 4}, "Week total: " + totalAmount.total));

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
      var totalAmount = this.props.expenses
            .filter(
              function(a) {
                return new Date(a.datetime).getDate() === dayOfMonth;
              }
            )
            .reduce(
              function(a,b) {
                var newTotal = a.total + b.amount;
                var newNumber = a.number + 1;
                return {total:newTotal, number:newNumber};
              },
              {total:0, number:0}
            );
      return React.DOM.tr({key:day, className:"dayRow"},
                          React.DOM.th(
                            {className: "day", colSpan:1}, day),
                          React.DOM.th(
                            {className: "dayTotal", colSpan:2}, totalAmount.number > 0 ? "Daily total: " + renderMoney(totalAmount.total) + ", average: " + renderMoney(totalAmount.total / totalAmount.number) : ""),
                          React.DOM.th(
                            {className: "date right aligned"}, dayOfMonth + ' ' + month + ', ' + year),
                          React.DOM.th(
                            {className:"action"},
                            React.DOM.a({href:"#", onClick:function() {
                              this.props.add(this.props.datetime);
                              return false;
                            }.bind(this)}, "[+]")));
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

  var renderMoney = function(amount) {
    return amount.toFixed(2);
  };


  var NewExpense = React.createClass({
    // props {onSave:, datetime}
    renderDatetime: function(datetime) {
      return new Date(datetime).getHours() + ":" + new Date(datetime).getMinutes();
    },
    getInitialState: function () {
      var datetime = this.props.datetime;
      return {datetime: datetime,
              datetimeInEdit:this.renderDatetime(datetime),
              amount:0.0,
              amountInEdit:renderMoney(0.0),
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
                      amountInEdit:renderMoney(amountFloat)});
      } else {
        this.setState({amountInEdit:renderMoney(this.state.amount)});
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
      newTime.setMinutes(hhMm.length > 1 ? hhMm[1] : 0);
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
          React.DOM.textarea({value:this.state.description, onChange:function(e) {
            var newVal = e.target.value;
            if (newVal.length <= 100) {
              this.setState({description:newVal});
            }
            return true;
          }.bind(this)})),
        React.DOM.td(
          {className: "comment"},
          React.DOM.textarea({value:this.state.comment, onChange:function(e) {
            var newVal = e.target.value;
            if (newVal.length <= 100) {
              this.setState({comment:newVal});
            }
            return true;
          }.bind(this)})),
        React.DOM.td({className: "action"},
                    React.DOM.button({onClick:this.save}, "Save")));

    }
  });

  var renderTime = function(datetime) {
    var pad = function(num) {
      var s = num+"";
      while (s.length < 2) s = "0" + s;
      return s;
    };
    return pad(datetime.getHours()) + ':' + pad(datetime.getMinutes());
  };


  var Expense_ = React.createClass({
    // props {onDelete, onUpdate}
    getInitialState: function() {
      return {deleting: false,
              error: false,
              description:this.props.description,
              descriptionError: false,
              comment: this.props.comment,
              commentError: false,
              amountError: false,
              datetimeError: false
             };
    },
    render: function() {
      return React.DOM.tr(
        {},
        React.DOM.td(
          {className: "datetime" + (this.state.datetimeError ? " error" : ""),
           contentEditable:true, onBlur:function(e) {
             if (!this.state.datetimeError) {
               var timeStr = e.currentTarget.textContent;
               var hhMm = timeStr.split(":");
               var newTime = new Date(this.props.datetime);
               newTime.setHours(hhMm[0]);
               newTime.setMinutes(hhMm.length > 1 ? hhMm[1] : 0);
               if (!isNaN(newTime.getTime()) && newTime.getDate() === new Date(this.props.datetime).getDate()) {
                 if (newTime.getTime() === this.props.datetime) {
                   // a hack. If the time is edited without changing the value (e.g. 10:20 -> 10:2) then there
                   // is no rerendering. So this here will automatically apply it.
                   e.target.textContent = renderTime(new Date(this.props.datetime));
                 } else {
                   this.props.onUpdate({datetime:newTime.getTime()});
                 }
               }
             }
             return true;
          }.bind(this),
           onKeyUp:function(e) {
             var timeStr = e.currentTarget.textContent;
             var hhMm = timeStr.split(":");
             var newTime = new Date(this.props.datetime);
             newTime.setHours(hhMm[0]);
             newTime.setMinutes(hhMm.length > 1 ? hhMm[1] : 0);
             if (!isNaN(newTime.getTime()) && newTime.getDate() === new Date(this.props.datetime).getDate()) {
               this.setState({datetimeError:false});
             } else {
               this.setState({datetimeError:true});
             }
             return true;
           }.bind(this)
          }, renderTime(new Date(this.props.datetime))),
        React.DOM.td(
          {className: "amount" + (this.state.amountError ? " error" : ""),
           contentEditable:true, onBlur:function(e) {
             if (!this.state.amountError) {
               var amountStr = e.target.textContent;
               var amountFloat = parseFloat(amountStr);
               var newState = {amount:parseFloat(amountFloat.toFixed(2))};
               this.props.onUpdate(newState);
               e.target.textContent = renderMoney(newState.amount);
             }
          }.bind(this),
           onKeyUp:function(e) {
             var amountStr = e.target.textContent;
             var amountFloat = parseFloat(amountStr);
             if (!isNaN(amountFloat) && amountFloat <= 9999.99 && amountFloat >= -9999.99) {
               this.setState({amountError:false});
               return true;
             } else {
               this.setState({amountError:true});
               return false;
             }

           }.bind(this)
          }, renderMoney(this.props.amount)),
        React.DOM.td(
          {className: "description" + (this.state.descriptionError ? " error" : ""),
           value: this.state.description,
           contentEditable:true, onBlur:function(e) {
             this.props.onUpdate({description:this.state.description});
             return true;
           }.bind(this),
           onKeyUp:function(e) {
             var newVal = e.target.textContent;
             if (newVal.length <= 100) {
               this.setState({description:newVal, descriptionError:false});
             } else {
               this.setState({descriptionError:true});
             }
             return true;
           }.bind(this)}, this.state.description),
        React.DOM.td(
          {className: "comment" + (this.state.commentError ? " error" : ""),
           contentEditable:true, onBlur:function(e) {
            this.props.onUpdate({comment:this.state.comment});
            return true;
          }.bind(this),
           onKeyUp:function(e) {
             var newVal = e.target.textContent;
             if (newVal.length <= 100) {
               this.setState({comment:newVal, commentError:false});
             } else {
               this.setState({commentError:true});
             }
             return true;
           }.bind(this)
          }, this.state.comment),
        React.DOM.td({className: "action" + (this.state.deleting ? " deleting" : "") + (this.state.error ? " error" : "")},
                    ExpenseDeleteCell({location: this.props.location, onDelete:this.props.onDelete})));
    }
  });

  var ExpensesTable = React.createClass({
    // props {expenses:, updateExpenses, replaceExpense date }
    dummy: [],
    getInitialState: function() {
      return {adding:undefined,filterDescription:undefined, filterComment:undefined};
    },
    filterDescription: function(expense) {
      return this.state.filterDescription === undefined || expense.description.indexOf(this.state.filterDescription) !== -1;
    },
    filterComment: function(expense) {
      return this.state.filterComment === undefined || expense.comment.indexOf(this.state.filterComment) !== -1;
    },
    displayName: 'ExpenseTable',
    logout: function() {
      Login.logout(this.props.signalLoggedOut, function() {console.log("Could not logout");});
      return false;
    },
    render: function() {
      var expensesToDisplay = this.props.expenses.filter(this.filterDescription).filter(this.filterComment);
      var dayHeaderRows = [];
      for(var i=0; i < 7; i++) {
        var dateCopy = new Date(this.props.date.getTime());
        dateCopy.setDate(dateCopy.getDate() + i);
        dayHeaderRows.push(ExpensesDayRow({expenses:expensesToDisplay, datetime:dateCopy.getTime(), key:dateCopy.getTime(), add:function(time) {
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
      var keyedExpenses = expensesToDisplay.map(Expense_)
      .map(function(x, idx) {
        x.props['key'] = x.props['location'];
        x.props.onDelete = function() {
          var newExps = this.props.expenses;
          var removes = this.props.expenses.splice(idx,1);
          this.props.updateExpenses(newExps);
        }.bind(this);
        x.props.onUpdate = function(changedData) {
          var currentData = {datetime: x.props.datetime, description: x.props.description,
                       amount: x.props.amount, comment: x.props.comment};
          var newData = $.extend({}, currentData, changedData);
          Expense.update(x.props.location, newData.datetime, newData.amount, newData.description, newData.comment, function(exp){
            this.props.replaceExpense(exp);
          }.bind(this), alert);
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
          React.DOM.colgroup(
            {},
            React.DOM.col({span:1, className:"colTime"}),
            React.DOM.col({span:1, className:"colAmount"}),
            React.DOM.col({span:1, className:"colDescription"}),
            React.DOM.col({span:1, className:"colComment"}),
            React.DOM.col({span:1, className:"colAction"})),
          React.DOM.thead(
            {},
            ExpensesTableHeader(
              {filterDescription:function(text) {
                if (text.length === 0) {
                  this.setState({filterDescription:undefined});
                } else {
                  this.setState({filterDescription:text});
                }
              }.bind(this), filterComment:function(text) {
                if (text.length === 0) {
                  this.setState({filterComment:undefined});
                } else {
                  this.setState({filterComment:text});
                }
              }.bind(this)})
          ),
          React.DOM.tbody(
            {},
            expenses,
            TotalRow({expenses:expensesToDisplay})
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
