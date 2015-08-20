'use strict';

var express = require('express'),
    path = require('path'),
    tmp = require('tmp'),
    fs = require('fs-extra'),
    serverRootPath = '/novi-server-files/',
    APPS_DIRECTORY = 'apps/',
    decompressTmpDir = 'uploads/tmp-folders',
    decompress = require('./tools/decompress'),
    browserify = require('browserify-middleware'),
    validateFolder = require('./tools/validateFolder'),
    getLogInfo = require('./tools/getLogInfo'),
    validateFileInReq = require('./tools/validateFileInReq'),
    forEachFolder = require('./tools/forEachFolder'),
    validateServerFoldersExist = require('./tools/validateServerFoldersExist'),
    serverConfig = require('../server.json');

APPS_DIRECTORY = serverConfig.appDir;
decompressTmpDir = serverConfig.decompressTmpDir;
serverRootPath = serverConfig.serverRootPath;

var log = require('./tools/app-log');

function AppStore(router) {
    var self = this,
        neededFolders = [path.join(serverRootPath, APPS_DIRECTORY), path.join(serverRootPath, decompressTmpDir)];
    log.info('AppStore() called');

    this.tempDirTemplate = { template: path.join(serverRootPath, decompressTmpDir, '/XXXXXX/')};
    this.router = router;
    this.appList = [];


    validateServerFoldersExist(neededFolders, function () {
        self.routeAppStore()

        // Load previously loaded apps
        self.handleCurrentAppsFolder();
        if (serverConfig.debug) {
            self.handleApp(path.resolve(path.join(__dirname, '../novi-games/novi-race')));
            self.handleApp(path.resolve(path.join(__dirname, '../novi-games/novi-say')));
            self.handleApp(path.resolve(path.join(__dirname, '../novi-games/sudoku')));
            self.handleApp(path.resolve(path.join(__dirname, '../novi-games/example-app')));
        }
    });

    return router;
}

AppStore.prototype.routeApp = function(sourceFolder, appInfo) {
    var screenJsFile = path.resolve(path.join(sourceFolder, 'screen.js')),
        userJsFile = path.resolve(path.join(sourceFolder, 'user.js')),
        auditJsFile = path.resolve(path.join(sourceFolder, 'audit.js')),
        appJsonFile = path.resolve(path.join(sourceFolder, 'app.json')),
        screenUrlPrefix = '/apps/' + appInfo.name + '/screen',
        userUrlPrefix = '/apps/' + appInfo.name + '/user',
        auditUrlPrefix = '/apps/' + appInfo.name + '/audit',
        infoUrl = '/apps/' + appInfo.name + '/info',
        self = this;

    var curAppIndex = getAppByName(appInfo, this.appList);
    // New app that hasn't been routed
    if (curAppIndex === -1) {
        this.router.use('/apps/' + appInfo.name, function (req, res, next) {
            var index = getAppByName(appInfo, self.appList);
            // If app was flagged to be removed, don't allow requests to the apps route
            if (index !== -1 && self.appList[index].ready) {
                next();
            } else {
                res.send(404);
            }
        });

        if (fs.existsSync(screenJsFile)) {
            // Add support of browserify to get main script files
            if (serverConfig.browserify) {
                this.router.get(screenUrlPrefix + '/screen.js', browserify(screenJsFile, {
                    cache: false,
                    precompile: false
                }));
            } else {
                this.router.get(screenUrlPrefix + '/screen.js', function (req, res) {
                    res.sendfile(screenJsFile);
                });
            }
        }

        if (fs.existsSync(userJsFile)) {
            // Add support of browserify to get main script files
            if (serverConfig.browserify) {
                this.router.get(userUrlPrefix + '/user.js', browserify(userJsFile, {
                    cache: false,
                    precompile: false
                }));
            } else {
                this.router.get(userUrlPrefix + '/user.js', function (req, res) {
                    res.sendfile(userJsFile);
                });
            }
        }

        if (fs.existsSync(auditJsFile)) {
            // Add support of browserify to get main script files
            if (serverConfig.browserify) {
                this.router.get(auditUrlPrefix + '/audit.js', browserify(auditJsFile));
            } else {
                this.router.get(auditUrlPrefix + '/audit.js', function (req, res) {
                    res.sendfile(auditJsFile);
                });
            }
        }

        this.router.get(auditUrlPrefix + '/:sessionId', function (req, res) {
            res.sendfile(path.resolve(path.join(sourceFolder, 'audit.html')));
        });

        this.router.get(screenUrlPrefix, function (req, res) {
            res.sendfile(path.resolve(path.join(sourceFolder, 'screen.html')));
        });

        this.router.get(userUrlPrefix + '/:sessionId', function (req, res) {
            res.sendfile(path.resolve(path.join(sourceFolder, 'user.html')));
        });

        this.router.get(infoUrl, function (req, res) {
            res.sendfile(appJsonFile);
        });

        // Add static support for extra files
        log.debug(' path = = ' + path.resolve(path.join(sourceFolder, 'files')));
        this.router.use(screenUrlPrefix + '/files', express.static(path.resolve(path.join(sourceFolder, 'files'))));
        this.router.use(userUrlPrefix + '/files', express.static(path.resolve(path.join(sourceFolder, 'files'))));
        this.router.use(auditUrlPrefix + '/files', express.static(path.resolve(path.join(sourceFolder, 'files'))));
    }

    this.appReady(appInfo);
}

AppStore.prototype.appReady = function(appInfo) {
    appInfo.ready = true;

    log.info(getLogInfo(appInfo), 'App ready');
    var curAppIndex = getAppByName(appInfo, this.appList);
    appInfo.appUrl = '/store/apps/' + appInfo.name + '/screen/';
    if (curAppIndex === -1) {
        this.appList.push(appInfo);
    } else {
        this.appList[curAppIndex] = appInfo;
    }
}


AppStore.prototype.routeAppStore = function () {
    var self = this;
    /**
     * App store server API
     */
    this.router.post('/upload', function (req, res) {
        // Can't use onPostUpload as middle ware since it needs router variable
        self.onPostUpload(req, res);
    });

    this.router.get('/apps', function (req, res) {
        res.send(getReadyApps(self.appList));
    });

    this.router.delete('/apps/:appName', function (req, res) {
        self.deleteApp(req.params.appName)
    });
}

function getReadyApps(list) {
    var res = [];

    list.forEach(function(elem) {
        if (elem.ready) {
            res.push(elem);
        }
    });

    return res;
}
AppStore.prototype.deleteApp = function(appName) {
    var appPath = path.join(serverRootPath, APPS_DIRECTORY, appName);

    fs.remove(appPath);
    var curAppIndex = getAppByName({name: appName}, this.appList);
    if (curAppIndex !== -1) {
        this.appList[curAppIndex].ready = false;
    }
}

AppStore.prototype.handleApp = function(folderPath, callback) {
    var self = this;
    fs.lstat(folderPath, function (err, res) {
        if (err) {
            log.error(err, (' handleApp failed to read lstate from , ' + folderPath));
            if (callback)
                callback(err);
            return
        }

        if (res.isDirectory()) {
            validateFolder(folderPath, function (appInfo) {
                if (typeof appInfo === 'object') {
                    log.info(getLogInfo(appInfo), 'Found legal app: ' + appInfo.name);
                    self.routeApp(folderPath, appInfo);
                    if (callback)
                        callback(null, appInfo);
                } else {
                    if (callback)
                        callback('Folder invalid', appInfo);
                }
            })
        }
    });
}

AppStore.prototype.handleCurrentAppsFolder = function() {
    var appsPath = path.resolve(path.join(serverRootPath, APPS_DIRECTORY)),
        self = this;

    forEachFolder(appsPath, function (appFolder) {
        self.handleApp(appFolder);
    });
}

AppStore.prototype.onPostUpload = function(req, res) {
    var self = this;
    if (validateFileInReq(req)) {
        tmp.dir(this.tempDirTemplate, function _tempDirCreated(err, tempFolder) {
            decompress(tempFolder, req.files.file.file, function (err) {
                if (err)
                    throw err;

                forEachFolder(tempFolder, function (appFolder) {
                    validateFolder(appFolder, function (appInfo) {
                        if (typeof appInfo === 'object') {
                            log.debug(getLogInfo(appInfo), 'app valid!');
                            saveApp(appInfo, appFolder, function (assignedFolder) {
                                if (assignedFolder !== null) {

                                    self.handleApp(assignedFolder, function (err, appInfo) {
                                        if (err) {
                                            if (typeof err === 'string') {
                                                log.error("onPostUpload: handle app failed: " + appInfo);
                                            } else {
                                                log.error(err, "onPostUpload: handle app failed");
                                            }
                                            res.send(400, appInfo);
                                            return;
                                        }

                                        fs.remove(tempFolder);
                                        if (!res.header()._headerSent) {
                                            res.send(200, appInfo);
                                        }
                                    });
                                }
                            });
                        } else {
                            log.warn(getLogInfo(appInfo), 'Error in folder: ' + appFolder + '\n With error: ' + appInfo);
                            if (!res.header()._headerSent) {
                                res.send(400, appInfo);
                            }
                        }
                    });
                })
            });
        });
    } else {
        log.error('POST - /upload , req.files.file missing or not as expected, req.files = ' + req.files);
        res.send(400, "File error");
    }
}

function getAppByName(appInfo, appList) {
    var i, len = appList.length;

    for (i = 0; i < len; i++) {
        if (appList[i].name === appInfo.name) {
            return i;
        }
    }

    return -1;
}

/**
 * Saves game to disk copying it from source folder. App will be saved under appsPath
 * @param appInfo - Game info can be found in infoFileName
 * @param appFolder - source of app
 * @param callBack - called when copy is complete.
 */
function saveApp(appInfo, appFolder, callBack) {
    var desFolder =  path.resolve(path.join(serverRootPath, APPS_DIRECTORY, appInfo.name));

    log.debug(getLogInfo(appInfo),'Saving app: to ' + desFolder);

    var copyFilesDone = function (err) {
        if (err) {
            log.error(err, 'Saving Failed app dest: ' +  desFolder + '   src: ' +   path.resolve(appFolder));
            callBack(null);
            return null;
        }
        log.debug(getLogInfo(appInfo),'App successfully saved : to ' + desFolder);
        callBack(desFolder);
    };

    if (fs.lstatSync(appFolder).isDirectory()) {
        fs.remove(desFolder, function (err) {
            if (err) {
                log.error(err, 'Deleting old app failed dest: ' +  desFolder + '   src: ' +   path.resolve(appFolder));
            }
            fs.copy(path.resolve(appFolder) ,desFolder , copyFilesDone);
        });
    } else {
        fs.copy(path.resolve(appFolder) ,desFolder , copyFilesDone);
    }
}

log.debug('app-store, ready');

module.exports = AppStore;
