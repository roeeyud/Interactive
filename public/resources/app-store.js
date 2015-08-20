var app = angular.module('appStoreResources', ['ngResource']);

app.factory("appInfoResource", ['$resource', function($resource) {
    return $resource("/store/apps/:appName");
}]);