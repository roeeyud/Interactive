/**
 * Check that folder contains a legal game
 * @param folder - folder path containing game to check
 * @returns - null if game is illegal, object containing game info if legal
 */
var fs = require('fs-extra'),
    path = require('path'),
    infoFileName = 'app.json',
    ERR_FILES_NOT_FOUND = 'Files missing: ',
    ERR_NAME_INVALID = 'Game name invalid',
    ERR_VERSION_INVALID = 'Game version is invalid',
    ERR_ILLEGAL_JSON = 'Illegal file ' + infoFileName + ' - check if valid json file.',
    getLogInfo = require('./getLogInfo');

var log = require('./app-log');

function validateFolder(folder, callback) {
    var appInfoPath = path.join(folder, infoFileName);
    validateFiles(folder, function(missingFiles) {
        if (missingFiles.length === 0) {
            // return parsed file
            appInfoPath = path.resolve(appInfoPath);
            fs.readFile(appInfoPath, 'utf8', function (err, data) {
                try {
                    var retVal = JSON.parse(data);
                } catch(err) {
                    log.warn(err, 'JSON parse failed for data: ' + data);
                    callback(ERR_ILLEGAL_JSON);
                }

                var validationRes = validateInfo(retVal); ;

                if (validationRes === false) {
                    log.debug(getLogInfo(retVal), 'Folder validation complete');
                    callback(retVal);
                } else {
                    callback(validationRes);
                }
            });


        } else {
            log.warn('Folder validation failed, missing files: ' + missingFiles + '   ; folder: ' + folder);
            callback(ERR_FILES_NOT_FOUND + missingFiles);
            return;
        }
    });
}

var requiredFiles = ['screen.html', 'user.html', 'app.json'];

function validateFiles(folder, callback) {
    var validLen = requiredFiles.length,
        missingFiles = [];

    var validated = function(fileName, val) {
        validLen--;

        if (!val) {
            missingFiles.push(fileName);
        }

        if (validLen === 0) {
            callback(missingFiles);
        }
    };

    requiredFiles.forEach(function (fileName) {
        var fileFullPath = path.resolve(path.join(folder, fileName));

        fs.exists(fileFullPath, function (exist) {
            validated(fileName, exist);
        });
    });
}


function validateInfo(info) {
    return validateName(info.name) || validateVersion(info.version);
}

/**
 *
 * @param name - game name is legal value
 * @returns true if name is valid
 */
function validateName(val) {
    var retVal = ERR_NAME_INVALID;

    if (typeof val === 'string' && val.length > 0) {
        retVal = false;
    }
    return retVal;
}

/**
 *
 * @param name - game name is legal value
 * @returns true if name is valid
 */
function validateVersion(val) {
    var retVal = ERR_VERSION_INVALID;

    if (typeof val === 'string' && val.length > 0) {
        retVal = false;
    }
    return retVal;
}

module.exports = validateFolder;