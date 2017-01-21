'use strict';

const expect   = require('expect');
const request  = require('request-promise');
const tinystub = require('tinystub');
const fakebook = require('./fakebook');
const factory  = require('./factory');
const api      = require('./api');
const h        = require('./helpers');
const server   = require('../index');

describe("messages", function () {
  let serverHandle, fakebookHandle, stub;
  this.slow(1000);

  before(function() {
    serverHandle   = server(4200);
    fakebookHandle = fakebook(4201);
    stub           = tinystub(4202);
  })
  afterEach(function() {
    if( !process.env.LIVE ) {
      return api.delete('/flush')
    }
  })
  after(function() {
    serverHandle();
    fakebookHandle();
    stub();
  })

  describe("creating conversations", function() {
    it("validates stuff");

    it("201s on successful conversation creation", function() {
      return factory.float().then(function(f) {
        return f.users[0].api.post(`/floats/${f.id}/convos`, {
          body: {
            members: [f.user.id],
          }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(201);
        expect(response.body.id).toExist();
      });
    });

    it("sets names on convo");

    it("informs users of new conversation via websocket");
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
        // expect(convos[0].name).toEqual(u0.name.split(' ')[0] + ', ' + u1.name.split(' ')[0]);
        return u1.api.get('/convos');
      }).then(function(response) {
        let convos = response.body.convos;
        expect(convos.length).toEqual(1, `Expected exactly one convo in ${convos}`);
        expect(convos[0].id).toEqual(convo.id);
        expect(convos[0].float_id).toEqual(convo.float.id);
        // expect(convos[0].name).toEqual(u0.name.split(' ')[0] + ', ' + u1.name.split(' ')[0]);
      })
    });

    it("doesn't show conversations the user is not participating in");

    it("shows latest message sent");
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
        return c.float.user.api.post(`/floats/${c.float.id}/convos/${c.id}/messages`)
      }).then(function(response) {
        expect(response.statusCode).toEqual(201, `Expected 201, got ${JSON.stringify(response.body)}`);
        expect(response.body.id).toExist();
        expect(response.body.created_at).toExist();
      });
    });

    it("delivers messages via push notification");

    it("delivers messages via websocket");
  });

  describe("retrieving messages", function() {
    it("rejects ranges that are too large");

    it("supports from");

    it("supports to");

    it("returns last 20 messages by default");
  })

  describe("deleting messages", function() {
    it("allows message deletion");
  })

  it("doesn't lose messages if client disconnects");

  it("doesn't lose messages if server disconnects");
})
