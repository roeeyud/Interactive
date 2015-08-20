'use strict';

var $input;

function connectToLink() {
    if ($input == undefined) {
        return;
    }

    var str = window.location.href;

    if (window.location.href.substr(window.location.href.length - 1) !== '/') {
        str = str + '/';
    }
    window.location.href = str + $input.val();
}

window.connectToLink = connectToLink;

$(document).ready(function () {
    $input = $('input');

    $('body').keypress(function (event) {
        if (event.which === 13) {
            var val = $input.val();
            if (typeof val === 'string' && val.length > 0) {
                connectToLink();
            }
        }
    });
});

