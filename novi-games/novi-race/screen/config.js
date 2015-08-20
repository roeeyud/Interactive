'use strict';
// FIXES CONFIG OUTPUT ACCORDING TO URL QUERY

var theConfig;

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function getCnfigFromUrl() {
    var qs = window.location.search.substr(1).split("&");
    var retVal = {};
    for (var i = 0; i < qs.length; i++) {
        var temp = qs[i].split("=");
        var key = decodeURIComponent(temp[0]);
        key = key.replace('[', '');
        key = key.replace(']', '');

        if (key in retVal) {
            retVal[key] = retVal[key]
                += ', ' + decodeURIComponent(temp[1]);
        } else {
            retVal[key] = decodeURIComponent(temp[1]);
        }
    }
    return retVal;
}

theConfig = getCnfigFromUrl();

var config = require('./game.json'),
    res;

res = Number(theConfig.minPlayer);
if (res !== null && !isNaN(res)) {
    config.minimumPlayers = res;
}

res = Number(theConfig.countdown);
if (res !== null && !isNaN(res)) {
    config.gameCountdown = res;
}

res = Number(theConfig.pause);
if (res !== null && !isNaN(res)) {
    config.pauseBetweenGames = res;
}

res = Number(theConfig.speed);
if (res !== null && !isNaN(res)) {
    config.ui.objects.player.animation.advancePlayer.xMultiplier = res;
}

res = theConfig.startTime;
if (typeof res === 'string' && res !== "") {
    config.startTime = res;
}

res = theConfig.startDate;
if (typeof res === 'string' && res !== "") {
    config.startDate = res;
}


res = theConfig.names;
if (typeof res === 'string' && res !== "") {
    var tobesure = 0;
    theConfig.names = replaceAll(', ', ',' ,theConfig.names);
    while(theConfig.names.indexOf('+') !== -1 && tobesure < 100) {
        tobesure++;
        theConfig.names = theConfig.names.replace('+', ' ');
    }
    res = theConfig.names.split(',');
    if (res !== null && Array.isArray(res)) {
        config.names = res;
    }
}

res = theConfig.team;
config.team = res === "true";

module.exports = config;