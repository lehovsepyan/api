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
    if (req.body.gender != undefined && [0, 1].indexOf(req.body.gender) == -1) {
         failedFields.push('gender')
    }

    if (failedFields.length != 0) {
        responseManager.badRequestError(res, 'Validation Failed', null, { fields: failedFields })
        return
    }

    userObject['gender'] = req.body.gender
    userObject['name'] = req.body.name
    userObject['last_name'] = req.body.last_name
    userObject['birthdate'] = req.body.birthdate
    userObject['phone'] = req.body.phone
    userObject['image_url'] = config.defaultImageUrl

    User.findOne({ email: userObject.email }).select('email').select('name').exec(function(error, existingUser) {
        if (existingUser) {
            responseManager.conflictError(res, 'User already exists', 'User already exists', { existing_user: existingUser})
        } else {
            var user = User(userObject)
            user.save(userObject, function(error, _) {
                if (error) {
                    responseManager.internalServerError(res, error.message, null, null)
                } else {
                    loginWith(req, res, next, 201)
                }
            })
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

    User.find({ _id: userId }, 'email name last_name phone gender birthdate image_url').exec(function(error, user) {
        if (error) {
            responseManager.internalServerError(res, error.message, null, null)
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
            responseManager.internalServerError(res, error.message, null, null)
        } else if (!user) {
            responseManager.badRequestError(res, 'User not found', 'User not found', null)
        } else if (user) {
            user.comparePassword(req.body.password, function(error, isMatch) {
                 if (error || !isMatch) {
                     responseManager.badRequestError(res, 'Incorrect password', 'Incorrect password', null)
                 } else {
                    var token = jwt.sign({ id: user._id }, config.secret, { expiresIn : config.tokenExpiration })
                    user.save(function(error, user, info) {
                        if (error) {
                            responseManager.internalServerError(res, error.message, null, null)
                        } else {
                            var userObject = {
                                                name: user.name,
                                                last_name: user.last_name,
                                                phone: user.phone,
                                                birthdate: user.birthdate,
                                                gender: user.gender,
                                                image_url: user.image_url || config.defaultImageUrl,
                                                email: user.email,
                                                created: user.created,
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
