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
    notif_token: String
})

module.exports = mongoose.model('User', UserSchema);