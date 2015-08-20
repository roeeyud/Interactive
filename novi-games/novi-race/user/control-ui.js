/**
 * Created by Pc on 06/06/2014.
 */
'use strict';

var uiSettings = require('./control.json').ui,
    //toggleFullScreen = require('./toggle-full-screen'),
    controlStage,
    isReady = false,
    colors = ['red', 'yellow', 'blue', 'green',  '#990099', 'FF9900'],
    back,
    readyCallback = function () {
        console.log("readyCallback unassigned");
    },
    tick = function () {
        controlStage.update();
    },
    uiObjects = require('./control-ui-objects'),
    messageBoard,

    /******************************************************
     *  control-ui API
     *******************************************************/
    uiEngine = {
        onReady: function (callback) {
            if (isReady) {
                callback();
            } else {
                readyCallback = callback;
            }
        },
        initBoard: function () {
            return new uiObjects.MessageBoard(controlStage, this.getImage);
        },
        initCharacter: function (userId) {
            return new uiObjects.Character(controlStage, this.getImage, userId);
        },
        initButtons: function (numOfCircles) {
            var retPlayers = [],
                button;

            // Definition of button object
            button = new uiObjects.Button(controlStage, 0, this.getImage);
            //button.draw();
            retPlayers.push(button);
            button = new uiObjects.Button(controlStage, 1, this.getImage);
            //button.draw();
            retPlayers.push(button);

            return retPlayers;
        },
        getImage: function (imageName) {
            console.log("getImage unassigned");
        }
    };

// Handle Ready
$(document).ready(function () {
    controlStage = new createjs.Stage("control-stage");
    createjs.Touch.enable(controlStage, true, true);

    createjs.Ticker.setFPS(uiSettings.FPS);
    createjs.Ticker.addEventListener("tick", tick);

    isReady = true;

    if (typeof readyCallback === 'function') {
        readyCallback();
    }

    //$("#landscape").show();
});



module.exports = uiEngine;