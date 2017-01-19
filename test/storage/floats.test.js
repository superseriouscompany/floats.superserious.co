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
        });
      });

      const validationTests = [
        {
          name: 'user id is empty',
          float: {
            title: 'great',
            invitees: ['someone'],
          },
        },
        {
          name: 'invitees are empty',
          float: {
            title: 'great',
            user_id: 'neil',
          },
        },
        {
          name: 'invitees are blank',
          float: {
            title: 'great',
            user_id: 'neil',
            invitees: [],
          },
        },
        {
          name: 'title is empty',
          float: {
            user_id: 'neil',
            invitees: ['someone'],
          },
        },
        {
          name: 'title is too short',
          errorName: 'SizeError',
          float: {
            title: '                    o                       ',
            user_id: 'neil',
            invitees: ['someone'],
          }
        },
        {
          name: 'title is too long',
          errorName: 'SizeError',
          float: {
            title: 'a'.repeat(141),
            user_id: 'neil',
            invitees: ['someone'],
          }
        },
        {
          name: 'user doesn\'t exist',
          errorName: 'UserNotFound',
          float: {
            title: 'great',
            user_id: 'nope',
            invitees: ['someone'],
          }
        }
      ]

      validationTests.forEach(function(t) {
        const errorName = t.errorName || 'ValidationError';
        it(`throws ${errorName} if ${t.name}`, function () {
          return floats.create(t.float).then(h.shouldFail).catch(function(err) {
            expect(err.name).toEqual(errorName)
          })
        });
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

      it("throws FloatNotFound if float doesn't exist", function() {
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
