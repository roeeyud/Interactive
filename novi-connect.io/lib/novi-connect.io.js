'use strict';

var EventEmitter = require('events').EventEmitter,
    io = require('socket.io-client'),
    config = require('./config'),
    gameId = getGameId(),
    qrcode = require('yaqrcode'),
    appName = getAppName();

function getAppName() {
    var newRef = document.location.href,
        fields,
        indexOfHash = document.location.href.indexOf('#');

    if (indexOfHash > 0) {
        newRef = document.location.href.substring(0, indexOfHash);
    }

    fields = newRef.split('/');

    return fields[fields.length - 3].split('?')[0].toLowerCase();
}

function getGameId() {
    var newRef = document.location.href,
        fields,
        indexOfHash = document.location.href.indexOf('#');

    if (indexOfHash > 0) {
        newRef = document.location.href.substring(0, indexOfHash);
    }

    fields = newRef.split('/');

    return fields[fields.length - 1].split('?')[0].toLowerCase();
}

function NoviConnect() {
    var self = this;

    this.gameId = gameId;
    this.configReady = false;
    this.connectionReady = false;

    this.internalEmitter = new EventEmitter();

    this.on = function (event, callback) {
        if (self.socket && self.socket.on)
            self.socket.on(event, callback);
    };

    this.socket = io();
}

NoviConnect.prototype = new EventEmitter();

NoviConnect.prototype.openConnection = function () {
    var self = this;
    this.socket.on('controller-id', function (controllerId) {
        self.controllerId = controllerId;
        self.controllerIdReady = true;
        console.log('openConnection -> callIfReady');
        self.callIfReady();
    });
}

NoviConnect.prototype.onReady = function (callBack) {
    if (this.isReady()) {
        setTimeout(callBack, 50);    // make sure call is async
    } else {
        this.internalEmitter.on('ready', callBack);
    }
};

NoviConnect.prototype.callIfReady = function () {
    if (this.isReady()) {
        this.internalEmitter.emit('ready');
    }
};

NoviConnect.prototype.isReady = function () {
    return this.configReady && this.connectionReady && this.controllerIdReady;
}

NoviConnect.prototype.onReadyConfig = function (configObj) {
    this.openConnection();
    this.configReady = true;
    this.config = configObj;
    console.log('onReadyConfig -> callIfReady');
    this.callIfReady();
}

NoviConnect.prototype.startScreen = function () {
    var self = this;

    console.log('starting screen');
    config.setRole('screen');
    config.getConfig();

    self.controllerIdReady = true;

    config.onReady = function (configObj) {
        self.onReadyConfig(configObj);
        var onScreenConnected = function () {
            var isMaster = true,
                useAudit = false,
                tag;

            if (configObj.master === false) {
                isMaster = false;
            }

            tag = configObj.tag;

            if (configObj.useAudit === true) {
                useAudit = true;
            }

            self.socket.emit('screen-ready', appName, tag, isMaster, useAudit, function (sessionId) {
                if (sessionId === false) {
                    console.log('startScreen -> sessionId === false');
                    self.disconnect();
                    return;
                }

                self.sessionId = sessionId;
                self.qrCode = qrcode(document.location.origin + '/connect/' + sessionId);
                self.connectUrl = document.location.origin + '/connect/';
                self.connectUrl = self.connectUrl.replace('http://', '');
                self.connectionReady = true;
                console.log('startScreen -> callIfReady');
                self.callIfReady();
            });
        }

        if (self.socket.connected) {
            onScreenConnected()
        } else {
            self.socket.on('connect', onScreenConnected);
        }
    };


}

NoviConnect.prototype.connectAudit = function () {
    var self = this;

    config.setRole('audit');
    config.getConfig();

    self.controllerIdReady = true;

    config.onReady = function (configObj) {
        self.onReadyConfig(configObj);
        self.socket.on('connect', function () {
            self.socket.emit('audit-ready', gameId);
            self.connectionReady = true;
            self.callIfReady();
        });
    };
}

NoviConnect.prototype.connectUser = function (extraInfo) {
    var self = this;

    if (typeof extraInfo !== 'object') {
        extraInfo = {};
    }

    extraInfo.userAgent = navigator.userAgent || navigator.vendor || window.opera;

    config.setRole('user');
    config.getConfig();

    config.onReady = function (configObj) {
        self.onReadyConfig(configObj);

        function sendUserReady () {
            self.socket.emit('user-ready', {
                gameId: gameId,
                extraInfo: extraInfo
            }, true);

            self.connectionReady = true;
            self.callIfReady();
        }

        if (self.socket.connected) {
            sendUserReady()
        } else {
            self.socket.on('connect', sendUserReady);
        }


    };


}

NoviConnect.prototype.send = function (event, obj, control) {
    this.socket.emit('bounce', {
        event: event,
        data: obj,
        control: control
    });
};

NoviConnect.prototype.disconnect = function () {
    this.socket.disconnect();
    //this.socket = null;
}

NoviConnect.prototype.onComplete = function (callback) {
    if (this.configReady && this.connectionReady) {
        callback();
        return;
    }

    if (this.complete) {
        callback();
        return;
    }
}

if (window) {
    window.NoviConnect = NoviConnect
}