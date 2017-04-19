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
const UserHandlerV1  = require('../request/user'),
      AdminHandler = require('../request/admin') 

/**
 * Model Schema
 */
const User = require('../models/user')

/**
 * API Routes
 */

server.get('/', function(req, res) {
    responseManager.success(res, null, { message: 'Hello! The API is under construction'}, 200)
})

/**
 *  - Public API
 */

server.post('/user', UserHandlerV1.create)

server.post('/login', UserHandlerV1.login)

/**
 * - Authorized API
 */

server.get({path: '/api/user', version: '1.0.0'}, UserHandlerV1.getUserInfo)

/**
 * - Admin
 */

server.post('/admin/remove', AdminHandler.removeAllUsers)

server.get('/admin/users', AdminHandler.getAllUsers)
