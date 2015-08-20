/**
 * Created by Pc on 06/06/2014.
 */
'use strict';

var config,
    gameStage,
    isReady = false,
    EventEmitter = require('events').EventEmitter,
    colors = ['red', 'purple', 'blue', 'green',  '#990099', 'FF9900'],
    _readyCallback = function () {
        console.log("_readyCallback unassigned");
    },
    events = new EventEmitter(),
    qrImage,
    canvas,
    canvasCtx,
    qrImageReady = false,
    _tick = function (event) {
        events.emit('tick', event.delta / 1000);
        gameStage.update();
        if (qrImageReady && showQrObj.showQr) {
            canvasCtx.drawImage(qrImage, 1110, 5, 150, 150);
        }
    },
    gameConfig = require('./game.json'),
    uiObjects = require('./game-ui-objects'),
    showQrObj,
    /******************************************************
     *  game-ui API
     *******************************************************/
    uiEngine = {
        showQR: function (qrCode, qrHelper) {
            qrImage = new Image();
            canvas = document.getElementById("game-stage");
            canvasCtx = canvas.getContext("2d");
            showQrObj = qrHelper;
            qrImage.onload = function() {
                qrImageReady = true;
            };
            qrImage.src = qrCode;
        },
        onReady: function (callback) {
            if (isReady) {
                callback();
            } else {
                _readyCallback = callback;
            }
        },
        initMessageBoard: function () {
            return new uiObjects.MessageBoard(gameStage,  uiEngine.getImage);
        },
        initMil: function () {
            return new uiObjects.Mil(gameStage);
        },
        initFinishLine: function () {
            return new uiObjects.FinishLine(gameStage, uiEngine.getImage);
        },
        initPlayers: function (numOfCircles) {
            var i,
                retPlayers = [],
                player;

            for (i = 0; i < numOfCircles; i++) {
                // Definition of player object
                player = new uiObjects.Player(gameStage, i, colors[i % colors.length]);
                player.init(events);
                retPlayers.push(player);
            }

            return retPlayers;
        },
        initOnlineArray: function (numOfPlayes, names) {
            var i,
                retArray = [],
                indicator;

            for (i = 0; i < numOfPlayes; i++) {
                // Definition of indicator
                indicator = new uiObjects.OnlineIndicator(gameStage, i, uiEngine.getImage, names[i] || i);
                indicator.drawOffline();
                retArray.push(indicator);
            }

            return retArray;
        },
        initLine: function () {
            var line = new uiObjects.FinishLine(gameStage, uiEngine.getImage);

            return line;
        },
        getImage: function (imageName) {
            console.log("getImage unassigned");
        },
        on: function (event, cb) {
            events.on(event, cb);
        },
        setConfig: function (newConfig) {
            config = newConfig;
        }
    };

$(document).ready(function () {
    gameStage = new createjs.Stage("game-stage"),

//    $("#game-stage").width(canvasWidth);
    createjs.Ticker.setFPS(gameConfig.ui.FPS);
    createjs.Ticker.addEventListener("tick", _tick);

    isReady = true;

    if (typeof _readyCallback === 'function') {
        _readyCallback();
    }
});

module.exports = uiEngine;
