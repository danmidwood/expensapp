define(function (){
  return {
    login : function(username, password, success, invalidCredentials) {
      $.ajax({
        type: 'POST',
        url: '/session',
        contentType: 'application/json',
        data: JSON.stringify({user: username, password: password}),
        success: function(data) {
          var username = data['user'];
          success(username);
        },
        error: function(xhr, status, err) {
          invalidCredentials(xhr, status, err);
        }.bind(this)
      });
    },
    logout: function(success, fail) {
      $.ajax({
        type: 'DELETE',
        url: '/session',
        success: function(data) {
          success();
        },
        error: function(xhr, status, err) {
          fail();
        }
      });
    }
  };
});
