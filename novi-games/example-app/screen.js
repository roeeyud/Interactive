'use strict';

var connect = new NoviConnect(),
    $header,
    $messageBoard;

$(document).ready(function () {
    $header = $('.header');
    $messageBoard = $('.message-board');

    connect.startScreen();

    connect.onReady(function () {
        $('.session-id-header').text('Connect to id:' + connect.sessionId);
        $header.css({fontSize: connect.config.fontSize});
        $header.text(connect.config.headerMsg);

        // connection to server established.
        connect.on('addMessage', function (msg) {
            // Send message back to the same user that sent hello-screen message with the same data he sent the screen.
            logMsg('User #' + msg.userId + ' sent: ' + msg.message);
        });
    });

    function logMsg(msg) {
        var newMsg = $('<div class="message"></div>');

        $(newMsg).text(msg);

        $messageBoard.append(newMsg);
    }
});


