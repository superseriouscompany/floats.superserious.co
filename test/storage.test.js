'use strict';

const expect = require('expect');
const pins   = require('../db/pins');
const h      = require('./helpers');

describe("db", function() {
  const normalizedPath = require("path").join(__dirname, "db");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./db/" + file)();
  });
})
