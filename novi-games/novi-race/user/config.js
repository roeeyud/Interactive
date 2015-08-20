'use strict';

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

var theConfig = getCnfigFromUrl(),
    config = {},
    res;

var tobesure = 0;
res = theConfig.team;

if (res !== null && typeof res === 'string' && res !== "")  {
    while(res.indexOf('+') !== -1 && tobesure < 100) {
        tobesure++;
        res = res.replace('+', ' ');
    }

    config.team = res;
}

module.exports = config;
