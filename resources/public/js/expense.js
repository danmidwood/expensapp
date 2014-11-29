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
    }
  };
});
