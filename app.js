'use strict';

var express = require('express'),
    app = express(),
    NoviConnect = require('./novi-connect.io'),
    noviConnect,
    path = require('path'),
    expressBusboy = require('express-busboy'),
    logger = require('morgan'),
    AppStore = require('./src/app-store'),
    browserify = require('browserify-middleware'),
    validateServerFoldersExist = require('./src/tools/validateServerFoldersExist'),
    config = require('./server.json'),
    crossdomain = require('crossdomain'),
    xml = crossdomain({ domain: '*' });

var tmpUploadFolder = path.resolve(path.join(config.serverRootPath, config.uploadDir));

var idTracker = {};

function getNewSessionId (appName) {
    var newRndId;
    do {
        newRndId = Math.round(Math.random() * 10000);
    } while (idTracker[newRndId] !== undefined)

    idTracker[newRndId] = appName;
    return newRndId;
}

function clearSession(sessionId) {
    idTracker[sessionId] = false;
}

function startServer() {
    app.disable('etag');
    app.all('/crossdomain.xml', function (req, res, next) {
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.send(xml, 200);
    });

    app.use(logger('dev'));
    app.set('view engine', 'ejs');

    expressBusboy.extend(app, {
        upload: true,
        path: tmpUploadFolder
    });

    var appStoreRouter = express.Router([]),
        appStore = new AppStore(appStoreRouter);

    app.use('/store', appStoreRouter);
// Set static images
    app.use('/images', express.static(__dirname + '/public/assets/images'));
// Set static lib
    app.use('/lib', express.static(__dirname + '/public/external-lib'))

    app.use('/css', express.static(__dirname + '/public/css'));

    app.use('/templates', express.static(__dirname + '/public/templates'));

    app.use('/images', express.static(__dirname + '/public/images'));

    app.use('/img', express.static(__dirname + '/files/'));

    /**
     * App admin
     */
    app.get('/admin.js', browserify(__dirname + '/public/admin.js', {
        cache: false,
        precompile: false
    }));
    app.get('/admin', function (req, res) {
        res.render('admin');
    });

    /**
     * App stats
     */
    app.get('/stats.js', browserify(__dirname + '/public/stats.js'));
    app.get('/stats', function (req, res) {
        res.render('stats');
    });

    app.get('/connect/:sessionId', function (req, res) {
        var sessionId = req.params.sessionId,
            appName = idTracker[sessionId];

        if (typeof appName === 'string' && appName.length > 0) {
            res.redirect('/store/apps/' + appName + '/user/' + sessionId);
        } else {
            res.send(404);
        }
    });

    app.get('/connect.js', browserify(__dirname + '/public/connect.js'));
    app.get('/connect', function (req, res) {
        res.render('connect');
    });

    app.get('/audit/:sessionId', function (req, res) {
        var sessionId = req.params.sessionId,
            appName = idTracker[sessionId];

        if (typeof appName === 'string' && appName.length > 0) {
            res.redirect('/store/apps/' + appName + '/audit/' + sessionId);
        } else {
            res.send(404);
        }
    });

    app.get('/audit', function (req, res) {
        res.render('audit');
    });

    var httpServer = app.listen(config.port);//3000/*NOVI PORT NUMBER*/);

    noviConnect = new NoviConnect(httpServer, app, getNewSessionId, clearSession);
}

validateServerFoldersExist([tmpUploadFolder], startServer);