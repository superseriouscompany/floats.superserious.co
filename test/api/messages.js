'use strict';

const expect    = require('expect');
const tinystub  = require('tinystub');
const factory   = require('../factory');
const api       = require('../api');
const h         = require('../helpers');
const WebSocket = require('ws');

module.exports = function() { describe("/messages", function() {
  let serverHandle, fakebookHandle, stub;
  let convo, message, float;

  before(function() {
    stub = tinystub(4202);
  })

  afterEach(function() {
    convo   = null;
    message = null;
    float   = null;
    return h.clearStub();
  })

  after(function() {
    stub();
  })

  describe("creating conversations", function() {
    it("validates stuff");

    it("sets names on convo");

    it("informs users of new conversation via websocket");

    it("automatically creates conversation when a float is created", function () {
      return factory.float({title: 'Lawng'}).then(f => {
        this.float = f;
        return f.users[0].api.get(`/floats`)
      }).then(response => {
        expect(response.statusCode).toEqual(200);
        expect(response.body.floats.length).toEqual(1);
        const float = response.body.floats[0];
        expect(float.attending).toEqual(true);
        return this.float.users[0].api.get(`/convos`)
      }).then(response => {
        expect(response.body.convos.length).toEqual(1, `Expected exactly one convo in ${JSON.stringify(response.body)}`);
        expect(response.body.convos[0].message).toNotExist();
      })
    });

    it("automatically creates group conversation when a float is created", function() {
      return factory.float({title: 'Orgy?', invitees: [null, null, null]}).then(f => {
        float = f;
        return f.user.api.get('/convos')
      }).then(response => {
        expect(response.body.convos.length).toBeGreaterThan(0, `Expected at least one convo in ${JSON.stringify(response.body)}`);
        const convo = response.body.convos[0];
      })
    });

    it("automatically creates solo conversations for group when float is created");
  });

  describe("retrieving conversations", function() {
    it("checks auth");

    it("200s with a list of conversations that this user is participating in", function() {
      let u0, u1, convo;
      return factory.convo().then(function(c) {
        convo = c;
        u0 = c.float.user;
        u1 = c.float.users[0];
        return u0.api.get('/convos');
      }).then(function(response) {
        let convos = response.body.convos;
        expect(convos.length).toEqual(1, `Expected exactly one convo in ${convos}`);
        expect(convos[0].id).toEqual(convo.id);
        expect(convos[0].float_id).toEqual(convo.float.id);
        return u1.api.get('/convos');
      }).then(function(response) {
        let convos = response.body.convos;
        expect(convos.length).toEqual(1, `Expected exactly one convo in ${convos}`);
        expect(convos[0].id).toEqual(convo.id);
        expect(convos[0].float_id).toEqual(convo.float.id);
      })
    });

    it("doesn't show conversations the user is not participating in");

    it("shows latest message sent");

    it("sets created_at on fake message if it exists");
  })

  describe("deleting conversations", function() {
    it("validates stuff");

    it("204s if conversation is successfully deleted", function() {
      return factory.convo().then(function(c) {
        return c.float.user.api.delete(`/floats/${c.float.id}/convos/${c.id}`)
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      })
    });

    it("broadcasts message to users participating");

    it("removes conversation from list");
  });

  describe("leaving conversations", function() {
    it("validates stuff");

    it("allows user to leave conversations", function() {
      return factory.convo().then(function(c) {
        return c.float.users[0].api.delete(`/floats/${c.float.id}/convos/${c.id}/membership`)
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      })
    });

    it("deletes conversation if there are only two participants");

    it("does not delete conversation if there are more participants");
  })

  describe("merging conversations", function() {
    it("validates stuff");

    it("creates a new conversation that includes both sets of members");

    it("broadcasts a message to all users participating in both conversations");

    it("returns an error code when trying to send a message to previous convos");
  });

  describe("sending messages", function () {
    it("validates stuff");

    it("201s on successful message creation", function() {
      return factory.convo().then(function(c) {
        return c.float.user.api.post(`/floats/${c.float.id}/convos/${c.id}/messages`, {
          body: {
            text: 'Hello world',
          }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(201, `Expected 201, got ${JSON.stringify(response.body)}`);
        expect(response.body.id).toExist();
        expect(response.body.created_at).toExist();
      });
    });

    it("delivers messages via push notification", function() {
      return factory.convo().then(function(c) {
        convo = c;
        return convo.float.users[0].api.patch(`/users/me`, {
          body: { firebase_token: 'recipient' }
        })
      }).then(function() {
        return convo.float.user.api.patch(`/users/me`, {
          body: { name: 'Sau Pow' }
        })
      }).then(function() {
        return convo.float.user.api.post(`/floats/${convo.float.id}/convos/${convo.id}/messages`, {
          body: {
            text: 'Hello world',
          }
        })
      }).then(function(response) {
        expect(stub.calls.length).toBeGreaterThan(0, `Expected notification stub to have been called`);
        expect(stub.calls[0].url).toEqual('/fcm/send');
        expect(stub.calls[0].body).toExist();
        const notification = stub.calls[0].body;
        expect(notification.priority).toEqual('high');
        expect(notification.notification.body).toEqual('Sau Pow: Hello world');
        expect(notification.to).toEqual('recipient', `Expected to recipient in ${JSON.stringify(notification)}`);
      });
    });

    it("delivers group messages");

    it("delivers messages via websocket", function(done) {
      factory.convo().then(function(c) {
        const ws = new WebSocket(`ws://localhost:4200/?access_token=${c.float.users[0].access_token}`);
        ws.on('message', function(m) {
          try {
            m = JSON.parse(m);
            expect(m.text).toEqual('test message', `Expected text of test message in ${JSON.stringify(m)}`);
            expect(m.float_id).toEqual(c.float.id);
            expect(m.convo_id).toEqual(c.id);
            done();
          } catch(err) {
            done(err);
          }
        })
        factory.message(c.float.user, c.float.id, c.id, 'test message');
      }).catch(done);
    });

    it("updates latest message on convo", function () {
      return factory.convo().then(function(c) {
        convo = c;
        return factory.message(c.float.user, c.float.id, c.id, 'Chicken Tetrazzini')
      }).then(function() {
        return convo.float.user.api.get('/convos')
      }).then(function(response) {
        const convos = response.body.convos;
        expect(convos.length).toEqual(1, `Expected exactly one convo in ${convos}`);
        expect(convos[0].message).toExist();
        expect(convos[0].message.text).toEqual('Chicken Tetrazzini');
      });
    });
  });

  describe("retrieving messages", function() {
    it("rejects ranges that are too large");

    it("supports from");

    it("supports to");

    it("returns empty messages for group");

    it("returns created messages", function() {
      return factory.convo().then(function(c) {
        convo = c;
        return factory.message(c.float.user, c.float.id, c.id, 'where ya ass was at');
      }).then(function(m) {
        return convo.float.user.api.get(`/floats/${convo.float.id}/convos/${convo.id}/messages`);
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        let messages = response.body.messages;
        expect(messages).toExist(`Expected messages key in ${JSON.stringify(response.body)}`);
        expect(messages.length).toEqual(1, `Expected exactly one message in ${JSON.stringify(response.body)}`);
        expect(messages[0].text).toEqual('where ya ass was at');
      });
    });

    it("returns messages in creation order", function() {
      return factory.convo().then(function(c) {
        convo = c;
        return factory.message(convo.float.user, convo.float.id, convo.id, 'weeks ago');
      }).then(function(m) {
        return factory.message(convo.float.user, convo.float.id, convo.id, 'literally right now');
      }).then(() => {
        return convo.float.user.api.get(`/floats/${convo.float.id}/convos/${convo.id}/messages`);
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        let messages = response.body.messages;
        expect(messages).toExist(`Expected messages key in ${JSON.stringify(response.body)}`);
        expect(messages.length).toEqual(2, `Expected exactly one message in ${JSON.stringify(response.body)}`);
        expect(messages[0].text).toEqual('literally right now');
        expect(messages[1].text).toEqual('weeks ago');
      });
    });
  });

  describe("deleting messages", function() {
    it("allows message deletion", function() {
      return factory.convo().then(function(c) {
        convo = c;
        return factory.message(c.float.user, c.float.id, c.id, 'wuterr');
      }).then(function(m) {
        return convo.float.user.api.delete(`/floats/${convo.float.id}/convos/${convo.id}/messages/${m.id}`);
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      });
    });

    it("informs other users over websocket");
  })

  it("doesn't lose messages if client disconnects");

  it("doesn't lose messages if server disconnects");
})}
