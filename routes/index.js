'use strict'

/**
 * Module Dependencies
 */
const _      = require('lodash'),
      errors = require('restify-errors'),
      responseManager = require('../response/responseManager'),
      Session = require('../models/session')

/**
 *  Request Handlers
 */
const UserHandlerV1 = require('../requests/v1/user')

/**
 * Model Schema
 */
const UserModel = require('../models/user')

/**
 * API Routes
 */

server.get('/', function(req, res) {
    responseManager.success(res,  { message: 'Hello! The API is under construction' })
})

/**
 *  - Public API
 */

server.post('v1/user', UserHandlerV1.register);

/**
 *  - Admin
 */

server.post('/db/drop', function(req, res) {
      Session.db.dropDatabase(function(err) {
              if(err) 
                return responseManager.badRequest(res, { message: err.message });
              return responseManager.success(res, { message: 'Database dropped successfully'});
      })
});

server.get('/users', UserHandlerV1.getAll);