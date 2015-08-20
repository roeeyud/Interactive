'use strict';

var isComplete = false,
    queue = new createjs.LoadQueue(),
    _completeCallback = function () {
        console.log("_completeCallback unassigned");
    },
    preloader = {
        onComplete: function (callback) {
            // STATIC FUNCTION
            if (isComplete) {
                callback();
            } else {
                _completeCallback = callback;
            }
        },
        getImage: function (imageName) {
            // STATIC FUNCTION
            if (isComplete) {
                return queue.getResult(imageName);
            }
        }
    };

var handleComplete = function () {
    isComplete = true;
    if (typeof _completeCallback === 'function') {
        _completeCallback();
    }
};

// Add new images here!
queue.loadManifest([
    {id: "background", src: "files/images/controler/background.png"},
    {id: "bt00", src: "files/images/controler/bt00.png"},
    {id: "bt01", src: "files/images/controler/bt01.png"},
    {id: "bt02", src: "files/images/controler/bt02.png"},
    {id: "bt03", src: "files/images/controler/bt03.png"},
    {id: "messages", src: "files/images/controler/messages.png"},
    {id: "countdown", src: "files/images/controler/countdown.png"},
    {id: 'userImage0', src: 'files/images/controler/user-yaen.png'},
    {id: 'userImage1', src: 'files/images/controler/user-kof.png'},
    {id: 'userImage2', src: 'files/images/controler/user-snail.png'},
    {id: 'userImage3', src: 'files/images/controler/user-shafan.png'},
]);

queue.on("complete", handleComplete);

module.exports = preloader;
