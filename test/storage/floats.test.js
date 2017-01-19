'use strict';

const expect = require('expect');
const floats = require('../../storage/floats');
const h      = require('../helpers');

module.exports = function() {
  describe("floats", function () {
    let float, user;

    afterEach(function() {
      float = null;
      user  = null;
    })

    describe(".create", function() {
      it("throws InputError if float is null", function () {
        return floats.create().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });
    });
    describe(".get", function() {
      it("throws InputError if id is null", function () {
        return floats.get().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws FloatNotFound if float doesn't exist is null", function () {
        return floats.get('nope').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('FloatNotFound');
        })
      });
    });
    describe(".findByInvitee", function() {
      it("throws InputError if invitee id is null", function () {
        return floats.findByInvitee().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });
    });
    describe(".findByCreator", function() {
      it("throws InputError if creator id is null", function () {
        return floats.findByCreator().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });
    });
    describe(".join", function() {
      it("throws InputError if float id or user id is null", function () {
        return floats.join().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
          return floats.join('something')
        }).then(h.shouldFail).catch(function(err) {
            expect(err.name).toEqual('InputError');
        })
      });

      it("throws FloatNotFound if float doesn't exist", function () {
        return floats.join('nope', 'nope').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('FloatNotFound');
        })
      });

      it("throws UserNotFound if user doesn't exist");
    });
    describe(".attendees", function() {
      it("throws InputError if float id is not provided", function () {
        return floats.attendees().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });
    });
    describe(".destroy", function() {
      it("throws InputError if float id is not provided", function () {
        return floats.destroy().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws FloatNotFound if float doesn't exist", function () {
        return floats.destroy('nope').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('FloatNotFound');
        })
      });
    });

    describe(".flush", function() {
      it("clears all floats out", function () {

      });
    });
  });
}
