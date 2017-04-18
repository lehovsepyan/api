'use strict'

/**
 * Module Dependencies
 */
const _      = require('lodash'),
      errors = require('restify-errors'),
      responseManager = require('../response/ResponseManager')

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
    responseManager.success(res, { message: 'Hello! The API is under construction'})
})

/**
 *  - Public API
 */

server.post('/user', UserHandler.create)

server.post('/login', UserHandler.login)

/**
 * - Authorized API
 */

server.get('api/user', UserHandler.getUserInfo)

server.get('api/users', UserHandler.getUsers)


/**
 * - Temp
 */

server.post('/admin/remove', UserHandler.removeAll)