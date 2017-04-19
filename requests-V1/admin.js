'use strict'

const User = require('../models/user'),
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
            esponseManager.internalServerError(res, error.message)
        } else {
            responseManager.success(res, next, users)
       }
   })
};

module.exports.getAllUsers = getAllUsers;
module.exports.removeAllUsers = removeAllUsers;