'use strict'

/**
 * Module Dependencies
 */
const _      = require('lodash'),
      errors = require('restify-errors'),
      responseManager = require('../response/responseManager'),
      Session = require('../models/session');

/**
 *  Request Handlers
 */
const UserHandlerV1 = require('../requests/v1/user');
const BasketHandlerV1 = require('../requests/v1/basket');

/**
 * Model Schema
 */
const UserModel = require('../models/user');

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

server.put('v1/user/token', UserHandlerV1.registerToken);

/**
 * - Authorized API
 */

 server.post('v1/basket', BasketHandlerV1.create);

 server.post('v1/basket/join', BasketHandlerV1.join);

 server.post('v1/basket/add', BasketHandlerV1.add);

 server.put('v1/basket/item/done', BasketHandlerV1.done);

 server.put('v1/basket/item/remove', BasketHandlerV1.remove);

/**
 *  - Admin
 */

server.post('/db/drop', function(req, res) {
      Session.db.dropDatabase(function(err) {
              if(err) 
                return responseManager.badRequest(res, { message: err.message });
              return responseManager.success(res, { message: 'Database dropped successfully' });
      })
});

server.get('/users', UserHandlerV1.getAll);

server.post('/users/remove', UserHandlerV1.removeAll);

server.get('/baskets', BasketHandlerV1.getAll);

server.post('/baskets/remove', BasketHandlerV1.removeAll);