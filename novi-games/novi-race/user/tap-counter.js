'use strict';

var EventEmitter = require('events').EventEmitter,
    eventEmitter = new EventEmitter(),
    totalCount = 0,
    target,
    tapHandler = function () {
        totalCount++;
        if (totalCount > target) {
            eventEmitter.emit('target');
        }
    },
/******************************************************
*  tap-counter API
*******************************************************/
    tapCounter = {
        startCounting: function () {
            totalCount = 0;
            $("#control").bind("tap", tapHandler);
            $("#control").bind("click", tapHandler);
        },
        stopCounting: function () {
            $("#control").unbind("tap", tapHandler);
            $("#control").unbind("click", tapHandler);
        },
        setTarget: function (newTarget) {
            target = newTarget;
        },
        getTotal: function () {
            return totalCount;
        },
        events: eventEmitter
    };

module.exports = tapCounter;
