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
        responseManager.badRequestError(res, 'Validation Failed',{fields: failedFields})
        return
    }

    var user = User(userObject);
    user.save(function (error, _) {
        if (error) {
            if (error.code == 11000 || 11001) {
                User.findOne({email: user.email}).select('email').select('name')
                .exec(function(error, existingUser) {
                    if (error) {
                        responseManager.internalServerError(res, error.message)
                    } else {
                        responseManager.badRequestError(res, 'User already exists', { existing_user: existingUser })
                    }
                })
            } else {
                responseManager.internalServerError(res, error.message)
            }
        } else {
            loginWith(req, res, next, 201)
        }
    })
};

var login = function(req, res, next) {
    loginWith(req, res, next)
};

/**
 * - API Functionality
*/

var getUserInfo = function(req, res, next) {
    var userId = jwt.verify(req.headers['x-access-token'], config.secret).id
    User.findOne({_id: userId}).select('email').select('name').exec(function(error, user) {
        if (error) {
            responseManager.internalServerError(res, error.message)
        } else {
            responseManager.success(res, next, user)
        }
    })
};

/**
 * - Local Functionality
 */

var loginWith = function(req, res, next, code = 200) {
    User.findOne({
            email: req.body.email
    }, function(error, user) {
        if (error) {
            responseManager.internalServerError(res, error.message)
        } else if (!user) {
            responseManager.badRequestError(res, 'User not found')
        } else if (user) {
            user.comparePassword(req.body.password, function(error, isMatch) {
                 if (error || !isMatch) {
                    responseManager.badRequestError(res, 'Incorrect password')
                 } else {
                    var token = jwt.sign({ id: user._id }, config.secret, { expiresIn : config.tokenExpiration })
                    user.save(function(error, user, info) {
                        if (error) {
                            responseManager.internalServerError(res, error.message)
                        } else {
                            var userObject = {
                                                name: user.name,
                                                email: user.email,
                                                token: token
                                             }
                            responseManager.success(res, next, userObject, code)
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
