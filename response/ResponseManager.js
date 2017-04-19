'use strict'

var badRequestError = function(res, message = 'Bad Request', details = {}) {
    res.status(400)
    res.json({  
        message: message,
        user_message: 'Something went wrong',
        details: details 
    })
};

var internalServerError = function(res, message = 'Internal Server Error', details = {}) {
    res.status(500)
    res.json({
        message: message,
        user_message: 'Something wrong happened. Please try later',
        details: details
    })
};

var unauthorizedError = function(res) {
    res.status(401)
    res.json({
        message: 'Unauthorized',
        user_message: 'Wrong credentials provided',
        details: {}
    })
};

var tokenExpiredError = function(res) {
    res.status(411)
    res.json({
        message: 'Unauthorized',
        user_message: 'Session expired',
        details: {}
    })
};

var notFoundError = function(res) {
    res.status(404)
    res.json({
        message: 'Not Found',
        user_message: 'No resource matches the requested URI',
        details: {}
    })
};

var conflictError = function(res, message) {
    res.status(409)
    res.json({
        message: message,
        user_message: 'Already exists',
        details: {}
    })
};

var success = function(res, next = null, object = {}, code = 200) {
    res.status(code || 200)
    res.json(object)
    return next()
};

module.exports.badRequestError = badRequestError;
module.exports.internalServerError = internalServerError;
module.exports.unauthorizedError = unauthorizedError;
module.exports.tokenExpiredError = tokenExpiredError;
module.exports.notFoundError = notFoundError;
module.exports.conflictError = conflictError;
module.exports.success = success;