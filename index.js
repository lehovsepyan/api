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
      responseManager = require('./response/ResponseManager'),
      semver = require('semver');

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
    versions : config.versions,
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

server.pre(function(req, res, next) {
    var pieces = req.url.replace(/^\/+/, '').split('/')
    var api = pieces[0]
    var version = pieces[1]
    if (api != undefined && version != undefined) {
        var replacedVersion
        if (!semver.valid(version)) {
            replacedVersion = version.replace(/v(\d{1})/, '$1.0.0')
        }

        if (semver.valid(replacedVersion) && server.versions.indexOf(replacedVersion) > -1) {
            req.url = req.url.replace(version + '/', '')
            req.headers['accept-version'] = version;
            return next()
        } else {
            return responseManager.badRequestError(res, 'Invalid Version Specifier')
        }
    } else {
        return next()
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