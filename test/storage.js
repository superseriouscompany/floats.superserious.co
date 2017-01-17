'use strict';

const expect = require('expect');
const pins   = require('../storage/pins');
const h      = require('./helpers');

describe("pins", function () {
  it("lets you create a pin", function () {
    return pins.create({lat: 0, lng: 0, userId: 2}).then(function() {

    })
  });
});
