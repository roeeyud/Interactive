var app = angular.module('statsResource', ['ngResource']);

app.factory("userSessionResource", ['$resource', function($resource) {
    return $resource("/novi-connect.io/user-sessions/:sessionId");
}]);

app.factory("screenSessionResource", ['$resource', function($resource) {
    return $resource("/novi-connect.io/screen-sessions");
}]);

app.factory("screenMessagesResource", ['$resource', function($resource) {
    return $resource("/novi-connect.io/screen-messages/:sessionId/:socketId");
}]);