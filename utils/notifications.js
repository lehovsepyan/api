'use strict'

const   FireBase = require('firebase'),
        FCM = require('fcm-push');

const serverKey = 'AAAAJ6FEKYY:APA91bGAzYiQRiRDp5Xer1kDf04EC53qatrAstqkz7MaPQO-m280zWN_quZi9QjUynJZfz1mbOYBMnvfhDob_9ly-YpfxMLn6_BwhklAeerICH5xT7Gvf9ztvrnfDaZ3pZDg9waZFMYB';

var sendNotification = function(token, title, message, object) {

    var message = {  
        to : token,
        priority : "high",
        data : object,
        notification : {
            title : title,
            body : message,
            sound: "default"
        }
    };
    var fcm = new FCM(serverKey);
    fcm.send(message, function(err,response){  
        if(err) {
        //    console.log("Something has gone wrong !");
        } else {
        //    console.log("Successfully sent with resposne :", response);
        }
    });
};

module.exports.sendNotification = sendNotification;

/**
 * - Baskets
 */

// case basketDelete = 0
// case basketJoin = 1
// case itemAdd = 2
// case itemRemove = 3
// case itemDone = 4

var sendNotificationForJoin = function(user, basket) {

    if (basket == undefined || user == undefined)
        return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = basket.name;
        var message = user.name + ' joined !';
        var notifObject = {
            basket_id: basket._id,
            type_id: 1
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }
    
};

var sendNotificationForAdd = function(user, item, basket) {

    if (basket == undefined || user == undefined || item == undefined)
        return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = basket.name;
        var message = user.name + ' added ' + item.name + ' !';
        var notifObject = {
            basket_id: basket._id,
            type_id: 2
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }
};

var sendNotificationForDone = function(user, item, basket) {
    
    if (basket == undefined || user == undefined || item == undefined)
        return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = basket.name;
        var message = user.name + ' just bought ' + item.name +'!';
        var notifObject = {
            basket_id: basket._id,
            type_id: 4
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }
};

var sendNotificationForRemove = function(user, item, basket) {
    
    if (basket == undefined || user == undefined || item == undefined)
        return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = basket.name;
        var message = user.name + ' just removed ' + item.name +' !';
        var notifObject = {
            basket_id: basket._id,
            type_id: 3
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }
};

var sendNotificationForBasketDelete = function(user, basket) {

    if (basket == undefined || user == undefined )
         return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = basket.name;
        var message = user.name + ' deleted ' + basket.name +' !';
        var notifObject = {
            basket_id: basket._id,
            type_id: 0
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }

};

 module.exports.sendNotificationForJoin = sendNotificationForJoin;
 module.exports.sendNotificationForAdd = sendNotificationForAdd;
 module.exports.sendNotificationForDone = sendNotificationForDone;
 module.exports.sendNotificationForRemove = sendNotificationForRemove;
 module.exports.sendNotificationForBasketDelete = sendNotificationForBasketDelete;
