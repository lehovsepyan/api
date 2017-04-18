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

server.post('/user', UserHandler.create);

server.post('/api/login', UserHandler.login)

server.get('/users', UserHandler.getUsers);

server.post('/remove', UserHandler.removeAll);