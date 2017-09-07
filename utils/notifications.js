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
            body : message
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

var sendNotificationForJoin = function(user, basket) {

    if (basket == undefined || user == undefined)
        return;
    var members = basket.members
    if (members == undefined || members.length == undefined) 
        return;

    for (var i = 0; i < members.length - 1; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = '';
        var message = user.name + ' joined to ' + basket.name + ' basket!';
        var notifObject = {
            basket_id: basket._id
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

    for (var i = 0; i < members.length - 1; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = '';
        var message = user.name + ' added ' + item.name + ' to ' + basket.name + '!';
        var notifObject = {
            basket_id: basket._id
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

    for (var i = 0; i < members.length - 1; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = '';
        var message = user.name + ' just bought ' + item.name +'!';
        var notifObject = {
            basket_id: basket._id
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

    for (var i = 0; i < members.length - 1; i++) {
        var member = members[i];
        if (member.notif_token == undefined || member.device_id == user.device_id)
            continue;

        var title = '';
        var message = user.name + ' just removed ' + item.name +' from ' + basket.name + '!';
        var notifObject = {
            basket_id: basket._id
        };

        sendNotification(member.notif_token, title, message, notifObject);
    }
};

 module.exports.sendNotificationForJoin = sendNotificationForJoin;
 module.exports.sendNotificationForAdd = sendNotificationForAdd;
 module.exports.sendNotificationForDone = sendNotificationForDone;
 module.exports.sendNotificationForRemove = sendNotificationForRemove;