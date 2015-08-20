function twoDigitFormat(num) {
    return ("0" + num).slice(-2);
}

function validNumVal(val) {
    return typeof val === 'number' && val !== null && isNaN(val) === false;
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
    return typeof str === 'string' && str.length > 0;
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
    return validateString(option);
}

function validateTime(option) {
    return validateString(option);
}

function validateBoolean(option) {
    var val = option.val;

    if (option.val === 'true') {
        option.validVal = true;
    } else {
        option.validVal = false;
    }

    return true;
}

var validator = {
    time: validateTime,
    boolean: validateBoolean,
    date: validateDate,
    string: validateString,
    number: validateNumber
}

module.exports = function validateOption(option) {
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
}