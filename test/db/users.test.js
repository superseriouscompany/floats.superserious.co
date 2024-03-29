'use strict';

const expect = require('expect');
const users  = require('../../db/users');
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

    describe(".all", function() {
      it("returns all users in the database", function () {
        return Promise.all([
          users.create({name: 'Neil'}),
          users.create({name: 'Santi'}),
          users.create({name: 'Andrew'}),
          users.create({name: 'Kevin'}),
        ]).then(function() {
          return users.all()
        }).then(function(all) {
          ['Neil', 'Santi', 'Andrew', 'Kevin'].forEach(function(n) {
            const match = all.find(function(u) {return u.name == n});
            expect(match).toExist(`Couldn't find ${n}`);
          })
        })
      });
    })

    describe(".update", function() {
      it("throws InputError if id is null", function () {
        return users.update().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws InputError if object is null", function () {
        return users.update('cool').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws UserNotFound if id is not found", function () {
        return users.update('nerp', {'username': 'test'}).then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        })
      });

      it("doesn't update id or created_at", function () {
        return users.create({id: 'cool', created_at: 2}).then(function(user) {
          return users.update('cool', {id: 'nice', created_at: 3, username: 'test'});
        }).then(function() {
          return users.get('cool')
        }).then(function(user) {
          expect(user.id).toEqual('cool');
          expect(user.created_at).toEqual(2);
        })
      });

      it("updates user object", function() {
        return users.create({id: 'cool', created_at: 2}).then(function(user) {
          return users.update('cool', {name: 'good', username: 'test', firebase_token: 'dope'});
        }).then(function() {
          return users.get('cool')
        }).then(function(user) {
          expect(user.name).toEqual('good');
          expect(user.username).toEqual('test');
          expect(user.firebase_token).toEqual('dope');
        })
      });
    })

    describe(".destroy", function () {
      it("throws InputError if id is null", function () {
        return users.destroy().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws UserNotFound if user is not found", function () {
        return users.destroy('nerp').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        })
      });

      it("destroys user", function () {
        let foundUserToDestroy;
        return users.create({}).then(function(u) {
          user = u;
          return users.destroy(user.id);
        }).then(function(ok) {
          foundUserToDestroy = true;
          expect(ok).toExist();
          return users.get(user.id);
        }).then(h.shouldFail).catch(function(err) {
          expect(foundUserToDestroy).toExist();
          expect(err.name).toEqual('UserNotFound');
        })
      });
    });

    describe(".flush", function () {
      it("destroys all users", function() {
        this.timeout(30000);
        this.slow(18000);
        return Promise.all([
          users.create({}),
          users.create({}),
          users.create({})
        ]).then(function() {
          return users.flush();
        }).then(function() {
          return users.all();
        }).then(function(all) {
          expect(all.length).toEqual(0);
        })
      });
    });

    describe(".findByFacebookId", function () {
      it("throws InputError if facebook id is blank", function() {
        return users.findByFacebookId().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws UserNotFound if no user has this facebook id", function () {
        return users.findByFacebookId('21').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        })
      });

      it("returns user by facebook id", function () {
        return users.create({name: 'Ines', facebook_id: '123'}).then(function() {
          return users.findByFacebookId('123')
        }).then(function(user) {
          expect(user.name).toEqual('Ines');
        })
      });
    });

    describe(".findByAccessToken", function () {
      it("throws InputError if access token is blank", function() {
        return users.findByAccessToken().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("throws UserNotFound if no user has this access token", function () {
        return users.findByAccessToken('nerp').then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        })
      });

      it("returns user by access token", function () {
        return users.create({name: 'Severin', access_token: 'sev123'}).then(function() {
          return users.findByAccessToken('sev123')
        }).then(function(user) {
          expect(user.name).toEqual('Severin');
        })
      });
    });
  })
}
