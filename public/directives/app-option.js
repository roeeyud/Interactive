var app = angular.module('appOptionDirective', []);
app.directive('appOption', function() {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: '/templates/app-option.html',
        controller: function($scope) {
            function findKeyInOptions(key) {
                var retVal;
                $scope.apps[$scope.appIndex].options.forEach(function (elem, index) {
                    if (elem.key === key) {
                        retVal = elem;
                        retVal.index = index;
                        return elem;
                    }
                })

                return retVal;
            }
            $scope.$watch('option.default', function (val) {
                $scope.option.val = val;
            });

            $scope.showMe = true;
            function watchValOfCondition(optionFound) {
                $scope.$watch('curAppInView.options[' + optionFound.index + '].val', function (val) {
                    $scope.showMe = val;
                })
            }

            var unWatchCondition = $scope.$watch('option.condition', function (val) {
                if (typeof val === 'string') {
                    var optionFound = findKeyInOptions(val);

                    unWatchCondition();
                    watchValOfCondition(optionFound);
                }
            });
        }
    };
});