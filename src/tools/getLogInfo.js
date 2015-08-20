function getLogInfo(appInfo) {
    return {
        app_name: appInfo.name,
        app_version: appInfo.version
    }
};

module.exports = getLogInfo;