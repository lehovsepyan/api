'use strict'

/**
 * Module Dependencies
 */
const config          = require('./config'),
      restify         = require('restify'),
      bunyan          = require('bunyan'),
      winston         = require('winston'),
      jwt             = require('jsonwebtoken'),
      bunyanWinston   = require('bunyan-winston-adapter'),
      mongoose        = require('mongoose'),
      responseManager = require('./response/ResponseManager')

/**
 * Logging
 */
global.log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'info',
            timestamp: () => {
                return new Date().toString()
            },
            json: true
        }),
    ]
})

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name    : config.name,
    version : config.version,
    log     : bunyanWinston.createAdapter(log),
})

/**
 * Middleware
 */
 server.use(restify.jsonBodyParser({ mapParams: true }))
 server.use(restify.acceptParser(server.acceptable))
 server.use(restify.queryParser({ mapParams: false }))
 server.use(restify.fullResponse())
 server.use(restify.authorizationParser())

 server.use(function(req, res, next) {

     if (req.url.indexOf('api/') == -1) {
        next();
     } else {
        var token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, config.secret, function(error, decoded) {
                if (error) {
                    responseManager.tokenExpiredError(res)
                } else {
                    req.decoded = decoded;    
                    next();
                }
            })
        } else {
            responseManager.unauthorizedError(res)
        }
     }
})

/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    log.error(err.stack)
    res.send(err)
});

/**
 * Lift Server, Connect to DB & Bind Routes
 */
server.listen(config.port, function() {

    mongoose.connection.on('error', function(err) {
        log.error('Mongoose default connection error: ' + err)
        process.exit(1)
    })

    mongoose.connection.on('open', function(err) {

        if (err) {
            log.error('Mongoose default connection error: ' + err)
            process.exit(1)
        }

        log.info(
            '%s v%s ready to accept connections on port %s in %s environment.',
            server.name,
            config.version,
            config.port,
            config.env
        )

        require('./routes')

    })

    global.db = mongoose.connect(config.db.uri)

})