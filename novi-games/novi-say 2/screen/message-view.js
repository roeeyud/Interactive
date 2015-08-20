var adminAppModule = angular.module('noviSayScreen');

adminAppModule.directive('messageView', function () {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: 'files/templates/message-view.html',
        controller: function ($scope) {
        },
        link: function (scope, elem, attrs) {
        }
    }
});