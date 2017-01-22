'use strict';

const WebSocket = require('ws');
const http      = require('http');
const url       = require('url');
const promisify = require('bluebird').Promise.promisify;
const log       = require('../services/log');
const error     = require('../services/error');
const db = {
  users: require('../storage/users')
}

let clients = {};

module.exports = {
  bind: bind,
  send: send,
}

function bind(app) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({server});

  wss.on('connection', connect);
  return server;
}

function send(userId, payload) {
  return Promise.resolve().then(function() {
    const client = clients[userId];
    if( !client ) {
      throw error('User channel does not exist', {name: 'ClientNotFound', userId: userId});
    }
    if( client.readyState !== WebSocket.OPEN ) {
      throw error('User channel is not open', {name: 'ClientNotOpen', userId: userId, readyState: client.readyState});
    }

    return new Promise(function(resolve, reject) {
      client.send(payload, function ack(err) {
        if( err ) { return reject(err); }
        resolve(true);
      });
    })
  })
}

function connect(ws) {
  const location = url.parse(ws.upgradeReq.url, true);
  if( !location.query.access_token ) {
    close(ws);
  }

  db.users.findByAccessToken(location.query.access_token).then(function(user) {
    clients[user.id] = ws;
  }).catch(function(err) {
    if( err.name == 'UserNotFound' ) {
      close(ws, 4001, 'Unauthorized');
    } else {
      log.error({err: err}, 'Unknown websocket error');
      close(ws, 4500, 'Internal Error')
    }
  })
}

function close(ws, code, reason) {
  if( ws.readyState != ws.OPEN ) {
    return setTimeout(function() {
      close(ws, code, reason)
    }, 100);
  }
  ws.close(code, reason);
}
