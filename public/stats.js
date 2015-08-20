'use strict';

var adminAppModule = angular.module('statsApp', ['ui.grid', 'ui.grid.expandable' ,'ui.grid.pagination' , 'ui.grid.resizeColumns', 'statsResource']);
    /*.config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#FF5252', '#FF8A80'],
            responsive: false
        });
        // Configure all line charts
        ChartJsProvider.setOptions('Line', {
            datasetFill: false
        });
    }]);*/

require('./resources/stats-resource');
require('./directives/users-record');
require('./directives/screen-messages');

function twoDigit(num) {
    return ("0" + num).slice(-2);
}

function processSessions(sessions) {
    var retVal = [],
        dateObj,
        newRow,
        seconds,
        time;

    sessions.forEach(function (elem, index) {
        if (!elem.time) {
            return;
        }

        newRow = {
            date: null,
            time: null,
            duration: null
        };

        angular.extend(newRow, elem);
        time = newRow.time;
        newRow.realTime = time;

        dateObj = new Date(time);
        newRow.time = twoDigit(dateObj.getHours()) + ':' + twoDigit(dateObj.getMinutes());
        newRow.date = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();

        seconds = Math.floor(newRow.duration / 1000);

        newRow.realDuration = newRow.duration;
        newRow.duration =  twoDigit(Math.floor(seconds / 3600)) + ':' + twoDigit(Math.floor((seconds % 3600) / 60)) + ':' + twoDigit(Math.floor(seconds % 60));
        retVal.push(newRow);
    })

    return retVal;
}

var screenColumnDef = [
        {field: 'date', width: 100},
        {field: 'time', width: 100},
        {field: 'duration', width: 100},
        {field: 'appName', width: 130, displayName: 'App name'},
        {field: 'sessionId', width: 130},
        {field: 'socketId', width: 200},
        {field: 'info.tag', width: 100, displayName: 'Tag'},
        {field: 'info.isMaster', width: 100, displayName: 'Master'},
        {field: 'info.useAudit', width: 120, displayName: 'Audited'}
    ],
    userColumnDef = [
        {field: 'date', width: 100},
        {field: 'time', width: 100},
        {field: 'duration', width: 100},
        {field: 'info.userId', width: 100, displayName: 'ID'},
        {field: 'socketId', width: 200}
    ];

adminAppModule.controller('statsCtrl', ['$scope', 'screenSessionResource', function ($scope, screenSessionResource) {
    var screenSessions = screenSessionResource.query({count: 5000}, function () {
            if (!screenSessions.$resolved) {
                return;
            }

            $scope.gridOptions.data = processSessions(screenSessions);
        });

    $scope.screenSessions = screenSessions;

    $scope.gridOptions = {
        expandableRowTemplate: '/templates/expandable-screen-session.html',
        expandableRowHeight: 600,
        enableFiltering: true,
        paginationPageSize: 50,
        columnDefs: screenColumnDef,
        onRegisterApi: function (gridApi) {
            gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                row._tabs = [{title: 'User summery'}, {title: 'Screen messages'}];
                row._curId = 0;

                $scope.$root.gridApi = gridApi;
                $scope.row = row;
            });
        }
    }

}]);

