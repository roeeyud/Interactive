var role,
    exModule = {
        getConfig: function () {
            var path = getGameLocation();

            $.ajax('../info').done(function (data) {
                onAppInfo(data);
            });
        },
        onReady: function () {
            console.warn('Novi connect/config/onReady called without implementation');
        },
        setRole: function (newRole) {
            role = newRole;
        }
    },
    appInfo,
    validate = require('./config-validation');

function getGameLocation() {
    var fields = document.location.href.split('/');
    return '/' + fields[fields.length - 5].toLowerCase() + '/' + fields[fields.length - 4].toLowerCase() + '/' + fields[fields.length - 3].toLowerCase();
}


var role2Options = {
    screen: 'options',
    user: 'userOptions'
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

function onAppInfo(appInfo) {
    var urlParams = getCnfigFromUrl(),
        retConfig = {};

    if (Array.isArray(appInfo[role2Options[role]])) {
        appInfo[role2Options[role]].forEach(function (elem) {
            if (urlParams[elem.key] !== undefined) {
                elem.val = urlParams[elem.key];
                if (validate(elem)) {
                    retConfig[elem.key] = elem.validVal;
                } else {
                    console.error(elem.key + ' config is invalid: value = ' + elem.val);
                }
            } else {
                retConfig[elem.key] = elem.default;
            }
        })
    }

    exModule.config = retConfig;
    exModule.onReady(retConfig);
}

module.exports = exModule