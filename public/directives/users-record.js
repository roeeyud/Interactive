'use strict';

var statsAppModule = angular.module('statsApp');

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

var userColumnDef = [
    {field: 'date', width: 100},
    {field: 'time', width: 100},
    {field: 'duration', width: 100},
    {field: 'info.userId', width: 100, displayName: 'ID'},
    {field: 'socketId', width: 200}
];

function getUserAgent(userAgent) {
    if (isMobile.Android(userAgent)) {
        return 'Android';
    }

    if (isMobile.BlackBerry(userAgent)) {
        return 'BlackBerry';
    }

    if (isMobile.iOS(userAgent)) {
        return 'iOS';
    }

    if (isMobile.Windows(userAgent)) {
        return 'Windows';
    }

    if (isMobile.Mac(userAgent)) {
        return 'Mac';
    }

    if (isMobile.PC(userAgent)) {
        return 'PC';
    }

    return 'Unknown';
}

function onUserSessions(scope, userSessions, row) {
    var res = userSessions,
        newColumnDef = angular.copy(userColumnDef);

    row.entity.subGridOptions = {};

    if (Array.isArray(res) && res.length === 0) {
        row.rowReady = true;
        return;
    }

    if (angular.isObject(res[0].info.extraInfo)) {
        Object.keys(res[0].info.extraInfo).forEach(function (key) {
            if (key === 'userAgent') {
                res.forEach(function (elem) {
                    elem.info.extraInfo.newUserAgent = getUserAgent( elem.info.extraInfo.userAgent);
                })
                newColumnDef.push({field: 'info.extraInfo.newUserAgent', width: 250, displayName: 'Device'});
                return;
            } else if (key === 'newUserAgent') {
                return;
            }
            newColumnDef.push({field: 'info.extraInfo.' + key, width: 250, displayName: key});
        });
    }

    //createChart(row, res,row.entity);

    row._mySummery.numOfUsers = res.length;
    row.rowReady = true;
    row.entity.subGridOptions = {
        data: res,
        columnDefs: newColumnDef,
        enableFiltering: true
    };
}

var isMobile = {
    Android: function(userAgent) {
        return /Android/i.test(userAgent);
    },
    BlackBerry: function(userAgent) {
        return /BlackBerry/i.test(userAgent);
    },
    iOS: function(userAgent) {
        return /iPhone|iPad|iPod/i.test(userAgent);
    },
    PC: function(userAgent) {
        return /Windows/i.test(userAgent);
    },
    Windows: function(userAgent) {
        return /IEMobile/i.test(userAgent);
    },
    Mac: function(userAgent) {
        return /Mac/i.test(userAgent);
    },
    any: function(userAgent) {
        return (isMobile.Android(userAgent) || isMobile.BlackBerry(userAgent) || isMobile.iOS(userAgent) || isMobile.Windows(userAgent));
    }
};

function drawPlayerActivityChart(screenSession, userSessions) {
    if (!screenSession.realDuration) {
        screenSession.realDuration = Date.now() - screenSession.realTime;
    }
    var second = Math.floor(screenSession.realDuration / 1000),
        lenOfSection = 3,
        curTime = 0,
        lineData = [];
    /*
     userSessions.sort(function (a, b) {
     return a.realTime - b.realTime;
     });
     */
    if (second > 50) {
        lenOfSection = screenSession.realDuration / 50;
    }


    for (var i = 0; i < 50; i++) {
        var res = getNumOfConnected(screenSession.realTime + curTime, userSessions, lenOfSection);
        lineData.push({x: curTime, y: res})
        curTime = curTime + lenOfSection;
    }

    InitChart(lineData, screenSession.realTime);
}

function getNumOfConnected (time, userSessions, lenOfSection){
    var count = 0;
    userSessions.forEach(function (elem) {
        if (elem.realTime + elem.realDuration> time && elem.realTime < time + lenOfSection) {
            count++;
        }
    })

    return count;
}

function InitChart(lineData, startTime) {
    var vis = d3.select(".visualisation"),
        WIDTH = 700,
        HEIGHT = 170,
        MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function (d) {
            return d.x;
        }),
            d3.max(lineData, function (d) {
                return d.x;
            })
        ]),

        yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function (d) {
            return d.y;
        }),
            d3.max(lineData, function (d) {
                return d.y;
            })
        ]),

        xAxis = d3.svg.axis()
            .scale(xRange)
            .ticks(8)
            //.tickSubdivide(true)
            .tickFormat(function(d) {
                var date = new Date();
                date.setTime(d + startTime);

                return  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            }),


        yAxis = d3.svg.axis()
            .scale(yRange)
            .ticks(4)
            .orient("left")
            .tickSubdivide(true);


    vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);

    var lineFunc = d3.svg.line()
        .x(function (d) {
            return xRange(d.x) ;
        })
        .y(function (d) {
            return yRange(d.y);
        })
//        .interpolate('basis');    // curvy
        .interpolate('linear');

    vis.append("svg:path")
        .attr("d", lineFunc(lineData))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
}

statsAppModule.directive('userRecordsStats', ['userSessionResource', function(userSessionResource) {
    return {
        restrict: 'C',
        replace: 'true',
        templateUrl: '/templates/users-record.html',
        link: function (scope, element, attrs) {
        },
        controller: function ($scope) {
            $scope.$watch('row', function (row) {
                if (row === undefined) {
                    return;
                }

                var userSessions = userSessionResource.query({sessionId: $scope.row.entity.sessionId}, function () {
                    if (row.isExpanded) {
                        if (!userSessions.$resolved) {
                            return;
                        }

                        $scope.userSessionsData = processSessions(userSessions);
                        $scope.$root.gridApi.grid.rows.forEach(function (elem) {
                            if (elem !== row) {
                                elem.isExpanded = false;
                            }
                        });

                        row._mySummery = {
                            numOfUsers: 0
                        };
                        row.rowReady = false;

                        onUserSessions($scope, $scope.userSessionsData, row);
                        var unWatch = $scope.$watch('userSessionsData', function (userSessions) {
                            onUserSessions($scope, userSessions, row);

                            setTimeout(function () {
                                drawPlayerActivityChart(row.entity, userSessions);
                            }, 500);

                            unWatch();
                        });
                    }
                });

                $scope.userSessions = userSessions;

            });



        }
    }
}]);