'use strict';

const error = require('../services/error');

module.exports = {
  create: create,
  find: find,
}

let sessions = {};

function create(token, userId, ttl) {
  sessions[token] = userId;
  if( ttl ) {
    setTimeout(function() {
      delete sessions[token];
    }, ttl);
  }
  return Promise.resolve(true);
}

function find(token) {
  const id = sessions[token];
  if( !id ) return Promise.reject(error('Session not found', {token: token, name: 'SessionNotFound'}));
  return Promise.resolve(sessions[token]);
}
