'use strict'

const User = require('../models/user'),
      Session = require('../models/session'),
      responseManager = require('../response/ResponseManager');

/**
 * - API
 */

var removeAllUsers = function(req, res, next) {
    User.remove({}, function(error, users) {
         if (error) {
             responseManager.internalServerError(res, error.message)
         } else {
             responseManager.success(res, next, users, 204)
         }
    })
    User.collection.drop()
};

var getAllUsers = function(req, res, next) {
    User.find(function(error, users) {
         if (error) {
            responseManager.internalServerError(res, error.message)
        } else {
            responseManager.success(res, next, users)
       }
   })
};

var getAllSessions = function(req, res, next) {
    Session.find(function(error, sessions) {
        if (error) {
            responseManager.internalServerError(res, error.message)
        } else {
            responseManager.success(res, next, sessions)
        }
    })
};

module.exports.getAllUsers = getAllUsers;
module.exports.removeAllUsers = removeAllUsers;
module.exports.getAllSessions = getAllSessions;