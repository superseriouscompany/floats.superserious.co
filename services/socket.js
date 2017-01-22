'use strict';

const WebSocket = require('ws');
const http      = require('http');
const url       = require('url');
const log       = require('../services/log');
const users     = require('../storage/users');

let clients = {};

module.exports = function(app) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({server});

  wss.on('connection', function connection(ws) {
    const location = url.parse(ws.upgradeReq.url, true);
    if( !location.query.access_token ) {
      close(ws);
    }

    users.findByAccessToken(location.query.access_token).then(function(user) {
      clients[user.id] = ws;
    }).catch(function(err) {
      if( err.name == 'UserNotFound' ) {
        close(ws, 4001, 'Unauthorized');
      } else {
        log.error(err);
        close(ws, 4500, 'Internal Error')
      }
    })
  });

  return server;
}

module.exports.clients = clients;

function close(ws, code, reason) {
  if( ws.readyState != ws.OPEN ) {
    return setTimeout(function() {
      close(ws, code, reason)
    }, 100);
  }
  ws.close(code, reason);
}
