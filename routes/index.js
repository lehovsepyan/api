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
const UserHandler  = require('../request/user'),
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

server.post('/user', UserHandler.create)

server.post('/login', UserHandler.login)

/**
 * - Authorized API
 */

server.get('/api/user', UserHandler.getUserInfo)

/**
 * - Admin
 */

server.post('/admin/remove', AdminHandler.removeAllUsers)

server.get('/admin/users', AdminHandler.getAllUsers)
