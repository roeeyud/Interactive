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
        },
        onProgress: function (callback) {
            queue.on('progress', callback);
        }
    };

var handleComplete = function () {
    isComplete = true;
    if (typeof _completeCallback === 'function') {
        _completeCallback();
    }
};


var manifest = [];

//manifest.push({id: 'uploadimage', src: 'files/images/upload.png'});
for (var i = 1; i < 16; i++) {
    manifest.push({id: 'prog_' + i, src: 'files/images/prog_' + i + '.png'})
}

// Add new images here!
queue.loadManifest(manifest);

queue.on("complete", handleComplete);

module.exports = preloader;