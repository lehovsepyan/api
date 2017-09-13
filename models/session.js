'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified').createdModifiedPlugin,
      responseManager = require('../response/ResponseManager');

var SessionSchema = mongoose.Schema({
    user_id: {
        type: String,
        require: true
    },
    access_token: String
});

var Session = mongoose.model('Session', SessionSchema);

module.exports = Session;