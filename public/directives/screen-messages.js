'use strict';

var statsAppModule = angular.module('statsApp');

function processMessages() {

}

statsAppModule.directive('screenMessagesStats', ['screenMessagesResource', function(screenMessagesResource) {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: '/templates/screen-messages.html',
        link: function (scope, element, attrs) {

        },
        controller: function ($scope) {
            $scope.$root.gridApi.grid.rows.forEach(function (elem) {
                if (elem !== $scope.row) {
                    elem.isExpanded = false;
                }
            });

            $scope.$watch('row', function (row) {
                if (row === undefined) {
                    return;
                }

                var newColumnDef = [];
                newColumnDef.push({field: 'socketId', displayName: 'socketId'});
                newColumnDef.push({field: 'sessionId', displayName: 'sessionId'});
                newColumnDef.push({field: 'event', displayName: 'event'});
                newColumnDef.push({field: 'controllerId', displayName: 'controllerId'});
                newColumnDef.push({field: 'controllerId', displayName: 'message'});

                var screenMessages = screenMessagesResource.query({sessionId: $scope.row.entity.sessionId, socketId: $scope.row.entity.socketId}, function () {
                    if (!screenMessages.$resolved) {
                        return;
                    }

                    $scope.screenMessagesData = screenMessages;//processMessages(screenMessages);

                    row.entity.subGridOptions = {
                        data: $scope.screenMessagesData,
                        columnDefs: newColumnDef,
                        enableFiltering: true
                    };
                });
            });
        }
    }
}]);