'use strict';

const error = require('../services/error');

module.exports = {
  create: create,
  destroy: destroy,
  find: find,
}

let sessions = {};

function create(token, userId, ttl) {
  if( !token ) { return Promise.reject(error('Token not provided', {userId, name: 'InputError'}))}

  sessions[token] = userId;
  if( ttl ) {
    setTimeout(function() {
      delete sessions[token];
    }, ttl);
  }
  return Promise.resolve(true);
}

function destroy(token) {
  delete sessions[token];
}

function find(token) {
  const id = sessions[token];
  if( !id ) return Promise.reject(error('Session not found', {token: token, name: 'SessionNotFound'}));
  return Promise.resolve(sessions[token]);
}
