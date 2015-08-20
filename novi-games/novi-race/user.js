'use strict';

function getGameId() {
    var fields = document.location.href.split('/');
    return fields[fields.length - 1].split('?')[0].toLowerCase();
}

var controlSettings = require('./user/control.json'),
    uiEngine = require('./user/control-ui'),
    preload = require('./user/control-preload'),
    config = require('./user/config'),
    //tapCounter = require('./tap-counter'),
    totalTap = 0,
    lastTapIndex = -1,
    buttons,
    gameOn = false,
    connect,
    gameId = getGameId(),
    messageBoard,
    infoBox,
    countDownShown = false,
    sendInterval,
    disconnectReason = 'Thank you for playing',
    newCount = false,
    character;

console.log("Hello control");

var sendTapCount = function () {
    // if (newCount) {
    newCount = false;
    connect.send('tapCount', {
        countData: totalTap
    });
    //   }
};

var addTap = function () {
    newCount = true;
    totalTap++;
};

var onStartGame = function () {
    countDownShown = false;
    messageBoard.hide();
    messageBoard.showTap();

    gameOn = true;
    totalTap = 0;
    sendInterval = setInterval(sendTapCount, 250);
};

var onPlayerLost = function () {
    totalTap = 0;
    messageBoard.showLose();
    clearInterval(sendInterval);
};

var onPlayerWon = function () {
    totalTap = 0;
    messageBoard.showWin();
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].hide();
    }
    clearInterval(sendInterval);
};

var controlerSet = false;

var onSetControlId = function (userId) {
    console.log("onSetControlId %d", userId);
    character = uiEngine.initCharacter(userId);
    if (controlerSet) {
        return;
    }
    controlerSet = true;

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].setPlayerId(userId);
    }

    messageBoard.connectedMessage();
};

var onCountDown= function (timer) {
    totalTap = 0;

    if (!countDownShown) {
        messageBoard.countDownMessage();
    }

    countDownShown = true;
    messageBoard.countdown(timer);
};

var onDisconnect = function () {
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].hide();
    }
    messageBoard.disconnectedMessage(disconnectReason);
    character.hide();
};

var onDisconnectController = function (reason) {
    disconnectReason = reason;
    connect.disconnect();
};

var onErrorMessage = function (msg) {
    messageBoard.errorMessage(msg);
};

var requestName = function () {
    var $form = $(document).find('.name-form'),
        $nameInput = $(document).find('#name-input'),
        $submitButton = $(document).find('#enter-name');

    messageBoard.hide();
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].hide();
    }

    function clearEvents() {
        $submitButton.unbind('click', respond);
        $nameInput.unbind('keypress', onKey);
    }

    function onKey (event) {
        if(event.which == 13) {
            respond();
        }
    }

    function verifyName (name) {
        return typeof name === 'string' && name.length > 2;
    }

    $form.show();

    $submitButton.bind('click', respond);
    $nameInput.bind('keypress', onKey);

    connect.on('disconnect', function () {
        clearEvents();
        $form.hide();
    });

    function respond() {
        var name = $nameInput.val();
        if (verifyName(name)) {
            $(document).find('.name-form').hide();

            clearEvents();
            connect.send('respondInfo', {
                name: name
            });
            $form.hide();
        } else {
            alert('Please enter valid name');
        }
    }

};

var initConnect = function () {
    connect = new NoviConnect();
    connect.connectUser({team: config.team});

    connect.onReady(function () {
        connect.on('startGame', onStartGame);
        connect.on('error-message', onErrorMessage);
        connect.on('countDown', onCountDown);
        connect.on('playerWon', onPlayerWon);
        connect.on('playerLost', onPlayerLost);
        connect.on('setUserId', onSetControlId);
        connect.on('disconnect', onDisconnect);
        connect.on('disconnectController', onDisconnectController);
        connect.on('requestName', requestName);
    })
};

preload.onComplete(function () {
    uiEngine.getImage = preload.getImage;   // Enables uiEngine to get images from preload
    uiEngine.onReady(function () {
        $('canvas').nodoubletapzoom();
        initConnect();
        messageBoard = uiEngine.initBoard();
        messageBoard.welcomeMessage();
        buttons = uiEngine.initButtons(2);

        buttons[0].on('click', function () {
            //if (lastTapIndex === 0) {
            //    return;
            // }
            if (gameOn) {
                lastTapIndex = 0;
                addTap();
            }
        });

        buttons[1].on('click', function () {
            //if (lastTapIndex === 1) {
            //    return;
            //}
            if (gameOn) {
                lastTapIndex = 1
                addTap();
            }
        });
    });
});


// Prevent dounble tap zoom
(function($) {
    $.fn.nodoubletapzoom = function() {
        $(this).bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp
                , t1 = $(this).data('lastTouch') || t2
                , dt = t2 - t1
                , fingers = e.originalEvent.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 500 || fingers > 1) return; // not double-tap

            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
            return this;
        });
    };
})(jQuery);