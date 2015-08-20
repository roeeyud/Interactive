var fs = require('fs-extra');

function validateServerFoldersExist(dirList, callback) {
    var elem = dirList.pop();
    if (elem !== undefined) {
        fs.ensureDir(elem, function () {
            validateServerFoldersExist(dirList, callback);
        })
    } else  {
        callback();
    }
}

module.exports = validateServerFoldersExist;