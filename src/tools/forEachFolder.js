var fs = require('fs-extra'),
    path = require('path');

var log = require('./app-log');

function forEachFolder(srcFolder, callback) {
    fs.readdir(srcFolder, function (err, content) {
        if (err) {
            log.error(err, "forEachFolder error src = " + srcFolder);
            return err;
        }
        content.forEach(function (foundPath) {
            foundPath = path.join(srcFolder, foundPath);
            fs.lstat(foundPath, function (err, res) {
                if (err) {
                    log.error(err, 'forEachFolder failed to read lstat for ' + path);
                    return;
                }
                if (res.isDirectory()) {
                    callback(foundPath);
                }
            });
        })
    })
}

module.exports = forEachFolder;