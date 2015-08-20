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
    {id: "background", src: "files/images/background.png"},
    {id: "flag_sheet", src: "files/images/flags_90x90.png"},
    {id: "fruit_sheet", src: "files/images/fruits_110x110.png"},
    {id: "lines", src: "files/images/lines.png"},
    {id: "mil_sheet", src: "files/images/mill_90x90.png"},
    {id: "nameHolder", src: "files/images/nameHolder.png"},
    {id: "berale_sheet", src: "files/images/animal_berale_185x185x31f.png"},
    {id: "kof_sheet", src: "files/images/animal_kof_185x185x61f.png"},
    {id: "safan_sheet", src: "files/images/animal_shafan_185x185x64f.png"},
    {id: "yaen_sheet", src: "files/images/animal_yaen_185x185_47f.png"},
    {id: "flach", src: "files/images/flach.png"}
]);

queue.on("complete", handleComplete);

module.exports = preloader;