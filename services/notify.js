'use strict';

const request = require('request-promise');
const config  = require('../config');
const log     = require('./log');

module.exports = {
  firebase: firebase
}

const url = process.env.NODE_ENV !== 'production' && global.TEST_MODE && global.firebaseUrl
  ? global.firebaseUrl
  : 'https://fcm.googleapis.com';

function firebase(deviceToken, body, data, sound) {
  let notification = { body: body };
  if( sound ) {
    notification.sound = 'default'
  }
  return request.post(`${url}/fcm/send`, {
    headers: {
      'Authorization': `key=${config.firebaseKey}`,
    },
    body: {
      to: deviceToken,
      notification: notification,
      priority: 'high', //http://stackoverflow.com/questions/37899712/fcm-background-notifications-not-working-in-ios
      data: data,
    },
    json: true,
  }).catch(function(err) {
    log.error({err: err});
  })
}
