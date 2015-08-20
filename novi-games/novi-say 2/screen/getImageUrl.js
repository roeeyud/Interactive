'use strict';

var urlList = {
    wink: 'files/images/piskel-wink.png',
    clap: 'files/images/piskel-clap.png',
    hart: 'files/images/piskel-hart.png',
    star: 'files/images/piskel-star.png'
};

module.exports = function (back) {
    return urlList[back];
}