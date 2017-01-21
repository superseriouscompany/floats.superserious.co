'use strict';

const users = require('./users');
const _     = require('lodash');

module.exports = {
  create: create,
}

let messages = {};
let inc = 1;

function create(floatId, convoId, userId, text) {
  return new Promise(function(resolve, reject) {
    return users.get(userId).then(function(user) {
      messages[floatId] = messages[floatId] || {};
      messages[floatId][convoId] = messages[floatId][convoId] || [];
      const message = {
        id: inc++,
        user: _.pick(user, 'id', 'avatar_url', 'name'),
        text: text,
        created_at: +new Date,
        float_id: floatId,
        convo_id: convoId,
      };
      messages[floatId][convoId].push(message);
      resolve(message);
    }).catch(reject);
  })
}
