var module = angular.module('validateOptionService', []);

function twoDigitFormat(num) {
    return ("0" + num).slice(-2);
}

function validNumVal(val) {
    return angular.isNumber(val) && isNaN(val) === false;
}
function validateNumber(option) {
    var val = Number(option.val);

    // Make sure from this point val is number
    option.val = val;

    if (!validNumVal(val)) {
        return false;
    }

    if (option.min !== undefined) {
        var min = Number(option.min);
        if (validNumVal(min)) {
         if (val < min) {
             return false;
         }
        }
    }

    if (option.max !== undefined) {
        var max = Number(option.max);
        if (validNumVal(max)) {
            if (val > max) {
                return false;
            }
        }
    }

    option.validVal = val;

    return true;
}

function validStrVal(str) {
    return angular.isString(str) && str.length > 0;
}

function validateString(option) {
    var val = option.val;

    if (!validStrVal(val)) {
        return false;
    }

    option.validVal = val;
    return validStrVal(option.val);
}

function validateDate(option) {
    var val = option.val;

    if (val === null || !val.getDay) {
        return false;
    }

    option.validVal = twoDigitFormat(val.getDate()) + '-' + twoDigitFormat(val.getMonth() + 1) + '-' + val.getFullYear();    return true;
}

function validateTime(option) {
    var val = option.val;
    if (val === null || !val.getHours) {
        return false;
    }

    option.validVal = twoDigitFormat(option.val.getHours()) + ':' + twoDigitFormat(option.val.getMinutes());

    return true;
}

function validateBoolean(option) {
    var val = option.val;

    option.validVal = val;
    return true;
}

var validator = {
    time: validateTime,
    boolean: validateBoolean,
    date: validateDate,
    string: validateString,
    number: validateNumber
}

module.factory('validateOption', function () {
    return function validateOption(option) {
        if (!angular.isObject(option)) {
            return false;
        }

        if (!validStrVal(option.key)) {
            return false;
        }

        if (!validStrVal(option.type)) {
            return false;
        }

        if (option.val === undefined) {
            return false;
        }

        if (!validator[option.type](option)) {
            return false;
        }

        return true;
    };
})