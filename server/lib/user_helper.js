var _ = require('lodash');
var util = require('util');
var uuid = require('node-uuid');

var users = [];
module.exports = {

  getUser: function(userId) {
    var foundUser = _.find(users, function(user) {
      return user.id === userId;
    });

    return foundUser;
  },

  getUserByName: function(username) {
    var foundUser = _.find(users, function(user) {
      return user.username === username;
    });

    return foundUser;

  },

  createUser: function(userInfo) {
    var requiredFields = [ 'username', 'password'];
    var missingFields = [];
    requiredFields.forEach(function(field) {
      if (!userInfo[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return {
        message: 'Cannot create user without the following fields ' + util.inspect(missingFields)
      };
    };

    var existingUser = module.exports.getUserByName(userInfo.username);
    if (existingUser) {
      return {
        message: 'User already exists'
      };
    }

    var newUser = _.cloneDeep(userInfo);
    newUser.id = uuid.v4();
    users.push(newUser);

    return newUser;
  },

  createWidget: function(userId, widgetInfo) {
    let user = module.exports.getUser(userId);
    if (!user) {
      return {
        message: `cannot create widget for user ${userId}`
      };
    }
    if (!widgetInfo.widgetType) {
      return {
        message: 'Cannot create widget without widget type'
      };
    }

    widgetInfo.id = uuid.v4();
    if (!user.widgets) {
      user.widgets = [widgetInfo];
    } else {
      user.widgets.push(widgetInfo);
    }
    return widgetInfo;
  }

};
