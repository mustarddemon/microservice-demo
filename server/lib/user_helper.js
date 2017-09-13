const _ = require('lodash');
const util = require('util');
const uuid = require('node-uuid');

let users = [];
module.exports = {

  getUser: function(userId) {
    let foundUser = _.find(users, function(user) {
      return user.id === userId;
    });

    return foundUser;
  },

  getUserByName: function(username) {
    let foundUser = _.find(users, function(user) {
      return user.username === username;
    });

    return foundUser;

  },

  createUser: function(userInfo) {
    let requiredFields = [ 'username', 'password'];
    let missingFields = [];
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

    let existingUser = module.exports.getUserByName(userInfo.username);
    if (existingUser) {
      return {
        message: 'User already exists'
      };
    }

    let newUser = _.cloneDeep(userInfo);
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
