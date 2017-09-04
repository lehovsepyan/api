'use strict'

const   UserForDevice = require('../../models/user').userForDevice,
        BasketForCode = require('../../models/basket').basketForCode,
        Basket = require('../../models/basket').Basket,
        BasketItem = require('../../models/basket').BasketItem,
        Member = require('../../models/basket').Member,
        ResponseManager = require('../../response/responseManager'),
        RandomString = require("randomstring");


var create = function(req, res) {   

    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'Unauthorized user' });
       
        // - Logic goes here
        var failedFields = []        
        if (req.body.name == undefined)
            failedFields.push('name');
        if (req.body.color_index == undefined)
            failedFields.push('color_index');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        var member = {
                name: req.body.name,
                device_id: req.headers.device_id
        }
        
        var basketObject = {
            owner_id: req.headers.device_id,
            name: req.body.name,
            color_index:  req.body.color_index,
            created: Math.floor(Date.now()),
            members: [member],
            code: RandomString.generate(7)
        }

        var basket = new Basket(basketObject)
        basket.save(function (err) {
            if (err) 
                return ResponseManager.badRequest(res, { message: err.message });
            return ResponseManager.success(res, basket);
        })

        // -------------------
    })
};

var join = function(req, res) {
    
    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'Unauthorized user' });
       
    // - Logic goes here
        var failedFields = []
        if (req.body.code == undefined)
            failedFields.push('code');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        BasketForCode(req.body.code, function(basket) {
            if (basket == undefined || basket == null)
                return ResponseManager.badRequest(res, { message: 'Invalid code' });

            if (basket.owner_id == user.device_id)
                return ResponseManager.badRequest(res, { message: 'You can\'t joint your own basket' });

            for (var i = 0; i < basket.members.length; i++) {
                var member = basket.members[i]
                if (member.device_id == user.device_id)
                    return ResponseManager.badRequest(res, { message: 'This basket is already in your list' });
            }

            var member = {
                name: user.name,
                device_id: user.device_id
            }
            basket.members.push(member)
            basket.save(function (err) {
                if (err)
                    return ResponseManager.badRequest(res, { message: err.message });
                return ResponseManager.success(res, basket);
            })
        })
    // ---------------
    })
};

module.exports.create = create;
module.exports.join = join;

/**
 * - Admin
 */

var getAll = function(req, res) {
    Basket.find({}).exec(function(err, result) {
        if (err)
            return ResponseManager.badRequest(res, { message: err.message });
        return ResponseManager.success(res, result);
    })
};

var removeAll = function(req, res) {

    Basket.remove({}).exec(function(err, result) {
        if (err)
            return ResponseManager.badRequest(res, { message: err.message });
        return ResponseManager.success(res, { message: 'All baskets successfully removed' });
    })
};

module.exports.getAll = getAll;
module.exports.removeAll = removeAll;
