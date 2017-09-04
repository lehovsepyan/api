'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified').createdModifiedPlugin;

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    device_id: {
        type: String,
        require: true,
        index: {
            unique: true
        }
    },
    created: {
        type: Number,
        require: true
    },
    notif_token: {
        type: String,
        require: false
    }
})

var User = mongoose.model('User', UserSchema);
module.exports = User;

/**
 * - Private
 */
var userForDevice = function(deviceId, callback) {
    if (deviceId == undefined) {
        return callback(null);
    }
    User.findOne( { device_id: deviceId } ).select('notif_token device_id name created').exec(function(err, user) {
         return callback(user);
    }) 
 };

 module.exports.userForDevice = userForDevice;