var app = angular.module('store-view-app', ['appStoreResources', 'appEventsService']);

app.directive('storeView', ['appInfoResource', 'appEventEmitter', function(appInfoResource, appEventEmitter) {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: '/templates/store-view.html',
        link: function (scope, element, attrs) {
            element.on('focus', '.app-small-view', function (event) {
                scope.selectApp($(this).index());
            });
        },
        controller: function($scope) {
            var appList;
            $scope.apps = [];

            function updateAppList() {
                var curIndex = 0;
                appList = appInfoResource.query(function () {
                    if (!appList.$resolved) {
                        return;
                    }

                    if (appList.length < $scope.apps.length) {
                        $scope.apps.splice(appList.length, $scope.apps.length - appList.length)
                    }

                    appList.forEach(function (elem) {
                        if (angular.isObject($scope.apps[curIndex])) {
                            angular.extend($scope.apps[curIndex], elem);
                        } else {
                            $scope.apps[curIndex] = elem;
                        }
                        curIndex++;
                    });
                });
            }

            updateAppList();

            setInterval(function () {
                updateAppList();
                $scope.$apply();
            }, 1000);

            $scope.selectApp = function (appIndex) {
                appEventEmitter.emit('app-selected', appIndex);
            };

            $scope.$watchCollection('apps', function (apps) {
                if (angular.isArray(apps)) {
                    apps.forEach(function(app) {
                        app.realIconUrl = app.appUrl + app.iconUrl100x100;
                    });
                }
            });
        }
    };
}]);