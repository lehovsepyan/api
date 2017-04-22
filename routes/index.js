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
const UserHandlerV1  = require('../requests/v1/user'),
      AdminHandler = require('../requests/admin') 

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

server.post({path: '/user', version: '1.0.0'}, UserHandlerV1.register)

server.post({path: '/login', version: '1.0.0'}, UserHandlerV1.login)

server.post({path: '/login', version: '2.0.0'}, function(req, res, next) {
      res.json({message: '/login 2.0.0'})
})

/**
 * - Authorized API
 */

server.get({path: '/api/user', version: '1.0.0'}, UserHandlerV1.getUserInfo)

server.put({path: '/api/update', version: '1.0.0'}, UserHandlerV1.update)

server.post({path: '/api/logout', version: '1.0.0'}, UserHandlerV1.logout)

/**
 * - Admin
 */

server.post('/admin/remove', AdminHandler.removeAllUsers)

server.get('/admin/users', AdminHandler.getAllUsers)

server.get('/admin/sessions', AdminHandler.getAllSessions)
