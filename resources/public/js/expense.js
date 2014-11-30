define(function (){
  return {
    list : function(from, success, error) {
      $.ajax({
        type: 'GET',
        url: '/expense?week_beginning=' + from,
        accept: 'application/vnd.expensapp.expenses.v1+json',
        success: function(expenses) {
          success(expenses);
        },
        error: function(xhr, status, err) {
          error(xhr, status, err);
        }
      });
    },
    delete: function(location, success, error) {
      $.ajax({
        type: 'DELETE',
        url: location,
        success: success,
        error: error
      });
    },
    save: function(datetime, amount, description, comment, success, error) {
      $.ajax({
        type:'POST',
        url: '/expense',
        contentType: 'application/vnd.expensapp.expense.v1+json',
        data: JSON.stringify({datetime: datetime, amount: amount, description: description, comment: comment}),
        success: function(data, status, request) {
          var location = request.getResponseHeader('Location');
          success(location);
        },
        error: error
      });
    },
    update: function(location, datetime, amount, description, comment, success, error) {
      $.ajax({
        type:'PUT',
        url: location,
        contentType: 'application/vnd.expensapp.expense.v1+json',
        data: JSON.stringify({datetime: datetime, amount: amount, description: description, comment: comment}),
        success: function(data, status, request) {
          success({location:location, datetime:datetime, amount: amount, description: description, comment: comment});
        },
        error: error
      });
    }
  };
});
