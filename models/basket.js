'use strict'

const mongoose = require('mongoose'),
      mongooseApiQuery = require('mongoose-api-query'),
      createdModified = require('mongoose-createdmodified').createdModifiedPlugin;

var BasketSchema = new mongoose.Schema({
    owner_id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    color_index: {
        type: Number,
        require: true
    },
    members: [
        {
            name: { 
                type: String, 
                require: true 
            },
            device_id: {
                type: String,
                require: true
            }
        }
    ],
    items: [
        {
            name: {
                type: String,
                require: true
            },
            type: {
                type: Number,
                require: true
            },
            quantity: {
                type: Number,
                require: true
            },
            status: {
                type: Number,
                require: true
            },
            created: {
                type: Number,
                require: true
            },
            completed: {
                type: Number,
                require: false
            }
        }
    ],
    code: {
        type: String,
        require: true
    },
    created: {
        type: Number,
        require: true
    }
});

var Basket = mongoose.model('Basket', BasketSchema);

module.exports.Basket = Basket;

/**
 * - Private
 */
var basketForCode = function(code, callback) {
    if (code == undefined) {
        return callback(null);
    }
    Basket.findOne( { code: code } ).select('owner_id name color_index members items code created').exec(function(err, basket) {
         return callback(basket);
    }) 
 };

 module.exports.basketForCode = basketForCode;