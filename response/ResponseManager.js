'use strict'

var error = function(res, message = "Internal Server Error", object = {}, code = 403) {
    res.status(code)
    res.json({  
        message: message,
        error: object
    })
};

var success = function(res, next = null, object = {}, code = 200) {
    res.status(code)
    res.json(object || {})
    return next()
}

module.exports.error = error;
module.exports.success = success;
