'use strict';

var sayAppModule = angular.module('noviSayScreen', ['monospaced.qrcode']),
    config,
    connect = new NoviConnect();

require('./screen/message-view');

connect.startScreen();

sayAppModule.controller('noviSayCtrl', ['$scope', function ($scope) {
    $scope.preloadProgress = 0;
    $scope.preloadReady = true;
    $scope.pointer = 0;

    //$scope.messageQueue = [];

    $scope.messageQueue = [
        {img: 'files/images/flam.png', text: 'Welcome'},
        {img: 'files/images/flam.png', text: 'Welcome'},
        {img: 'files/images/flam.png', text: 'Welcome'},
        {img: 'files/images/flam.png', text: 'Welcome'},
        {img: 'files/images/flam.png', text: 'Welcome'},
        {img: 'files/images/flam.png', text: 'Welcome'}
    ];

    $scope.getPointer = function (point, diff) {
        if ($scope.messageQueue.length === 0) {
            return;
        }

        if (point + diff < 0) {
            diff = diff + (point + 1);
            point = $scope.messageQueue.length - 1;
            return $scope.getPointer(point, diff);
        } else if (point + diff >= $scope.messageQueue.length) {
            diff = diff - ($scope.messageQueue.length - point);
            point = 0;
            return $scope.getPointer(point, diff);
        }

        return point + diff;
    }

    function onReady() {
        $scope.connect = connect;

        $scope.infoMessage = 'Go to ' + $scope.connect.connectUrl + ' to post your photos! Enter ' + $scope.connect.sessionId + ' to start!';

        connect.on('add-message', function (message) {
            connect.send('disconnectController', 'Thank you!', message.userId);

            addMessage(message)
            $scope.$apply();
        });

        function addMessage(message) {
            $scope.messageQueue.push(message)
        }

        function movePointer() {
            if ($scope.messageQueue.length > $scope.connect.config.maxMessages) {
                $scope.messageQueue.splice(0, 1);
                $scope.pointer = $scope.pointer - 1;
            }

            if ($scope.pointer < 0) {
                $scope.pointer = 0;
            } else if ($scope.pointer >= $scope.messageQueue.length - 1) {
                $scope.pointer = 0;
            } else {
                $scope.pointer++;
            }
            $scope.$apply();
        }

        setInterval(movePointer, $scope.connect.config.interval * 1000);
        $scope.$apply();
    }

    connect.onReady(onReady);

}]);
