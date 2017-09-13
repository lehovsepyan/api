'use strict'

const User = require('../../models/user'),
      UserForDevice = require('../../models/user').userForDevice,
      ResponseManager = require('../../response/responseManager');


var register = function(req, res) {

    var userObject = {}
    var failedFields = []
    /* 
        - Required fields
    */
    if (req == undefined || req.body == undefined) {
        return ResponseManager.badRequest(res, null)
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
        return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });
    }

    userObject['created'] = Math.floor(Date.now())

    User.findOne({ device_id: userObject.device_id }).select('device_id').select('name').exec(function(error, existingUser) {
        if (existingUser) {
            return ResponseManager.badRequest(res, { message: 'User already exists', user: existingUser });
        } else {
            var user = new User(userObject)
            user.save(function (err) {
                if (err) 
                    return ResponseManager.badRequest(res, { message: err.message });
                return ResponseManager.success(res, user);
            })
        }
    })
};

var registerToken = function(req, res) {
    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.unauthorized(res, { message: 'Unauthorized user' });

    var failedFields = []

    if (req.body.token == undefined)
        failedFields.push('token')
    if (failedFields.length != undefined && failedFields.length != 0)
        return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });


    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.unauthorized(res, { message: 'Unauthorized user' });
        user.notif_token = req.body.token
        user.save(function(err) {
            if (err)
                return ResponseManager.internalError(res, { message: err.message });
            return ResponseManager.success(res, user);
        })
    })
};


module.exports.register = register;
module.exports.registerToken = registerToken;

/**
 * - Admin
 */

var getAll = function(req, res) {
    User.find({}).exec(function(err, result) {
        if (err)
            return ResponseManager.badRequest(res, { message: err.message });
        return ResponseManager.success(res, result);
    })
};

var removeAll = function(req, res) {
    User.remove({}).exec(function(err, result) {
        if (err)
            return ResponseManager.badRequest(res, { message: err.message });
        return ResponseManager.success(res, { message: 'All messages removed successfully' });
    })
};

module.exports.getAll = getAll;
module.exports.removeAll = removeAll;