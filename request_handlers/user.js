'use strict'

const User = require('../models/user'),
      jwt            = require('jsonwebtoken'),
      ResponseObject = require('../response_handlers/ResponseObject'),
      Config         = require('../config');

/**
 *  - Authentication
 */

var create = function(req, res, next) {
    var userObject = {}
    var failedFields = []

    if (req.body.password != undefined) {
        userObject['password'] = req.body.password
    } else {
        failedFields.push('password')
    }
    if (req.body.email != undefined) {
        userObject['email'] = req.body.email
    } else {
        failedFields.push('email')
    }
    if (req.body.name != undefined) {
        userObject['name'] = req.body.name
    } else {
       failedFields.push('name')
    }

    if (failedFields.length != 0) {
        ResponseObject.sendError(res, {
            error_fields: failedFields
        })
        return
    }

    var user = User(userObject);
    user.save(function (error, user) {
        if (error) {
            ResponseObject.sendError(res, error)
        } else {
            loginWith(req, res, next)
        }
    })
};

var login = function(req, res, next) {
    loginWith(req, res, next)
};

/**
 * - API Functionality
*/

var getUsers = function(req, res, next) {
    User.find(function(error, users) {
         if (error) {
            ResponseObject.sendError(res, error)
         } else {
            ResponseObject.sendSuccess(res, next, users)
         }
    })
};

var removeAll = function(req, res, next) {
    User.remove({}, function(error, users) {
         if (error) {
            ResponseObject.sendError(res, error)
         } else {
            ResponseObject.sendSuccess(res, next, null)
         }
    })
};

/**
 * - Local Functionality
 */

var loginWith = function(req, res, next) {
    User.findOne({
            email: req.body.email
    }, function(error, user) {
        if (error) {
            ResponseObject.sendError(res, error)
        } else if (!user) {
            ResponseObject.sendError(res, 'Authentication failed. User not found.')
        } else if (user) {
            user.comparePassword(req.body.password, function(error, isMatch) {
                 if (error || !isMatch) {
                      ResponseObject.sendError(res, 'Authentication failed. Wrong password.')
                 } else {
                     var token = jwt.sign(user, Config.secret)
                     ResponseObject.sendSuccess(res, next, {
                                                    name: user.name,
                                                    email: user.email,
                                                    token: token
                     })
                 }
            });
        }
     })
};

module.exports.create = create;
module.exports.login = login;
module.exports.getUsers = getUsers;
module.exports.removeAll = removeAll;
