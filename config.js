'use strict'

module.exports = {
    name: 'API',
    versions: ['1.0.0', '2.0.0'],
    tokenExpiration: 14400, // seconds
    secret: 'this_is_the_secret',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        uri: 'mongodb://127.0.0.1:27017/api',
    },
    defaultImageUrl: 'lalala.com'
}