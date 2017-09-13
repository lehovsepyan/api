'use strict'



var badRequest = function(res, object) {
    res.status(400);
    var responseObject = {
        error: object || { message: 'Invalid request' }
    }
    res.json(responseObject)
};

var success = function(res, object) {
    res.status(200);
    var responseObject = {
        result:  object || {}
    }
    res.json(responseObject)
};

var internalError = function(res, object) {
    res.status(500);
    var responseObject = {
        error: object || {message: 'Internal server error'}
    }
    res.json(responseObject)
};

module.exports.badRequest = badRequest;
module.exports.internalError = internalError;
module.exports.success = success;
