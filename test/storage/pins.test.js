const expect = require('expect');
const pins   = require('../../storage/pins');

module.exports = function() {
  describe("pins", function() {
    it("creates a pin", function () {
      return pins.create({lat: 0, lng: 0, userId: 2}).then(function(response) {
        expect(response).toEqual(true);
      })
    });
  })
}
