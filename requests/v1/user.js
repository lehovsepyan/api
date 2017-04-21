'use strict'

const User = require('../../models/user'),
      jwt             = require('jsonwebtoken'),
      responseManager = require('../../response/ResponseManager'),
      bcrypt = require('bcrypt'),
      fs = require('fs'),
      path = require("path"),
      config          = require('../../config');

/**
 *  - Authentication
 */

var register = function(req, res, next) {

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
    if (req.body.gender != undefined && ["0", "1"].indexOf(req.body.gender) == -1) {
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
            if (req.files.image) {
                 saveImage(req.files.image.path, function(error, imagePath) {
                    if (error) {
                        responseManager.internalServerError(res, error.message, null, null)
                    } else {
                        userObject['image_url'] = imagePath
                        saveUser(userObject, function() {
                            loginWith(req, res, next, 201)
                        })
                    }
                })
            } else {
                userObject['image_url'] = config.defaultImageUrl
                saveUser(userObject, function() {
                    loginWith(req, res, next, 201)
                })
            }
        }
    })
};

var login = function(req, res, next) {
    loginWith(req, res, next)
};

/**
 * - API Functionality
*/

var update = function(req, res, next) {
    var userId = jwt.verify(req.headers['x-access-token'], config.secret).id
    User.findOne({ _id: userId}, function(error, user) {
        if (error) {
            responseManager.internalServerError(res, error.message, null, null)
        } else {
            if (req.body.email) {
                user.email = req.body.email
            }
            if (req.body.name) {
                user.name = req.body.name
            }
            if (req.body.last_name) {
                user.last_name = req.body.last_name
            }
            if (req.body.phone) {
                user.phone = req.body.phone
            }
            if (req.body.gender) {
                user.gender = req.body.gender
            }
            if (req.body.birthdate) {
                user.birthdate = req.body.birthdate
            }
            if (req.files.image) {
                saveImage(req.files.image.path, function(error, imagePath) {
                    if (!error) {
                        fs.unlinkSync(user.image_url)
                        user.image_url = imagePath
                        user.save()
                        responseManager.success(res, next, user)
                    } 
                })
            } else {
                user.save()
                responseManager.success(res, next, user)
            }
        }
    })
};

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

var saveUser = function(userObject, callback) {
    var user = User(userObject)
    user.save(userObject, function(error, _) {
        if (error) {
            responseManager.internalServerError(res, error.message, null, null)
        } else {
            callback()
        }
    })
};

var saveImage = function(tempImagePath, callback) {
    if (!tempImagePath) {
        callback(null, config.defaultImageUrl)
    } else {
        var fileExt = path.extname(tempImagePath)
        var fileName = Date.now() + fileExt
        var imagePath = process.cwd() + "/images/" + fileName
        fs.rename(tempImagePath, imagePath, function(error) {
            if (error) {
                callback(error, null) 
            } else {
                callback(null, imagePath)
            }
        })
    }
};

module.exports.getUserInfo = getUserInfo;
module.exports.update = update;
module.exports.register = register;
module.exports.login = login;
