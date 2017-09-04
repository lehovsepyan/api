'use strict'

const User = require('../../models/user'),
      responseManager = require('../../response/responseManager'),
      Session = require('../../models/session'),
      Config          = require('../../config');


var register = function(req, res) {

    var userObject = {}
    var failedFields = {}
    /* 
        - Required fields
    */
    if (req == undefined || req.body == undefined) {
        return responseManager.badRequest(res, null)
    }
    if (req.body.name != undefined && req.body.name.length > 2) {
        userObject['name'] = req.body.name
    } else {
        failedFields.push('name')
    }
    
    if (req.body.device_id != undefined) {
        userObject['device_id'] = req.body.device_id
    } else {
        failedFields.push('device_id')
    }

    if (failedFields.length != undefined && failedFields.length != 0) {
        return responseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });
    }

    userObject['created'] = Math.floor(Date.now())

    User.findOne({ device_id: userObject.device_id }).select('device_id').select('name').exec(function(error, existingUser) {
        if (existingUser) {
            return responseManager.badRequest(res, { message: 'User already exists', user: existingUser });
        } else {
            var user = new User(userObject)
            user.save(function (err) {
                if (err) 
                    return responseManager.badRequest(res, { message: 'Failed to create a user' });
                return responseManager.success(res, user);
            })
        }
    })
};

var getAll = function(req, res) {
    User.find({}).exec(function(err, result) {
        if (err)
            return responseManager.badRequest(res, { message: err.message });
        return responseManager.success(res, result);
    })
};

module.exports.register = register;
module.exports.getAll = getAll;