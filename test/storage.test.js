'use strict';

const expect = require('expect');
const pins   = require('../storage/pins');
const h      = require('./helpers');
const fs     = require('fs');

describe("storage", function() {
  const normalizedPath = require("path").join(__dirname, "storage");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./storage/" + file)();
  });
})
