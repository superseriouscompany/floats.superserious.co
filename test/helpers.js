'use strict';

const request  = require('request-promise');
const expect   = require('expect');

module.exports = {
  shouldFail:       shouldFail,
  clearStub:        clearStub,
  lastNotification: lastNotification,
}

function shouldFail(r) {
  let err;
  if( r && r.statusCode ) {
    err = new Error(`Expected an unsuccessful response, got: ${r.statusCode} ${JSON.stringify(r.body)}`);
    err.statusCode = r.statusCode;
    err.response = { body: r.body };
  } else {
    err = new Error(`Expected an unsuccessful response, got: ${r}`);
    err.statusCode = 420;
  }
  err.name = 'ShouldHaveFailed';
  throw err;
}

function lastNotification(stub) {
  expect(stub.calls.length).toBeGreaterThan(0, `Expected at least one call in ${JSON.stringify(stub.calls)}`);
  expect(stub.calls[0].url).toEqual('/fcm/send');
  expect(stub.calls[0].body).toExist(`Expected stub body in ${JSON.stringify(stub.calls)}`);
  const notification = stub.calls[0].body;
  expect(notification.priority).toEqual('high');
  return notification.notification;
}

function clearStub() {
  return request('http://localhost:4202', {
    method: 'DELETE'
  })
}
