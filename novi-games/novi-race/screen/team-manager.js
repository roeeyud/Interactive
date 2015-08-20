'use strict';

var teamArray,
    teamManager,
    teamNamesArray,
    playerToTeam = {};

function calculateCount(countObj) {
    var keys = Object.keys(countObj),
        len = keys.length,
        i,
        curKey,
        totalCount = 0;

    for (i = 0; i < len; i++) {
        curKey = keys[i];

        totalCount = totalCount + countObj[curKey];
    }

    return Math.floor(totalCount / len);
}

teamManager = {
    setTeams: function (teamNames) {
        if (!Array.isArray(teamNames)) {
            console.log('team-manager:setTeams() invalid team names');
            console.dir(teamNames);
            return;
        }

        var i;

        teamArray = [];
        teamNamesArray = teamNames;
        playerToTeam = {};

        for (i = 0; i < teamNames.length; i++) {
            teamArray[teamNames[i]] = {
                count: {},
                index: i
            };
        }
    },
    getIndexAndCount: function (playerId, count) {
        var team = playerToTeam[playerId],
            teamInfo = teamArray[team];

        teamInfo.count[playerId] = count;

        return {
            playerId: teamInfo.index,
            count: calculateCount(teamInfo.count)
        };
    },
    addPlayer: function (playerId, team) {
        if (typeof teamArray[team] !== 'object') {
            console.log('team-manager:addPlayer() invalid team names');
            return;
        }

        playerToTeam[playerId] = team;
        teamArray[team].count[playerId] = 0;
    },
    getTeamIndex: function (teamName) {
        return teamNamesArray.indexOf(teamName);
    },
    removePlayer: function (playerId) {
        if (playerToTeam[playerId] && teamArray[playerToTeam[playerId]] && teamArray[playerToTeam[playerId]].count) {
            delete teamArray[playerToTeam[playerId]].count[playerId];
            if (!teamArray[playerToTeam[playerId]] || Object.keys(teamArray[playerToTeam[playerId]].count).length === 0) {
                return teamNamesArray.indexOf(playerToTeam[playerId]);
            }
            delete playerToTeam[playerId];
        }

        return -1;
    },
    forEachOfSameTeam: function (teamIndex, callback) {
        var team = teamNamesArray[teamIndex];
        if (team) {
            var playerArray = Object.keys(teamArray[team].count);
            if (playerArray) {
                var i, len = playerArray.length;
                for (i = 0; i < len; i++) {
                    if (playerArray[i]) {
                        callback(playerArray[i]);
                    }
                }
            }
        }

    }
}

module.exports = teamManager;