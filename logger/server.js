var mongoskin = require('mongoskin'),
    serverConfig = require('../server.json');

var db = mongoskin.db(serverConfig.dbName, {safe:true}),
    connectCollection = db.collection('novi-connect-events'),
    screenMessagesCollection = db.collection('screen-messages');

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

function logToConnectCollection (newRecord) {
    if (typeof newRecord !== 'object') {
        return;
    }

    newRecord.time = Date.now();

    connectCollection.insert(newRecord, function (e, results) {
        if (e) {
            console.dir (e);
            return e;
        }
    });
}

function screenReady(socketId, appName, sessionId, tag, isMaster, useAudit) {
    var newRecord = {
        socketId: socketId,
        appName: appName,
        sessionId: sessionId,
        event: 'screen-ready',
        info: {
            tag: tag,
            isMaster: isMaster,
            useAudit: useAudit
        }
    }

    logToConnectCollection(newRecord);
}

function screenDisconnected(socketId, appName, sessionId) {
    var newRecord = {
        socketId: socketId,
        appName: appName,
        sessionId: sessionId,
        event: 'screen-disconnected'
    }

    logToConnectCollection(newRecord);
}

function userDisconnected(socketId, sessionId, userId) {
    var newRecord = {
        socketId: socketId,
        sessionId: sessionId,
        event: 'user-disconnected',
        info: {
            userId: userId
        }
    }

    logToConnectCollection(newRecord);
}

function userReady(socketId, sessionId, userId, extraInfo) {
    var newRecord = {
        socketId: socketId,
        sessionId: sessionId,
        event: 'user-ready',
        info: {
            userId: userId,
            extraInfo: extraInfo
        }
    }

    logToConnectCollection(newRecord);
}

function auditReady(socketId, appName, sessionId) {
    var newRecord = {
        socketId: socketId,
        appName: appName,
        sessionId: sessionId,
        event: 'audit-ready'
    }

    logToConnectCollection(newRecord);
}

function auditDisconnected(socketId, appName, sessionId) {
    var newRecord = {
        socketId: socketId,
        appName: appName,
        sessionId: sessionId,
        event: 'audit-disconnected'
    }

    logToConnectCollection(newRecord);
}

function getAllRecordsByFilter (filter, limit, callback) {
    connectCollection.find(filter).limit(Number(limit)).sort({_id: -1}).toArray(callback);
}

function logScreenMessage(socketId, sessionId, event, controllerId, message) {
    var newRecord = {
        socketId: socketId,
        sessionId: sessionId,
        event: event,
        controllerId: controllerId,
        message: message.toString()
    }

    screenMessagesCollection.insert(newRecord, function (e, results) {
        if (e) {
            console.dir (e);
            return e;
        }
    });
}

function getScreenMessages(sessionId, socketId, callback) {
    var filter = {
        sessionId: Number(sessionId),
        socketId: socketId
    }

    screenMessagesCollection.find(filter).sort({_id:-1}).toArray(callback);
}

module.exports = {
    screenReady: screenReady,
    screenDisconnected: screenDisconnected,
    userDisconnected: userDisconnected,
    userReady: userReady,
    auditReady: auditReady,
    auditDisconnected: auditDisconnected,
    getAllRecordsByFilter: getAllRecordsByFilter,
    logScreenMessage: logScreenMessage,
    getScreenMessages: getScreenMessages
};