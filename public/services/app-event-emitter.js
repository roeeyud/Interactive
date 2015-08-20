var module = angular.module('appEventsService', []),
    EventEmitter = require('events').EventEmitter;

module.factory('appEventEmitter', function () {
    var eventEmitter = new EventEmitter();

    return eventEmitter;
})