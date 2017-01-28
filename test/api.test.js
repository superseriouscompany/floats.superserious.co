'use strict';

const normalizedPath = require("path").join(__dirname, "api");
const tinystub       = require('tinystub');
const request        = require('request-promise');
const fakebook       = require('./fakebook');
const api            = require('./api');
const server         = require('../index');

describe("api", function() {
  let serverHandle, fakebookHandle;
  this.slow(1000);

  before(function() {
    serverHandle   = server(4200);
    fakebookHandle = fakebook(4201);
  })
  afterEach(function() {
    if( process.env.LIVE ) { return; }

    return api.delete('/flush').then(function() {
      return request('http://localhost:4202', {
        method: 'DELETE'
      })
    });
  })
  after(function() {
    serverHandle();
    fakebookHandle();
  })

  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./api/" + file)();
  });
})
