'use strict';

var adminAppModule = angular.module('noviSudokuUser', ['noviSudokuTable']),
    config = {},
    SudokuEngine = require('./js/sudoku-genaretor'),
    sudokuEngine = new SudokuEngine(),
    connect = new NoviConnect();

require('./js/sudoku-table');

adminAppModule.controller('noviSayUserCtrl', ['$scope', function ($scope) {
    $scope.showBoard = false;
    $scope.askName = true;
    $scope.sudokuEngine = sudokuEngine;
    $scope.userMessage = '';
    $scope.showCountDown = false;


    function onDisconnectController(msg) {
        $scope.hideAll = true;
        $scope.$apply();
        connect.disconnect();
        alert(msg);
    }

    function onStartGame(gameMatrix) {
        $scope.sudokuEngine.matrix = gameMatrix;
        $scope.showBoard = true;

        $scope.$apply();

        setTimeout(function () {
            updateHints($scope.sudokuEngine.matrix);
            $scope.$apply();

        });

        $scope.showCountDown = false;
    }

    function updateHints(matrix) {
        for (var i = 0; i < 81; i++) {
            if (matrix[i] > 0) {
                var $target = $('#sudoku-cell-' + i + ' span');
                $target.text(matrix[i]);
                $('#sudoku-cell-' + i).addClass('hint');
                $('#sudoku-cell-' + i).removeClass('prog-0');
            }
        }
    }

    function onSetColor (color) {
        $('body').css('background', color);
    }

    function onYouLost(winnerName) {
        popUp(winnerName + ' won, better luck next time. Please refresh to try again');
        connect.disconnect();
    }

    function onYouWon ( ) {
        popUp('You won! Please refresh to play again');
        connect.disconnect();
    }

    function popUp (msg) {
        var $popup = $('.popup'),
            $text = $popup.find('span');

        $popup.addClass('show-me');
        $text.text(msg);
    }

    $('.popup button').click(function () {
        $('.popup').removeClass('show-me');
    });

    function listenToMessages() {
        connect.on('disconnectController', onDisconnectController);
        connect.on('start-game', onStartGame);
        connect.on('set-color', onSetColor);
        connect.on('you-won', onYouWon);
        connect.on('you-lost', onYouLost);
        connect.on('countdown', onCountdown)
    }

    connect.onReady(function () {
        listenToMessages();
    });

    function onCountdown(countDown) {
        $scope.userMessage = countDown;
        if (countDown === 0) {
            $scope.userMessage = '';
        }
        $scope.$apply();
    }

    $scope.updateScreen = function () {
        connect.send('update', {matrix: $scope.sudokuEngine.matrix});
    }

    $scope.submitName = function (name) {
        $scope.askName = false;
        $scope.userMessage = 'Waiting for other players';
        connect.connectUser({name: name});
        $scope.$apply();
    };

    $(document).keypress(function(e) {
        if(e.which == 13 && $scope.askName) {
            $scope.userName = $('.ask-name input').val().toUpperCase();
            $scope.submitName($scope.userName);
        }
    });
}]);
