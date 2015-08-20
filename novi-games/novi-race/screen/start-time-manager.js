'use strict';

var isReady = false,
    calculatedRes = 0;

function prettyPrintTime(date) {
    return date;
}

function timeCheckerGo(startDate, startTime) {
    var dateParts = startDate.split('-'),
        timeParts = startTime.split(':'),
        nowVal = Date.parse(new Date()),
        startReady = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1])),
        startVal = Date.parse(startReady);

    return startVal - nowVal;
}

function checkCount(printTime, count, getItOn) {
    if (count <= 0) {
        getItOn();
        isReady = true;
        return true;
    }

    printTime(count);
    return false;
}
module.exports = {
    startCount: function (printTime, startDate, startTime, getItOn) {
        var interval = setInterval(function () {
            calculatedRes = timeCheckerGo(startDate, startTime);
            if (checkCount(printTime, calculatedRes, getItOn)) {
                clearInterval(interval);
            }
        }, 1000);
    },
    checkCount: checkCount,
    getCountdown: function () {
        return calculatedRes;
    }
}
