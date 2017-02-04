'use strict';

const expect   = require('expect');
const tinystub = require('tinystub');
const factory  = require('../factory');
const h        = require('../helpers');
const api      = require('../api');

module.exports = function() { describe("/friends", function() {
  let user, u0;

  describe("making friends", function() {
    it("only returns whitelisted fields (extract from below)");

    it("pulls all people on the app in reverse cron order of when they joined", function() {
      return Promise.resolve().then(() => {
        return factory.user({name: 'Neil'})
      }).then((u) => {
        user = u;
        return factory.user({name: 'Kevin'})
      }).then(() => {
        return factory.user({name: 'Santi'})
      }).then(() => {
        return factory.user({name: 'Sauer'})
      }).then(() => {
        return user.api.get('/randos')
      }).then((response) => {
        expect(response.statusCode).toEqual(200);
        expect(response.body.randos).toExist(`Expected randos in ${JSON.stringify(response.body)}`);
        expect(response.body.randos.length).toEqual(3);
        expect(response.body.randos[0].name).toEqual('Sauer');
        expect(response.body.randos[1].name).toEqual('Santi');
        expect(response.body.randos[2].name).toEqual('Kevin');
        expect(response.body.randos[0].lat).toNotExist();
        expect(response.body.randos[0].access_token).toNotExist();
      })
    });

    it("doesn't pull people you're friends with or have requested", function() {
      let u1;
      return Promise.all([
        factory.user({name: 'Neil'}),
        factory.user({name: 'Santi'}),
        factory.user({name: 'Sauer'}),
      ]).then((v) => {
        user = v[0];
        u0 = v[1];
        u1 = v[2];

        return Promise.all([
          factory.friendship(user, u0),
          factory.friendRequest({user: u1, rando: user}),
        ])
      }).then(() => {
        return user.api.get('/randos')
      }).then((response) => {
        expect(response.body.randos.length).toEqual(0, `Expected no randos in ${JSON.stringify(response.body)}`);
      })
    });

    it("pulls your facebook friends");

    it("allows sending and receiving a friend request", function() {
      return Promise.all([
        factory.user({name: 'Neil'}),
        factory.user({name: 'Rosemary'}),
      ]).then((v) => {
        user = v[0];
        u0   = v[1];
        return user.api.post(`/friend_requests/${v[1].id}`);
      }).then((response) => {
        expect(response.statusCode).toEqual(201);
        return u0.api.get('/friend_requests')
      }).then((response) => {
        expect(response.statusCode).toEqual(200);
        expect(response.body.friend_requests).toExist(`Expected to find friend_requests in ${JSON.stringify(response.body)}`);
        expect(response.body.friend_requests.length).toEqual(1, `Expected to find exactly one friend request in ${JSON.stringify(response.body)}`);
        expect(response.body.friend_requests[0].user.id).toEqual(user.id);
        expect(response.body.friend_requests[0].user.access_token).toNotExist();
      })
    });

    it("notifies the other person when you send a request");

    it("409s if you've already sent a friend request", function() {
      return factory.friendRequest().then((fr) => {
        return factory.friendRequest({rando: fr.rando, user: fr.user});
      }).then(h.shouldFail).catch((err) => {
        expect(err.statusCode).toEqual(409);
      })
    });

    it("201s and creates a friendship if they've already sent a friend request");

    it("409s if you're already friends");

    it("410s when denying a non-existent friend request");

    it("409s if you are already friends");

    it("allows denying a friend request", function() {
      return Promise.resolve().then(() => {
        return factory.friendRequest()
      }).then((fr) => {
        user = fr.user;
        return user.api.delete(`/friend_requests/${fr.rando.id}`)
      }).then((response) => {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/friend_requests')
      }).then((response) => {
        expect(response.body.friend_requests.length).toEqual(0, `Expected no friend requests in ${JSON.stringify(response.body)}`);
      })
    });

    it("allows undoing a friend request", function () {
      return Promise.resolve().then(() => {
        return factory.friendRequest()
      }).then((fr) => {
        user = fr.user;
        return fr.rando.api.delete(`/friend_requests/mine/${user.id}`)
      }).then((response) => {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/friend_requests')
      }).then((response) => {
        expect(response.body.friend_requests.length).toEqual(0, `Expected no friend requests in ${JSON.stringify(response.body)}`);
      })
    });

    it("does not allow re-requesting a denied request");

    it("allows canceling a sent request");

    it("allows accepting a friend request", function() {
      return Promise.resolve().then(() => {
        return factory.friendRequest()
      }).then((fr) => {
        user = fr.user;
        u0 = fr.rando;
        return user.api.put(`/friend_requests/${fr.rando.id}`)
      }).then((response) => {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/friends')
      }).then((response) => {
        expect(response.statusCode).toEqual(200);
        expect(response.body.friends).toExist(`Expected friends in ${JSON.stringify(response.body)}`);
        expect(response.body.friends.length).toEqual(1, `Expected exactly one friend in ${JSON.stringify(response.body)}`);
        expect(response.body.friends[0].id).toEqual(u0.id, `Expected matching id in ${JSON.stringify(response.body)}`);
      })
    });

    it("removes friend request from list of pending requests", function() {
      return Promise.resolve().then(() => {
        return factory.friendRequest()
      }).then((fr) => {
        user = fr.user;
        u0 = fr.rando;
        return user.api.put(`/friend_requests/${fr.rando.id}`)
      }).then((response) => {
        return user.api.get('/friend_requests')
      }).then((response) => {
        expect(response.body.friend_requests.length).toEqual(0, `Expected no remaining friend requests in ${JSON.stringify(response.body)}`);
      })
    })

    it("notifies the other person when you accept");
  })

  describe("friends", function() {
    it("allows blocking friends", function() {
      return factory.friendship().then((friendship) => {
        user = friendship.u0;
        u0   = friendship.u1;
        return user.api.delete(`/friends/${u0.id}`)
      }).then((response) => {
        expect(response.statusCode).toEqual(204)
        return user.api.get('/friends')
      }).then((response) => {
        expect(response.body.friends[0].id).toEqual(u0.id);
        expect(response.body.friends[0].blocked).toExist();
      })
    });

    it("allows unblocking friends", function () {
      return factory.friendship().then((friendship) => {
        user = friendship.u0;
        u0   = friendship.u1;
        return user.api.delete(`/friends/${u0.id}`)
      }).then((response) => {
        return user.api.put(`/friends/${u0.id}`)
      }).then((response) => {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/friends')
      }).then((response) => {
        expect(response.body.friends[0].id).toEqual(u0.id);
        expect(response.body.friends[0].blocked).toNotExist();
      })
    });

    it("gets a list of all your friends");

    it("gets nearby friends within a 10km radius", function () {
      let u1, u2;

      return Promise.all([
        factory.user(),
        factory.user(),
        factory.user(),
        factory.user(),
      ]).then(function(users) {
        u0 = users[0];
        u1 = users[1];
        u2 = users[2];
        user = users[3];

        return Promise.all([
          factory.friendship(user, u0),
          factory.friendship(user, u1),
          factory.friendship(user, u2),
        ])
      }).then(function() {
        return Promise.all([
          u0.api.post('/pins', {
            // surfer's lodge
            body: { lat: 39.370423, lng: -9.328313 },
          }),
          u1.api.post('/pins', {
            // supertubos
            body: { lat: 39.345404, lng: -9.363375 },
          }),
          u2.api.post('/pins', {
            // lisbon
            body: { lat: 38.710198, lng: -9.143254 },
          }),
          user.api.post('/pins', {
            // ilha do baleal
            body: { lat: 39.376358, lng: -9.340980 },
          })
        ])
      }).then(function() {
        return user.api.get('/friends/nearby');
      }).then(function(response) {
        expect(response.body.friends).toExist(`No friends in ${JSON.stringify(response.body)}`);
        const u0Match = response.body.friends.find(function(f) { return f.id == u0.id});
        expect(u0Match).toExist(`Didn't find ${u0.id} in ${JSON.stringify(response.body)}`);
        const u1Match = response.body.friends.find(function(f) { return f.id == u1.id});
        expect(u1Match).toExist(`Didn't find ${u1.id} in ${JSON.stringify(response.body)}`);
        const u2Match = response.body.friends.find(function(f) { return f.id == u2.id});
        expect(u2Match).toNotExist(`Found out of range user in nearby friends`);
        expect(response.body.friends.length).toEqual(2, `Found the wrong number of nearby friends in ${JSON.stringify(response.body)}`);
      })
    });
  });
})}
