'use strict'

var sendError = function(res, object) {
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