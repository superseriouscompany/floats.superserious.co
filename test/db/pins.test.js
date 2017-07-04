const expect = require('expect');
const pins   = require('../../db/pins');

module.exports = function() {
  describe("pins", function() {
    it("creates a pin", function () {
      return pins.create({lat: 0, lng: 0, user_id: 'nice great', created_at: +new Date}).then(function(response) {
        expect(response).toEqual(true);
      })
    });
  })
}
