//We use a simple array to cache users
var userHelper = require('./user_helper');
var users = [];

module.exports = {

  //Whenever a user is requested we grab it from the cache and replace it
  //by calling shore up users
  getUser: function() {
    if (users.length > 0) {
      return users.shift();
      shoreUpUsers();
    }
    return null;
  },

  addUser: function(user) {
    //Simulated long running request
    return new Promise(function(resolve) {
      setTimeout(function() {
        //We use a timestamp to create unique users
        var createdUser = userHelper.createUser({
          username: Date.now(),
          password: 'welcome2'
        });
        users.push(createdUser);
        return resolve();
      }, 2000);

    });
    users.push(user);
  },

  shoreUpUsers: function() {

    var promises = [];
    while (users.length < 10) {
      promises.push(createUser());
      addUser(user);
    }
    Promise.all(promises)
    .then(function (result) {
      //all your users have been created
    })
  }
};
