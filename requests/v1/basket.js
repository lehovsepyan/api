'use strict'

const   UserForDevice = require('../../models/user').userForDevice,
        BasketForCode = require('../../models/basket').basketForCode,
        BasketForId = require('../../models/basket').basketForId,
        Basket = require('../../models/basket').Basket,
        BasketItem = require('../../models/basket').BasketItem,
        Member = require('../../models/basket').Member,
        ResponseManager = require('../../response/responseManager'),
        RandomString = require("randomstring"),
        SendJoinedNotification = require('../../utils/notifications').sendNotificationForJoin,
        SendAddedNotification = require('../../utils/notifications').sendNotificationForAdd,
        SendDoneNotification = require('../../utils/notifications').sendNotificationForDone,
        SendRemoveNotification = require('../../utils/notifications').sendNotificationForRemove,
        SendBasketDeleteNotification = require('../../utils/notifications').sendNotificationForBasketDelete;


var getWithId = function(req, res) {
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here

        var failedFields = []
        if (req.params.basket_id == undefined)
            failedFields.push('basket_id');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        Basket.findOne({ _id: req.params.basket_id }).exec(function(err, result) {
            if (err)
                return ResponseManager.badRequest(res, { message: err.message });
            return ResponseManager.success(res, result);
        })
        // -------------------
    })
};

var removeBasketWithId = function(req, res) {
    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
    
    // - Logic goes here
        var failedFields = []
        if (req.body.basket_id == undefined)
            failedFields.push('basket_id');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        BasketForId(req.body.basket_id, function(basket) {
            if (basket == undefined || basket == null)
                return ResponseManager.badRequest(res, { message: 'Basket not found' });
            if (basket.owner_id != user.device_id)
                return ResponseManager.badRequest(res, { message: 'Only owner can delete the basket' });

            Basket.findOneAndRemove({ _id: req.body.basket_id }, function(err){
                if (err) 
                    return ResponseManager.badRequest(res, { message: err.message });

                SendBasketDeleteNotification(user, basket);
                return ResponseManager.success(res, {});
            });
        });
    // ---------------
    })
};

var create = function(req, res) {   

    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here
        var failedFields = []        
        if (req.body.name == undefined)
            failedFields.push('name');
        if (req.body.color_index == undefined)
            failedFields.push('color_index');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        var member = {
                name: user.name,
                device_id: req.headers.device_id,
                notif_token: user.notif_token
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
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
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
                device_id: user.device_id,
                notif_token: user.notif_token
            }
            basket.members.push(member)
            basket.save(function (err) {
                if (err)
                    return ResponseManager.badRequest(res, { message: err.message });

                SendJoinedNotification(user, basket);
                return ResponseManager.success(res, basket);
            })
        })
    // ---------------
    })
};

var add = function(req, res) {

    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here

        var failedFields = []    
        if (req.body.basket_id == undefined)
            failedFields.push('basket_id');
        if (req.body.name == undefined)
            failedFields.push('name');
        if (req.body.type == undefined)
            failedFields.push('type');
        // if (req.body.quantity == undefined)
        //     failedFields.push('quantity');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        BasketForId(req.body.basket_id, function(basket){
            if (basket == undefined || basket == null)
                return ResponseManager.badRequest(res, { message: 'Invalid basket_id' });

            var itemObject = {
                name: req.body.name,
                type: req.body.type,
                quantity: req.body.quantity,
                created: Math.floor(Date.now()),
                creator_id: user.device_id,
                status: 0
            }

            basket.items.splice(0, 0, itemObject)
            basket.save(function (err, basket) {
                if (err)
                    return ResponseManager.badRequest(res, { message: err.message });
                for (var i = 0; i < basket.items.length; i++) {
                    if (basket.items[i].created == itemObject.created) {
                        SendAddedNotification(user, itemObject, basket);
                        return ResponseManager.success(res, basket.items[i]);
                    }
                }
                return ResponseManager.badRequest(res, { message: 'Could not complete operation' });
            })
        })
        // -------------------
    })
};

var done = function(req, res) {

    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here

        var failedFields = []    
        if (req.body.basket_id == undefined)
            failedFields.push('basket_id');
        if (req.body.item_id == undefined)
            failedFields.push('item_id');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        BasketForId(req.body.basket_id, function(basket){
            if (basket == undefined || basket == null)
                return ResponseManager.badRequest(res, { message: 'Invalid basket_id' });

            var item
            for (var i = 0; i < basket.items.length; i++) {
                item = basket.items[i]
                if (item._id == req.body.item_id) {
                    if (item.status == 0) {
                        item.status = 1
                        break;
                    } else {
                        return ResponseManager.badRequest(res, { message: 'Item is already bought!' });
                    }
                }
            }
            
            basket.save(function (err) {
                if (err)
                    return ResponseManager.badRequest(res, { message: err.message });
                SendDoneNotification(user, item, basket);
                return ResponseManager.success(res, {});
            })
        })
        // -------------------
    })
};

var remove = function(req, res) {

    if (req == undefined || req.body == undefined)
        return ResponseManager.badRequest(res, null);
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here

        var failedFields = []    
        if (req.body.basket_id == undefined)
            failedFields.push('basket_id');
        if (req.body.item_id == undefined)
            failedFields.push('item_id');
        if (failedFields.length != undefined && failedFields.length != 0) 
            return ResponseManager.badRequest(res, { message: 'Validation Failed', fields: failedFields });

        BasketForId(req.body.basket_id, function(basket){
            if (basket == undefined || basket == null)
                return ResponseManager.badRequest(res, { message: 'Invalid basket_id' });

            var item
            var index = -1
            for (var i = 0; i < basket.items.length; i++) {
                item = basket.items[i]
                if (item._id == req.body.item_id) {
                    index = i
                    break
                }
            }
            if (index == -1)
                return ResponseManager.badRequest(res, { message: 'Item not found' });

            basket.items.splice(index, 1)
            basket.save(function (err) {
                if (err)
                    return ResponseManager.badRequest(res, { message: err.message });
                SendRemoveNotification(user, item, basket);
                return ResponseManager.success(res, {});
            })
        })
        // -------------------
    })
};

var getForUser = function(req, res) {
    
    if (req.headers == undefined || req.headers.device_id == undefined)
        return ResponseManager.badRequest(res, { message: 'Unauthorized user' });

    UserForDevice(req.headers.device_id, function(user) {
        if (user == undefined || user == null)
            return ResponseManager.badRequest(res, { message: 'User not found' });
       
        // - Logic goes here

        Basket.find({ members: { $elemMatch: { device_id: user.device_id} } }).sort({ created : -1 }).exec(function(err, result) {
            if (err)
                return ResponseManager.badRequest(res, { message: err.message });
            return ResponseManager.success(res, result);
        })
        // -------------------
    })
};

module.exports.create = create;
module.exports.join = join;
module.exports.add = add;
module.exports.done = done;
module.exports.remove = remove;
module.exports.getForUser = getForUser;
module.exports.getWithId = getWithId;
module.exports.removeBasketWithId = removeBasketWithId;

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
