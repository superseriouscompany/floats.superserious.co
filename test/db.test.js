'use strict';

describe("db", function() {
  const normalizedPath = require("path").join(__dirname, "db");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./db/" + file)();
  });
})
