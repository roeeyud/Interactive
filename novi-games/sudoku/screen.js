'use strict';

var sayAppModule = angular.module('noviSudokuScreen', ['noviSudokuTable', 'monospaced.qrcode']),
    connect = new NoviConnect(),
    SudokuEngine = require('./js/sudoku-genaretor'),
    sudokuEngine = new SudokuEngine();

require('./js/sudoku-table');
//require('./js/preload')

var playerColors = ['#f39020', '#bad531', '#4a51a3', '#d91c54'];


function getColRow(index) {
    return {
        col: index % 9,
        row: Math.floor(index / 9)
    };
}


var playerMatrixes = {};
sayAppModule.controller('noviSudokuCtrl', ['$scope', function ($scope) {
    function initOnlineUsers() {
        $scope.onlineUsers = [{name: 'Waiting...'}, {name: 'Waiting...'}, {name: 'Waiting...'}, {name: 'Waiting...'}];
    }

    initOnlineUsers();
    //$scope.onlineUsers = [];
    function handlePlayerStatus(userId, online, extraInfo) {
        if (userId < connect.config.maxPlayer && $scope.gameState === $scope.gameStates.WAITING) {
            if (online) {
                if ($scope.onlineUsers[userId] == undefined || $scope.onlineUsers[userId] === null) {
                    $scope.onlineUsers[userId] = {};
                }
                if (extraInfo && extraInfo.name) {
                    $scope.onlineUsers[userId].name = extraInfo.name;
                } else {
                    $scope.onlineUsers[userId].name = 'Player-' + userId;
                }
                $scope.onlineUsers[userId].online = true;
                $scope.onlineUsers[userId].color = playerColors[userId];

                connect.send('set-color', playerColors[userId], userId);

            } else {
                delete $scope.onlineUsers[userId];
                if (getOnlineCount() === 0 && $scope.gameState === $scope.gameStates.IN_PROGRESS) {
                    restartGame();
                }
            }
        } else {
            if (online) {
                connect.send('disconnectController', 'Game is full, please try again later', userId);
                delete $scope.onlineUsers[userId];
            } else {
                delete $scope.onlineUsers[userId];
                if (getOnlineCount() === 0 && $scope.gameState === $scope.gameStates.IN_PROGRESS) {
                    restartGame();
                }
            }
        }
    }

    function startGame() {
        if ($scope.gameState === $scope.gameStates.IN_PROGRESS) {
            return;
        }

        $scope.gameState = $scope.gameStates.IN_PROGRESS;
        sudokuEngine.done = function () {
            $scope.sudokuEngine = sudokuEngine;
            connect.send('start-game', $scope.sudokuEngine.matrix);
            $scope.$apply();
            updateHints($scope.sudokuEngine.matrix);
        };
        if (connect.config.superEasy) {
            sudokuEngine.superEasy = true;
        }

        $scope.countDownMessage = '';
        $scope.connectMessage = '';
        $scope.curCountDown = '';

        sudokuEngine.newGame();
    }

    function getCountdownMessage() {
        return 'Starting in: ' + $scope.curCountDown;

    }
    function startCountDown() {
        $scope.curCountDown = connect.config.countdown;
        $scope.$apply();
        var interval = setInterval(function () {
            $scope.curCountDown--;
            connect.send('countdown', $scope.curCountDown);

            $scope.countDownMessage = getCountdownMessage();

            $scope.$apply();

            if ($scope.curCountDown <= 0) {
                $scope.curCountDown = 0;
                clearInterval(interval);
                startGame();
            }
        }, 1000);
    }

    function checkStart() {
        if ($scope.gameState === $scope.gameStates.WAITING) {
            showWaitingMessage();
            var count = getOnlineCount();

            if (count >= connect.config.minPlayer && !$scope.curCountDown)
                startCountDown();

        }
    }

    function onPlayerStatus(data) {
        handlePlayerStatus(data.userId, data.online, data.extraInfo);

        checkStart();
        $scope.$apply();
    }

    $scope.playerProgress = [];
    function setPosProgress(userId, index, res) {
        if ($scope.playerProgress[index] === undefined) {
            $scope.playerProgress[index] = 0;
        }
        if (res) {
            if (!($scope.playerProgress[index] >> userId & 1)) {
                $scope.playerProgress[index] = $scope.playerProgress[index] + Math.pow(2, userId);
            }
        } else {
            if ($scope.playerProgress[index] >> userId & 1) {
                $scope.playerProgress[index] = $scope.playerProgress[index] - Math.pow(2, userId);
            }
        }
    }

    var hintList = [],
        hintCount = 0;

    function updateHints(matrix) {
        hintList = [];
        hintCount = 0;
        for (var i = 0; i < 81; i++) {
            if (matrix[i] > 0) {
                hintList[i] = matrix[i];
                hintCount++;

                var $target = $('#sudoku-cell-' + i + ' span');
                $target.text(matrix[i]);
                $('#sudoku-cell-' + i).addClass('hint');
                $('#sudoku-cell-' + i).removeClass('prog-0');
            }
        }
    }

    function updateMatrix(matrix) {
        for (var i = 0; i < 81; i++) {
            if (matrix[i] > 0) {
                hintList[i] = matrix[i];
                hintCount++;

                var $target = $('#sudoku-cell-' + i + ' span');
                $target.text(matrix[i]);
            }
        }
    }

    var tmpEngine = new SudokuEngine();
    function getValidPositions(userId, matrix) {
        var result = [];
        playerMatrixes[userId] = matrix;
        tmpEngine.matrix = matrix;

        tmpEngine.matrix.forEach(function (item, index) {
            if (hintList[index] === undefined) {
                var colRow = getColRow(index),
                    res = $scope.sudokuEngine.checkVal(colRow.row, colRow.col, item);

                if (res) {
                    result.push(index);
                    setPosProgress(userId, index, true);
                } else {
                    setPosProgress(userId, index, false);
                }
            }
        });

        return result;
    }

    function updatePlayerProgress(userId, matrix) {
        var validPos = getValidPositions(userId, matrix);

        $scope.onlineUsers[userId].gameProgress = (validPos.length) / (81 -  hintCount) * 100;
    }

    function declareWinner(winnerId) {
        $scope.onlineUsers.forEach(function (onlineUserObj, userId) {
            if (!angular.isObject(onlineUserObj)) {
                return;
            }

            if (userId === winnerId) {
                connect.send('you-won', userId, userId);
            } else {
                connect.send('you-lost', $scope.onlineUsers[winnerId].name, userId);
            }
        });

        //$scope.sudokuEngine.matrix = playerMatrixes[winnerId];
        updateMatrix(playerMatrixes[winnerId]);
        $scope.countDownMessage = $scope.onlineUsers[winnerId].name + ' WON!';
        $scope.curCountDown = '';
        $scope.gameState = $scope.gameStates.WAITING;
        initOnlineUsers();

        setTimeout(function () {
            if ($scope.gameState === $scope.gameStates.WAITING)
                showWaitingMessage();
            $scope.$apply();
        }, 10 * 1000);
    }

    function restartGame () {
        $scope.gameState = $scope.gameStates.WAITING;
        initOnlineUsers();
        showWaitingMessage();
    }

    function checkController(onlineUserObj, userId) {
        if (!angular.isObject(onlineUserObj)) {
            return;
        }

        if (onlineUserObj.gameProgress === 100) {
            declareWinner(userId);
        }
    }

    $scope.$watch('onlineUsers', function (onlineUsers) {
        if (!Array.isArray(onlineUsers)) {
            return;
        }

        onlineUsers.forEach(checkController);

    }, true);

    function onUpdate(data) {
        var matrix = data.matrix,
            userId = data.userId;

        updatePlayerProgress(userId, matrix);
        $scope.$apply();
    }

    function onAllPlayerStatus (data) {
        if (!Array.isArray(data)) {
            return;
        }
        var userId;

        for (userId = 0; userId < data.length; userId++) {
            if (data[userId] !== null)
                handlePlayerStatus(userId, data[userId].online, data[userId].extraInfo);
        }

        $scope.$apply();

        checkStart();
    }

    function listenToMessages () {
        connect.on('userStatus', onPlayerStatus);
        connect.on('allUserStatus', onAllPlayerStatus);
        connect.on('update', onUpdate);
    }

    $scope.gameStates = {
        WAITING: 0,
        IN_PROGRESS: 1
    };

    function getOnlineCount() {
        var count = 0;
        $scope.onlineUsers.forEach(function (item) {
            if (item && item.online) {
                count++
            }
        })

        return count;
    }

    function showWaitingMessage() {
        $scope.connectMessage = connect.sessionId + '';
    }

    $scope.gameState = $scope.gameStates.WAITING;
    connect.startScreen();
    connect.onReady(function () {
        $scope.connectUrl = connect.connectUrl;
        $scope.qrImg = connect.qrCode;
        $scope.qRLink = window.location.origin + '/connect/' + connect.sessionId;
        $scope.sessionId = connect.sessionId;
//        $('.session-id-header').text('Connect to id:' + connect.sessionId);
        showWaitingMessage();
        listenToMessages();
        $scope.connectReady = true;
        $scope.$apply();
    });
}]);

