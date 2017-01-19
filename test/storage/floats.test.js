'use strict';

const expect = require('expect');
const floats = require('../../storage/floats');
const users  = require('../../storage/users');
const h      = require('../helpers');

module.exports = function() {
  describe("floats", function () {
    let float, user;

    afterEach(function() {
      float = null;
      user  = null;
    })

    describe(".create", function() {
      const validationTests = [
        {
          name: 'float is null',
          errorName: 'InputError',
          float: null,
        },
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
            user: { id: 'neil' },
          },
        },
        {
          name: 'invitees are blank',
          float: {
            title: 'great',
            user: { id: 'neil' },
            invitees: [],
          },
        },
        {
          name: 'title is empty',
          float: {
            user: { id: 'neil' },
            invitees: ['someone'],
          },
        },
        {
          name: 'title is too short',
          errorName: 'SizeError',
          float: {
            title: '                    o                       ',
            user: { id: 'neil' },
            invitees: ['someone'],
          }
        },
        {
          name: 'title is too long',
          errorName: 'SizeError',
          float: {
            title: 'a'.repeat(141),
            user: { id: 'neil' },
            invitees: ['someone'],
          }
        },
        {
          name: 'user doesn\'t exist',
          errorName: 'UserNotFound',
          float: {
            title: 'great',
            user: { id: 'nope' },
            invitees: ['someone'],
          }
        }
      ]

      validationTests.forEach(function(t) {
        const errorName = t.errorName || 'ValidationError';
        it(`throws ${errorName} if ${t.name}`, function () {
          return floats.create(t.float).then(h.shouldFail).catch(function(err) {
            expect(err.name).toEqual(errorName)
          });
        });
      });

      it("creates float with id and created_at", function () {
        return Promise.all([
          users.create({}),
          users.create({}),
        ]).then(function(v) {
          return floats.create({
            title: 'great',
            user: { id: v[0].id },
            invitees: [v[1].id],
          })
        }).then(function(float) {
          expect(float.id).toExist();
          expect(float.created_at).toBeGreaterThan(+new Date - 60000);
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

      it("finds properly created floats", function () {
        return createFloat().then(function(f) {
          float = f;
          return floats.get(float.id);
        }).then(function(f) {
          expect(f).toExist();
          expect(f.id).toEqual(float.id);
          expect(f.title).toEqual(float.title);
        })
      });
    });

    describe(".findByInvitee", function() {
      it("throws InputError if invitee id is null", function () {
        return floats.findByInvitee().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("returns floats that the person was invited to", function () {
        return Promise.all([
          createFloat({title: 'surlo', invitees: ['chuck']}),
          createFloat({title: 'soccer', invitees: ['chuck']}),
        ]).then(function() {
          return floats.findByInvitee('chuck');
        }).then(function(all) {
          const titles = all.map(function(f) {return f.title; });
          expect(titles).toContain('surlo', `Didn't find surlo in ${JSON.stringify(all)}`);
          expect(titles).toContain('soccer', `Didn't find soccer in ${JSON.stringify(all)}`);
        });
      });
    });

    describe(".findByCreator", function() {
      it("throws InputError if creator id is null", function () {
        return floats.findByCreator().then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('InputError');
        })
      });

      it("finds all floats that one person created", function () {
        return users.create({}).then(function(u) {
          user = u;

          return Promise.all([
            createFloat({title: 'first', user: { id: user.id }}),
            createFloat({title: 'second', user: { id: user.id }}),
            createFloat({title: 'third', user: { id: user.id }}),
          ])
        }).then(function() {
          return floats.findByCreator(user.id)
        }).then(function(all) {
          expect(all).toExist();
          expect(all.length).toEqual(3, `Expected 3 floats in ${JSON.stringify(all)}`);
          const titles = all.map(function(f) { return f.title });
          expect(titles).toContain('first', `Expected first in ${JSON.stringify(all)}`);
          expect(titles).toContain('second', `Expected second in ${JSON.stringify(all)}`);
          expect(titles).toContain('third', `Expected third in ${JSON.stringify(all)}`);
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

      it("throws UserNotFound if user doesn't exist", function() {
        return createFloat().then(function(f) {
          return floats.join(f.id, 'nope');
        }).then(h.shouldFail).catch(function(err) {
          expect(err.name).toEqual('UserNotFound');
        })
      });

      it("throws NotInvited if user was not invited", function () {
        return createFloat()
      });
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

function createFloat(params) {
  return Promise.all([
    users.create({}),
    users.create({}),
  ]).then(function(v) {
    return floats.create(Object.assign({
      user: { id: v[0].id },
      invitees: [v[1].id],
      title: 'Test Float',
    }, params));
  });
}
