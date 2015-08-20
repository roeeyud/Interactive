'use strict';

var connect = new NoviConnect();

$(document).ready(function () {
    var $input = $('input'),
        $button = $('button');

    connect.connectUser();

    connect.onReady(function () {
        $button.click(function () {
            connect.send('addMessage', {message: $input.val()});
            $input.val('');
        })

        $('body').keypress(function (event) {
           if (event.which === 13) {
               connect.send('addMessage', {message: $input.val()});
               $input.val('');
           }
        });
    });
})