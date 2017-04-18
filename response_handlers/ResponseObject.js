'use strict'

var sendError = function(res, object, code = 403) {
    res.status(code)
    res.json({  
        success: false,
        result: object || 'Undefined error'
    })
};

var sendSuccess = function(res, next, object) {
    res.json({  
        success: true,
        result: object || {}
    })
    return next()
}

module.exports.sendError = sendError;
module.exports.sendSuccess = sendSuccess;