'use strict';
var adminAppModule = angular.module('adminApp', ['store-view-app', 'appInfoDirective', 'appOptionDirective', 'monospaced.qrcode']);

require('./directives/store-view');
require('./resources/app-store');
require('./directives/app-info');
require('./services/app-event-emitter');
require('./directives/app-option');
require('./services/validate-option-service');
require('./external-lib/qrcode');

adminAppModule.controller('adminCtrl', ['$scope', 'appInfoResource', 'appEventEmitter', function ($scope, appInfoResource, appEventEmitter) {
    $scope.deleteApp = function deleteApp(appName) {
        appInfoResource.delete({appName: appName}, function () {});
        appEventEmitter.emit('app-deleted');
    };
    $scope.auditLink =  'http://' + location.host + '/audit';
    $scope.userLink =  'http://' + location.host + '/connect';
}]);