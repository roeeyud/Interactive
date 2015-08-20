'use strict';

var auditAppModule = angular.module('noviSayAudit', ['noviSayBox']),
    preload = require('./js/user-preload'),
    connect = new NoviConnect();

require('./js/say-box');

connect.connectAudit();

auditAppModule.controller('noviSayAuditCtrl', ['$scope', function ($scope) {
    var messageQueue = [],
        curAck;
    $scope.message = false;

    function auditMessage(message, ack) {
        messageQueue.push({
            message: message,
            ack: ack
        });

        if ($scope.message === false) {
            $scope.message = messageQueue[0].message;
            curAck = ack;
        }

        $scope.$apply();
    }

    $scope.respondToAudit = function (res) {
        if ($scope.message === false || !angular.isFunction(curAck)) {
            return;
        }

        curAck(res);
        messageQueue.shift();
        if (messageQueue.length > 0) {
            $scope.message = messageQueue[0].message;
            curAck = messageQueue[0].ack;
        } else {
            $scope.message = false;
            curAck = false;
        }
    };

    connect.onReady(function () {
        $scope.connectReady = true;
        $scope.config = connect.config;
        $scope.config.fontSize = 35;

        $scope.config.boxSize = $(window).width() * 0.5 ;
        $scope.config.yTextPos = 0.7;

        connect.on('audit-request', function (data, ack) {
            if (data.event !== 'add-message') {
                ack(true);
            } else {
                auditMessage(data.data, ack);
            }
        })
    });

    preload.onProgress(function (event) {
        $scope.preloadProgress = event.progress * 100;
        $scope.$apply();
    })

    preload.onComplete(function () {
        $scope.preloadReady = true;

        $scope.$apply();
    });
}]);
