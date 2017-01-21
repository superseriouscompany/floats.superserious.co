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

    it("informs users of new conversation via websocket", function () {
      
    });
  });

  describe("deleting conversations", function() {
    it("validates stuff");

    it("204s if conversation is successfully deleted");

    it("broadcasts message to users participating");

    it("removes conversation from list");
  });
  describe("retrieving conversations", function() {
    it("checks auth");

    it("200s with a list of conversations that this user is participating in");
  })
  describe("merging conversations", function() {
    it("validates stuff");

    it("creates a new conversation that includes both sets of members");

    it("broadcasts a message to all users participating in both conversations");

    it("returns an error code when trying to send a message to previous convos");
  });

  describe("sending messages", function () {
    it("validates stuff");

    it("201s on successful message creation");

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
