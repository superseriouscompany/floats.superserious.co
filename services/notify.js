'use strict';

const request = require('request-promise');
const config  = require('../config');
const log     = require('./log');

module.exports = {
  firebase: firebase
}

function firebase(deviceToken, body, stubUrl) {
  const url = stubUrl || 'https://fcm.googleapis.com';

  return request.post(`${url}/fcm/send`, {
    headers: {
      'Authorization': `key=${config.firebaseKey}`,
    },
    body: {
      to: deviceToken,
      notification: { body: body },
      priority: 'high', //http://stackoverflow.com/questions/37899712/fcm-background-notifications-not-working-in-ios
    },
    json: true,
  }).catch(function(err) {
    log.error({err: err});
  })
}
