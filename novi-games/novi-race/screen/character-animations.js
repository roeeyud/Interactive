'use strict';

var loader = require('./game-preload'),
    frameRate = 25;

module.exports = {
    shafan: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/animal_shafan_185x185x64f.png'],
        frames: {
            width: 185,
            height: 185,
            count: 64
        },
        animations: {
            run: [0, 63]
        }
    }),
    yaen: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/animal_yaen_185x185_47f.png'],
        frames: {
            width: 185,
            height: 185,
            count: 47
        },
        animations: {
            run: [0, 46]
        }
    }),
    kof: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/animal_kof_185x185x61f.png'],
        frames: {
            width: 185,
            height: 185,
            count: 61
        },
        animations: {
            run: [0, 60]
        }
    }),
    berale: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/animal_berale_185x185x31f.png'],
        frames: {
            width: 185,
            height: 185,
            count: 31
        },
        animations: {
            run: [0, 30]
        }
    }),
    fruit: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/fruits_110x110.png'],
        frames: {
            width: 110,
            height: 110,
            count: 4
        },
        animations: {
            yael: [0],
            kof: [1],
            berale: [2],
            shafan: [3]
        }
    }),
    flags: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/flags_90x90.png'],
        frames: {
            width: 90,
            height: 90,
            count: 8
        },
        animations: {
            on: [0, 3],
            off: [4, 7]
        }
    }),
    mil: new createjs.SpriteSheet({
        framerate: frameRate,  // TODO: Get exact frame rate
        images: ['files/images/mill_90x90.png'],
        frames: {
            width: 90,
            height: 90,
            count: 25
        },
        animations: {
            turn: [0, 24]
        }
    })
};