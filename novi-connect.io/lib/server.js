/**
 * Created by Pc on 21/06/2014.
 */

'use strict';

var EventEmitter = require('events').EventEmitter,
    NUM_OF_PLAYERS = 999,// Safety to keep number of at once to this maximum
    Server = require('socket.io'),
    path = require('path'),
    browserify = require('browserify-middleware'),
    serverConfig = require('../../server.json'),
    clientPath = path.resolve(path.join(__dirname, '/novi-connect.io.js')),
    clientMin = path.resolve(path.join(__dirname, '/novi-connect.io.min.js')),
    sessionLogger = require('../../logger');

function ConnectServer(httpServer, app, getNewSessionId, clearSession) {
    var self = this;
    this.onlineControlArray = [];       // TODO: Clean stateful mechanisms
    this.events = new EventEmitter();
    this.events.setMaxListeners(10 * 1000);
    this.app = app;
    this.getNewSessionId = getNewSessionId;
    this.clearSession = clearSession;

    this.server = new Server(httpServer);

    if (app && app.get) {
        if (serverConfig.browserify) {
            app.get('/novi-connect.io/novi-connect.io.js', browserify(clientPath));
        } else {
            app.get('/novi-connect.io/novi-connect.io.js', function (req, res) {
                res.sendfile(clientMin);
            });
        }
    }

    this.routeSatistics();

    this.server.on('connection', function (socket) {
        var handler;

        socket.on('error', function (err) {
            console.log('ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            console.dir(err);
        })

        socket.on('audit-ready', function (gameId) {
            sessionLogger.auditReady(socket.id, gameId);
            handler = self.handleAudit(socket, gameId);

            socket.on('disconnect', function () {
                sessionLogger.auditDisconnected(socket.id, gameId);
                self.events.emit('session:' + gameId + ':audit:disconnect');
            });

            self.events.emit('session:' + gameId + ':audit:connected');
        });

        socket.on('screen-ready', function (appName, tag, isMaster, useAudit, ack) {
            var sessionId = self.getNewSessionId(appName);

            sessionLogger.screenReady(socket.id, appName, sessionId, tag, isMaster, useAudit);

            handler = self.handleScreen(socket, sessionId, isMaster, useAudit);

            socket.on('disconnect', function () {
                clearSession(sessionId);
                sessionLogger.screenDisconnected(socket.id, sessionId);
                if (isMaster) {
                    self.events.emit('session:' + sessionId + ':disconnect');
                }
            });

            if (typeof ack === 'function') {
                console.log('sending-ack for session ' + sessionId);
                ack(sessionId);
            }
        });

        socket.on('user-ready', function (controlInfo) {
            var sessionId = controlInfo.gameId,
                userId = Number(self.getControllerId(sessionId)),
                extraInfo = controlInfo.extraInfo || {};

            sessionLogger.userReady(socket.id, sessionId, userId, extraInfo);

            if (userId !== ConnectServer.INVALID_ID) {
                self.onlineControlArray[sessionId][userId] = {
                    online: true
                };
                handler = self.handleControl(socket, sessionId, userId);
            } else {
                self.sendError(socket, 'Game room is full, please try again later');
                socket.leave();
                return;
            }

            self.onlineControlArray[sessionId][userId] = {
                gameId: sessionId,
                userId: userId,
                type: 'control',
                extraInfo: extraInfo,
                online: true
            };

            handler({
                event: 'userStatus',
                data: self.onlineControlArray[sessionId][userId]
            });

            socket.on('disconnect', function () {
                sessionLogger.userDisconnected(socket.id, sessionId, userId);

                if (self.onlineControlArray[sessionId] !== undefined) {
                    self.onlineControlArray[sessionId][userId].online = false;
                } else {
                    console.log("socket.on('close') self.onlineControlArray[sessionId] === undefined sessionId: " + sessionId);
                    return;
                }

                if (handler !== undefined) {
                    handler({
                        event: 'userStatus',
                        data: self.onlineControlArray[sessionId][userId]
                    });
                }
                self.events.emit('session:' + sessionId + 'control:' + userId + ':disconnect');
            });

            socket.emit('controller-id', userId);
        });

        socket.on('bounce', function (data) {
            if (handler !== undefined) {
                handler(data);
            }
        });
    });
}

ConnectServer.INVALID_ID = -1;

ConnectServer.prototype.routeSatistics = function () {

    this.app.get('/novi-connect.io/screen-sessions', function (req, res) {
        var sessions,
            count = 50;

        if (req.query && req.query.count) {
            count = req.query.count;
        }

        sessionLogger.getAllRecordsByFilter({event: 'screen-ready'}, count, function (e, results) {
            if (e) {
                console.error(e);
                return;
            }

            sessions = results;

            sessionLogger.getAllRecordsByFilter({event: 'screen-disconnected'}, 5000, function (e, resultsDisconnect) {
                if (e) {
                    console.error(e);
                    return;
                }

                var i = 0,
                    curIndex = 0,
                    foundDisconnect = false;

                sessions.forEach(function (elem, index) {
                    for (i = curIndex; i < resultsDisconnect.length; i++) {

                        if (typeof resultsDisconnect[i] === 'object' && elem.socketId === resultsDisconnect[i].socketId) {
                            elem.duration = resultsDisconnect[i].time - elem.time;
                            foundDisconnect = true;
                            break;
                        }
                    }

                    if (foundDisconnect) {
                        foundDisconnect = false;
                        curIndex = i;
                    }
                });

                res.send(sessions);
            });
        })
    });

    this.app.get('/novi-connect.io/user-sessions/:sessionId', function (req, res) {
        var sessions;
        sessionLogger.getAllRecordsByFilter({event: 'user-ready', sessionId: req.params.sessionId}, 0, function (e, results) {
            if (e) {
                console.error(e);
                return;
            }

            sessions = results;

            sessionLogger.getAllRecordsByFilter({event: 'user-disconnected', sessionId: req.params.sessionId}, 0, function (e, resultsDisconnect) {
                if (e) {
                    console.error(e);
                    return;
                }

                var i = 0;

                sessions.forEach(function (elem, index) {
                    for (i = 0; i < resultsDisconnect.length; i++) {

                        if (typeof resultsDisconnect[i] === 'object' && elem.socketId === resultsDisconnect[i].socketId) {
                            elem.duration = resultsDisconnect[i].time - elem.time;
                            break;
                        }
                    }
                });

                res.send(sessions);
            });
        })
    });

    this.app.get('/novi-connect.io/screen-messages/:sessionId/:socketId', function (req, res) {
        var sessions;
        sessionLogger.getScreenMessages(req.params.sessionId, req.params.socketId, function (e, results) {
            res.send(results);
        })
    })
};

ConnectServer.prototype.sendError = function (socket, errorMsg) {
    socket.emit('error-message', errorMsg);
};

ConnectServer.prototype.getControllerId = function (gameId) {
    var i,
        retId = ConnectServer.INVALID_ID;
    if (this.onlineControlArray[gameId] === undefined) {
        this.onlineControlArray[gameId] = [];
        this.onlineControlArray[gameId][0] = {
            online: true
        };

        retId = 0;
    } else {
        for (i = 0; i < NUM_OF_PLAYERS; i++) {
            if (this.onlineControlArray[gameId][i] === undefined || !this.onlineControlArray[gameId][i].online) {
                retId = i;
                break;
            }
        }
    }
    return retId;
};

ConnectServer.prototype.handleAudit = function (socket, gameId) {
    var self = this;

    function handelDisconnect () {
        self.events.removeListener('session:' + gameId + ':audit', sendMessageToAudit);
        self.events.removeListener('session:' + gameId + ':audit:disconnect', handelDisconnect);
    };

    function sendMessageToAudit (event) {
        var auditSeq = event.id;

        socket.emit('audit-request', event.data, function (res) {
            self.events.emit('session:' + gameId + ':audit:' + auditSeq, res);
        });
    }

    this.events.on('session:' + gameId + ':audit', sendMessageToAudit);
    this.events.on('session:' + gameId + ':audit:disconnect', handelDisconnect);
}

ConnectServer.prototype.handleScreen = function (socket, gameId, isMaster, useAudit) {
    var auditSeq = 0,
        self = this,
        handelDisconnect = function () {
            self.events.removeListener('session:' + gameId, sendMessageToGame);
            self.events.removeListener('session:all', sendMessageToGame);
            self.events.removeListener('session:' + gameId + ':disconnect', handelDisconnect);
            self.events.removeListener('session:' + gameId + ':audit:connected', handelAuditConnected);
            self.events.removeListener('session:' + gameId + ':audit:disconnected', handelAuditDisconnected);
        };

    function handelAuditConnected () {
        socket.emit('auditStatus', {
            online: true
        });
    }

    function handelAuditDisconnected () {
        socket.emit('auditStatus', {
            online: false
        });
    }

    function sendMessageToGame(message, skipAudit) {
        if (useAudit && !skipAudit) {
            self.events.emit('session:' + gameId + ':audit', {
                data: message,
                id: auditSeq
            });

            var respondToAudit = function (res) {
                if (res) {
                    socket.emit(message.event, message.data);
                }

                self.events.removeListener('session:' + gameId + ':audit:' + auditSeq, respondToAudit);
            };

            self.events.on('session:' + gameId + ':audit:' + auditSeq, respondToAudit);

            auditSeq++;
        } else {
            socket.emit(message.event, message.data);
        }
    }

    function disconnectFromServer() {
        socket.disconnect();
    }

    this.events.on('session:' + gameId, sendMessageToGame);
    this.events.on('session:all', sendMessageToGame);
    this.events.on('session:' + gameId + ':disconnect', handelDisconnect);
    this.events.on('session:' + gameId + ':audit:connected', handelAuditConnected);
    this.events.on('session:' + gameId + ':audit:disconnected', handelAuditDisconnected);

    if (!isMaster) {
        this.events.on('session:' + gameId + 'control:all', sendMessageToGame);
        //this.events.on('session:' + gameId + ':disconnect', disconnectFromServer);
    } else {
        this.events.on('session:' + gameId + 'master', sendMessageToGame);
    }

    sendMessageToGame({
        event: "allUserStatus",
        data: this.onlineControlArray[gameId]
    }, true);

    if (isMaster) {
        return function (message) {
            sessionLogger.logScreenMessage(socket.id, gameId, message.event, message.control, message);

            if (message.event === undefined || typeof message.event !== 'string') {
                console.error('invalid message missing event. event = %s', message.event);
                return;
            }

            if (message.control !== undefined) {
                self.events.emit('session:' + gameId + 'control:' + message.control, message);
            } else {
                self.events.emit('session:' + gameId + 'control:all', message);
            }
        };
    }

    return function (message) {
        if (!isMaster) {
            self.events.emit('session:' + gameId + 'master', message);
            return;
        }
    };
};

ConnectServer.prototype.handleControl = function (socket, gameId, userId) {
    function sendMessageToControl(message) {
        socket.emit(message.event, message.data);
    }

    function disconnectFromServer() {
        socket.disconnect();
    }

    var self = this,
        handelDisconnect = function () {
            self.events.removeListener('session:' + gameId + 'control:' + userId, sendMessageToControl);
            self.events.removeListener('session:' + gameId + 'control:all', sendMessageToControl);
            self.events.removeListener('session:' + gameId + 'control:' + userId + ':disconnect', handelDisconnect);
            self.events.removeListener('session:' + gameId + ':disconnect', disconnectFromServer);
        };

    this.events.on('session:' + gameId + 'control:' + userId, sendMessageToControl);
    this.events.on('session:' + gameId + 'control:all', sendMessageToControl);
    this.events.on('session:' + gameId + 'control:' + userId + ':disconnect', handelDisconnect);
    this.events.on('session:' + gameId + ':disconnect', disconnectFromServer);

    return function (message) {
        if (message.data === undefined || typeof message.data !== 'object') {
            console.error('invalid message missing data. data = %s', message.data);
            return;
        } else if (message.event === undefined || typeof message.event !== 'string') {
            console.error('invalid message missing event. event = %s', message.event);
            return;
        }

        message.data.userId = Number(userId);
        self.events.emit('session:' + gameId, message);
    };
};

module.exports = ConnectServer;