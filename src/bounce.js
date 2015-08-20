/**
 * Created by Roee on 18/06/2014.
 */
'use strict';

var EventEmitter = require('events').EventEmitter,
    extend = require('node.extend'),
    WebSocketServer = require('ws').Server;

function Bounce() {
    var self = this,
        socketServer =  new WebSocketServer({port: 80 /*NOVI PORT NUMBER*/});

    socketServer.on('connection', function (socket) {
        socket.on('message', function (message) {

        });
        socket.send('something');
    });

    this.bounceEvents = [];
}

Bounce.events = new EventEmitter();

Bounce.prototype.setParams = function (newParams) {
    extend(this.params, newParams);
}

Bounce.prototype.on = function (eventName, callback) {
    Bounce.events.on(eventName, callback);
};

Bounce.prototype.emit = function (eventName, data) {
    Bounce.events.emit(eventName, data);
};

Bounce.prototype.send = function (eventName, data) {

};

