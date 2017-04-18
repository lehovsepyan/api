'use strict'

/**
 * Module Dependencies
 */
const _      = require('lodash'),
      errors = require('restify-errors'),
      ResponseObject = require('../response_handlers/responseObject')

/**
 *  Request Handlers
 */
const UserHandler = require('../request_handlers/user')

/**
 * Model Schema
 */
const User = require('../models/user')

/**
 * API Routes
 */

server.get('/', function(req, res) {
    ResponseObject.sendSuccess(res, { message: 'Hello! The API is under construction'})
})

/**
 *  - Public API
 */

server.post('/user', UserHandler.create);

server.post('/login', UserHandler.login)

/**
 * - Authorized API
 */

server.get('api/users', UserHandler.getUsers);