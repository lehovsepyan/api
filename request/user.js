'use strict'

const User = require('../models/user'),
      jwt             = require('jsonwebtoken'),
      responseManager = require('../response/ResponseManager'),
      bcrypt = require('bcrypt'),
      config          = require('../config');

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
        responseManager.error(res, 'Validation Failed', {fields: failedFields})
        return
    }

    var user = User(userObject);
    user.save(function (error, user) {
        if (error) {
            if (error.code == 11000) {
                var existingUser = error.getOperation()
                responseManager.error(res, 'User already exists', {
                    existing_user: {
                        name: existingUser.name,
                        email: existingUser.email
                    }
                })
            } else {
                responseManager.error(res)
            }
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
             responseManager.error(res, error)
        } else {
            responseManager.success(res, next, users)
       }
   })
};

var removeAll = function(req, res, next) {
    User.remove({}, function(error, users) {
         if (error) {
             responseManager.error(res, error)
         } else {
             responseManager.success(res, next, users, 201)
         }
    })
};

var getUserInfo = function(req, res, next) {
    var userId = jwt.verify(req.headers['x-access-token'], config.secret).id
    User.findOne({_id: userId}).select('email').select('name').exec(function(error, user) {
        if (error) {
            responseManager.error(res)
        } else {
            responseManager.success(res, next, user)
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
            responseManager.error(res, error)
        } else if (!user) {
            responseManager.error(res, 'Authentication failed. User not found.')
        } else if (user) {
            user.comparePassword(req.body.password, function(error, isMatch) {
                 if (error || !isMatch) {
                     responseManager.error(res, 'Authentication failed. Wrong password.', error || {})
                 } else {
                    var token = jwt.sign({ id: user._id }, config.secret, { expiresIn : config.tokenExpiration })
                    user.save(function(error, user, info) {
                        if (error) {
                            responseManager.error(res)
                        } else {
                            responseManager.success(res, next, {
                                                    name: user.name,
                                                    email: user.email,
                                                    token: token
                            })
                        }
                    })
                 }
            });
        }
     })
};

module.exports.getUserInfo = getUserInfo;
module.exports.create = create;
module.exports.login = login;
module.exports.getUsers = getUsers;
module.exports.removeAll = removeAll;
