var app = angular.module('appInfoDirective', ['appEventsService', 'validateOptionService']);
app.directive('appInfo', ['appEventEmitter', 'validateOption', function(appEventEmitter, validateOption) {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: '/templates/app-info.html',
        controller: function($scope) {
            $scope.screenLink = "";

            //$scope.curAppInView = {};

            $scope.$watch('apps[appIndex]', function () {
                $scope.curAppInView = angular.copy($scope.apps[$scope.appIndex]);
                if ($scope.curAppInView !== undefined) {
                    $scope.curAppInView.screenId = 'be-original';
                }

            });
            appEventEmitter.on('app-selected', function (appIndex) {
                $scope.appIndex = appIndex;
                $scope.$apply();
            });

            appEventEmitter.on('app-deleted', function (appIndex) {
                $scope.appIndex = null;
                $scope.$apply();
            });

            function buildScreenLink(options) {
                if ( $scope.apps[$scope.appIndex] == undefined )
                    return;
                var screenQuery = {};
                if (options !== undefined && options.forEach !== undefined) {
                    options.forEach(function (elem) {
                        if (validateOption(elem)) {
                            screenQuery[elem.key] = elem.validVal;
                        }
                    })
                }
                $scope.screenLink = 'http://' + location.host + '/store/apps/' + $scope.apps[$scope.appIndex].name + '/screen/' + '?' + jQuery.param(screenQuery).replace(/\+/g, "%20");
            }


            function buildScreenLinks(curAppInView){
                if (angular.isObject(curAppInView)) {
                    buildScreenLink(curAppInView.options);
                }
            }

            $scope.$watch('curAppInView', buildScreenLinks, true);

            var watchAppInfo = $scope.$watch('curAppInView', function (appInfo) {
                if ( appInfo == undefined )
                    return;
                buildScreenLink(appInfo);
                // Watch once
                watchAppInfo();
            }, true);
        }
    };
}]);

