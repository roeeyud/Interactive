'use strict';

var uiEngine = require('./screen/game-ui'),
    preload = require('./screen/game-preload'),
    startTimeManager = require('./screen/start-time-manager'),
    playerUiArray,
    onlineArray,
    finishLine,
    mil,
    countingDown = false,
    messageBoard,
    STATE_ENUM = {
        WAITING: 0,
        STARTING: 1,
        GAME_ON: 2,
        GAME_OFF: 3
    },
    gameStatus = STATE_ENUM.WAITING,
    gameId,
    connect,
    teamMng = require('./screen/team-manager'),
    teamGame,
    gameConfig = require('./screen/game.json'),
    qrHelper = {};

var gameIsReady = false;

var initConnect = function () {

    connect = new NoviConnect();

    connect.startScreen();
    connect.onReady(function () {
        if (!mil) {
            mil = uiEngine.initMil();
        }

        qrHelper.showQr = true;
        teamGame = connect.config.team;

        uiEngine.setConfig(connect.config);

        if (!Array.isArray(connect.config.names)) {
            connect.config.names = connect.config.names.split(',');
            var len = connect.config.names.length;
            for (var i = 0; i < 4 - len; i++) {
                connect.config.names.push('Player ' + (len + i + 1) + '');
            }
        }

        teamMng.setTeams(connect.config.names);
        gameId = connect.sessionId;
        $('.session-id-header').text('Scan code or connect to ' + connect.sessionId);
        connect.on('req-countdown', onReqCountdown);
        connect.on('res-countdown', onResCountdown);
        connect.on('userStatus', onPlayerStatus);
        connect.on('disconnect', function () {
            connect.disconnect();
            messageBoard.showDisconnectMessge();
        });
        if (connect.config.showQr) {
            uiEngine.showQR(connect.qrCode, qrHelper);
        }

        connect.on('respondInfo', onRespondInfo);
        listenToController();

        if (connect.config.startDate && connect.config.startTime) {
            startTimeManager.startCount(printTimeLeft, connect.config.startDate, connect.config.startTime, getItOn)
        } else {
            getItOn();
        }
    })


};

var listenToController = function () {
    connect.on('tapCount', onTapCount);
    connect.on('allUserStatus', onAllPlayerStatus);
    connect.on('error-message', onErrorMessage);
}

function onReqCountdown() {
    connect.send('res-countdown', startTimeManager.getCountdown());
    if (startTimeManager.getCountdown() <= 0) {
        connect.send('getItOn', connect.config);
    }
}

function onStartGame(onlineArray) {
    onAllPlayerStatus(onlineArray);
    messageBoard.hide();
    startGame();
}

function onPlayerWon(playerId) {
    playerWon(playerId);
}

function onRespondInfo(data) {
    /*
     if (data.name !== undefined) {
     $.ajax({
     type: 'POST',
     data: JSON.stringify({
     name: data.name
     }),
     contentType: 'application/json',
     url: '/gameDB/' + gameId + '/addWinner',
     success: function (data) {
     console.log('success');
     console.log(JSON.stringify(data));
     }
     });
     }
     */
}

function onCountDown(counter) {
    resetPlayers();
    messageBoard.countDownMessage(gameId, connect.connectUrl, counter);
}

function resetPlayers() {
    var i;
    for (i = 0; i < playerUiArray.length; i++) {
        playerUiArray[i].resetPlayer();
    }
}

function checkWinner() {
    var i, curWinner;

    if (gameStatus !== STATE_ENUM.GAME_ON) {
        return;
    }

    for (i = 0; i < playerUiArray.length; i++) {
        if (playerUiArray[i].getX() >= gameConfig.target) {
            if (curWinner === undefined) {
                curWinner = {
                    id: i,
                    count: playerUiArray[i].getX()
                };
            } else {
                if (playerUiArray[i].getX() > curWinner.count) {
                    curWinner = {
                        id: i,
                        count: playerUiArray[i].getX()
                    };
                }
            }
        }
    }

    if (curWinner !== undefined) {
        for (i = 0; i < playerUiArray.length; i++) {
            playerUiArray[i].stop();
        }
        playerWon(curWinner.id);
    }
}

function startGame() {
    var i,
        online = [];
    gameStatus = STATE_ENUM.GAME_ON;
    qrHelper.showQr = false

    for (i = 0; i < onlineArray.length; i++) {
        online.push({online: onlineArray[i].isOnline});
    }

    connect.send('startGame', online);
    startGameTimeout()

    for (i = 0; i < playerUiArray.length; i++) {
        if (onlineArray[i].isOnline) {
            playerUiArray[i].start();
        } else {
            playerUiArray[i].hide();
        }
    }
}

var gameTimeoutRef;

function startGameTimeout(){
    if (gameTimeoutRef) {
        clearTimeout(gameTimeoutRef);
    }

    gameTimeoutRef = setTimeout(onGameTimeout, connect.config.gameTimeout * 1000);
}

function onGameTimeout() {
    if (gameStatus === STATE_ENUM.GAME_ON) {
        connect.send('disconnectController', 'Game restarted due to timeout');
        messageBoard.startMessage(gameId, connect.connectUrl);
        for (var i = 0; i < onlineArray.length; i++) {
            onlineArray[i].drawOffline();
        }

        restartGame();
        checkStart();
    }
}

function playerWon(teamIndex) {
    var i;
    gameStatus = STATE_ENUM.GAME_OFF;
    if (teamGame) {
        teamMng.forEachOfSameTeam(teamIndex, function (sendTo){
            connect.send('playerWon', sendTo, sendTo);
        });
    } else {
        connect.send('playerWon', teamIndex, teamIndex);
        //connect.send('requestName', teamIndex, teamIndex);
    }

    //Global message
    //connect.send('playerWon', teamIndex, teamIndex);

    for (i = 0; i < 4; i++) {
        playerUiArray[i].stop();

        if (i !== teamIndex) {
            if (teamGame) {
                teamMng.forEachOfSameTeam(i, function (sendTo) {
                    connect.send('playerLost', sendTo, sendTo);
                });
            } else {
                connect.send('playerLost', i, i);
            }
        }
    }

    messageBoard.playerWon(connect.config.names[teamIndex]);

    setTimeout(function () {
        gameStatus = STATE_ENUM.WAITING;
        qrHelper.showQr = true;
        connect.send('disconnectController', 'Thank you for playing');
        messageBoard.startMessage(gameId, connect.connectUrl);
        for (i = 0; i < onlineArray.length; i++) {
            onlineArray[i].drawOffline();
        }

        restartGame();
        checkStart();
    }, connect.config.pause * 1000);
}

var counter = 0,
    stopCountDown = false;

function startCountdown() {
    if (countingDown || counter !== 0) {
        console.log('countingDown already true, gameStatus = ' + gameStatus);
        return;
    }
    gameStatus = STATE_ENUM.STARTING;
    stopCountDown = false;
    resetPlayers();
    counter = connect.config.countdown;

    function countMeDown() {
        if (stopCountDown) {
            counter = 0;
            stopCountDown = false;
            countingDown = false;
            return;
        }
        countingDown = true;
        gameStatus = STATE_ENUM.STARTING;
        counter--;
        connect.send('countDown', counter);
        checkStart();
        if (counter <= 0) {
            counter = 0;
            messageBoard.hide();
            startGame();
            countingDown = false;
        } else {
            messageBoard.countDownMessage(gameId, connect.connectUrl, counter);
            setTimeout(countMeDown, 1000);
        }
    };

    countingDown = true;
    setTimeout(countMeDown, 1000);
}

var checkStartLoop = 0;

function checkStart() {
    var count = 0,
        i;

    for (i = 0; i < onlineArray.length; i++) {
        if (onlineArray[i].isOnline) {
            count++;
        }
    }

    if (count >= connect.config.minPlayer && gameStatus === STATE_ENUM.WAITING) {
        startCountdown();
    }


    messageBoard.updatePlayersOnline(onlineArray.length, count);
}

var onTapCount = function (data) {
    if (gameStatus === STATE_ENUM.GAME_ON) {
        var playerId = data.userId,
            count = data.countData,
            res;

        if (teamGame) {
            res = teamMng.getIndexAndCount(playerId, count);
            playerUiArray[res.playerId].advancePlayer(res.count, connect.config.speed);
        } else {
            playerUiArray[playerId].advancePlayer(count, connect.config.speed);
        }
    }
};

var handlePlayerStatus = function (playerId, online, extraInfo) {
    var index, newId;
    if (online) {
        if (gameStatus !== STATE_ENUM.WAITING && gameStatus !== STATE_ENUM.STARTING) {
            connect.send('disconnectController', 'Game has already started', playerId);
        } else {
            if (teamGame) {
                newId = connect.config.names.indexOf(extraInfo.team);
                teamMng.addPlayer(playerId, extraInfo.team);
            } else {
                newId = playerId;
            }

            if (newId >= 0 && newId <= gameConfig.numOfPlayers - 1) {
                // Valid Id
                onlineArray[newId].drawOnline();
                connect.send('setUserId', newId, playerId);
            } else {
                connect.send('disconnectController', 'Game is full, please try again later', playerId);
            }
        }
    } else {
        var teamId = playerId;
        if (teamGame) {
            teamId = teamMng.removePlayer(playerId);
        }
        if (teamId >= 0) {
            onlineArray[teamId].drawOffline();
        }
    }
};

var checkIfNeedToRestart = function () {
    if (gameStatus === STATE_ENUM.WAITING) {
        return;
    }

    var count = 0;
    for (var i = 0; i < onlineArray.length; i++) {
        if (onlineArray[i].isOnline) {
            count++
        }
    }

    if (count === 0) {
        messageBoard.startMessage(gameId, connect.connectUrl);
        restartGame();
        checkStart();
    }
}

var onPlayerStatus = function (data) {
    if (gameIsReady) {
        handlePlayerStatus(data.userId, data.online, data.extraInfo);

        if (gameStatus === STATE_ENUM.WAITING) {
            checkStart();
        }
    } else{
        connect.send('disconnectController', 'Game is unavailable', data.userId);
    }
    checkIfNeedToRestart();

};

var onAllPlayerStatus = function (data) {
    var i;
    if (data === undefined || data === null) {
        return;
    }
    for (i = 0; i < data.length; i++) {
        if (data[i] !== undefined && data[i] !== null)
            handlePlayerStatus(i, data[i].online, data[i].extraInfo);
    }

    if (gameStatus === STATE_ENUM.WAITING) {
        checkStart();
    }

    checkIfNeedToRestart();
};

var onErrorMessage = function (msg) {
    messageBoard.showError(msg);
}

function restartPlayers () {
    for (var i = 0; i < playerUiArray.length; i++) {
        playerUiArray[i].advancePlayer(0, 300);
        playerUiArray[i].resetPlayer();
        playerUiArray[i].stop();
        playerUiArray[i].show();
    }
}

var restartGame = function () {

    stopCountDown = true;
    restartPlayers();
    gameStatus = STATE_ENUM.WAITING;
    qrHelper.showQr = true;
    checkStart();
};

var printTimeLeft = function (prettyTime) {
    messageBoard.printTime(prettyTime);
}

var getItOn = function () {
    messageBoard.startMessage(gameId, connect.connectUrl);
    if (!gameIsReady) {
        gameIsReady = true;
        onlineArray = uiEngine.initOnlineArray(gameConfig.numOfTeams, connect.config.names);
        playerUiArray = uiEngine.initPlayers(gameConfig.numOfTeams);

        uiEngine.on('tick', checkWinner);
        if (connect.config.demoLoopInterval) {
            setUpDemo();
        }
    }
}

var reqInterval;

function onResCountdown(count) {
    startTimeManager.checkCount(printTimeLeft, count, function () {
        clearInterval(reqInterval);
    });
}

preload.onComplete(function () {
    uiEngine.getImage = preload.getImage;   // Enables uiEngine to get images from preload
    uiEngine.onReady(function () {
       // $('.with-border').removeClass('with-border');
        initConnect();
        // Show first screen before connection
        finishLine = uiEngine.initFinishLine();
        messageBoard = uiEngine.initMessageBoard();

    });
});

var demoLoopCount = 0,
    demoRunning = false,
    flashDemo = true;

function setUpDemo() {
    setInterval(function () {
        if (gameStatus === STATE_ENUM.WAITING) {
            if (!demoRunning) {
                demoLoopCount++;
                if (demoLoopCount === connect.config.demoLoopInterval) {
                    startDemo();
                }
            } else if (flashDemo) {
                flashDemo = false;
                $('.demo-title').show();
            } else {
                flashDemo = true;
                $('.demo-title').hide();
            }
        } else if (demoRunning) {
            stopDemo();
        }
    }, 1000);

    $('.demo-title').hide();
}

var intervalRef;

function startDemo () {
    demoRunning = true;
    demoLoopCount = 0;
    $('.demo-title').show();
    playerUiArray.forEach(function (elem) {
        elem.online = true;
        elem.start();
    });
    var counts = [0, 0, 0 ,0],
        curI = 0;
    intervalRef = setInterval(function () {
        var clickCount = Math.round(Math.random() * 7);

        counts[curI % 4] = counts[curI % 4] + clickCount;
        playerUiArray[curI % 4].advancePlayer(counts[curI % 4], connect.config.speed);
        curI++;
        messageBoard.startMessage(gameId, connect.connectUrl);

        playerUiArray.forEach(function (elem) {
            if (elem.getX() >= gameConfig.target) {
                stopDemo();
            }
        })
    }, 100);
}

function stopDemo () {
    demoRunning = false;
    if (gameStatus === STATE_ENUM.WAITING) {
        restartGame();
        checkStart();
    } else {
        restartPlayers();
    }

    $('.demo-title').hide();
    if (intervalRef) {
        clearInterval(intervalRef);
        intervalRef = null;
    }

}
