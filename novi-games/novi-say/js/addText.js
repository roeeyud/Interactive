var userAppModule = angular.module('noviSayUser');

userAppModule.controller('addTextCtrl', ['$scope', function ($scope) {
    if (!$scope.message.back) {
        $scope.goTo('/');
        return;
    }
    $scope.sendImage = function () {
        $scope.sendMessage();
    }

    var h = Math.max(document.documentElement.clientHeight * 0.7, window.innerHeight || 0),
        w = Math.max(document.documentElement.clientWidth * 0.7, window.innerWidth || 0);

    var margin = (w - h * 0.5) / 2;
    $('.image-preview').css('margin-left',margin+'px');
}]);