'use strict';

const expect = require('expect');
const users  = require('../../storage/users');
const h      = require('../helpers');

module.exports = function() {
  describe("users", function() {
    let user;

    afterEach(function() {
      user = null;
    })

    describe(".create", function () {
      it("throws InputError if user is null", function() {
        return users.create().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("returns user", function () {
        return users.create({}).then(function(user) {
          expect(user.id).toExist();
        });
      });

      it("adds id and created_at if missing", function () {
        return users.create({id: 'foo', created_at: 1}).then(function(user) {
          expect(user.id).toEqual('foo');
          expect(user.created_at).toEqual(1);
          return users.create({id: 'foo'});
        }).then(function(user) {
          expect(user.id).toEqual('foo');
          expect(user.created_at).toBeGreaterThan(+new Date - 60000);
          return users.create({created_at: 2});
        }).then(function(user) {
          expect(user.id).toExist();
          expect(user.id.length).toBeGreaterThan(5);
          expect(user.created_at).toEqual(2);
        })
      });
    });

    describe(".get", function() {
      it("throws InputError if id is null", function() {
        return users.get().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws UserNotFound if id is not found", function () {
        return users.get('savage').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        });
      });

      it("returns user if one is found", function () {
        return users.create({name: 'Kevin'}).then(function(user) {
          return users.get(user.id)
        }).then(function(user) {
          expect(user.id).toExist();
          expect(user.name).toEqual('Kevin');
        })
      });
    })
  })
}
