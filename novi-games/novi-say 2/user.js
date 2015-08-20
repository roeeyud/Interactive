'use strict';

var userAppModule = angular.module('noviSayUser', ['ngRoute']),
    config = {},
    connect = new NoviConnect(),
    preload = require('./js/user-preload'),
    messages = [],
    resize = require('./js/resize');

require('./js/customizeImage');
require('./js/addText');

var images = [
    'files/images/kiss-lady.png',
    'files/images/flam.png',
    'files/images/kiss-lady.png',
    'files/images/flam.png',
    'files/images/wig.png'
];

userAppModule.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/welcome', {
                templateUrl: 'files/templates/welcome.html',
                controller: 'uploadImage',
                parent: 'noviSayUserCtrl'
            }).
            when('/customize', {
                templateUrl: 'files/templates/customize.html',
                controller: 'customizeImageCtrl',
                parent: 'noviSayUserCtrl'
            }).
            when('/add-text', {
                templateUrl: 'files/templates/add-text.html',
                controller: 'addTextCtrl',
                parent: 'noviSayUserCtrl'
            }).
            when('/thank-you', {
                templateUrl: 'files/templates/thank-you.html',
                controller: 'thanksCtrl',
                parent: 'noviSayUserCtrl'
            }).
            otherwise({
                redirectTo: '/welcome'
            });
    }]);

userAppModule.controller('noviSayUserCtrl', ['$scope', '$location', function ($scope, $location) {
    function onDisconnect() {
        connect.disconnect();
        $scope.goTo('/thank-you');

        $scope.$apply();
    }

    connect.connectUser();
    connect.onReady(function () {
        $scope.connectReady = true;
        connect.on('disconnectController', onDisconnect);
    });

    $scope.preloadProgress = 0;
    $scope.preloadReady = false;

    preload.onProgress(function (event) {
        $scope.preloadProgress = event.progress * 100;
        $scope.$apply();
    })

    preload.onComplete(function () {
        $scope.preloadReady = true;

        $scope.$apply();
    });

    $scope.config = config;
    $scope.config.fontSize = 35;

    $scope.config.boxSize = $(window).width() * 0.5 ;
    //$scope.config.boxSize = 150;
    $scope.config.yTextPos = 0.7;
    $scope.message = {};

    $scope.images = images;

    $scope.sendMessage = function () {
        connect.send('add-message', $scope.renderedImage);
    }

    $scope.applyBack = function (imageIndex) {
        $scope.message.back = imageIndex;
    };

    $scope.goTo = function (path) {
        $location.path(path);
    };

    $scope.renderedImage = {};
}]);

userAppModule.controller('thanksCtrl', ['$scope', function ($scope) {
    if (!$scope.message.back) {
        $scope.goTo('/');
        return;
    }

    setTimeout(function () {
        $('.corner-logo').hide();
    }, 10);
}]);

userAppModule.controller('uploadImage', ['$scope', function ($scope) {
    $scope.chooseFile = function() {
        $("#fileInput").click();
    }

    connect.onReady(function () {
        $scope.userId = connect.controllerId;
        $scope.$apply();
    });

    var preview = $('#preview')[0];
    $('input').change(function (e) {
        var uploadFile = e.target.files[0];
        var fileReader = new FileReader();

        fileReader.onload = function(event){
            var blob = new Blob([event.target.result]); // create blob...

            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

            var image = new Image();
            image.src = blobURL;
            image.onload = function() {
                // have to wait till it's loaded
                var resized = resize(image, connect.config.maxUploadSize, connect.config.maxUploadSize, preview); // send it to canvas
                $scope.message.back = resized;
                $scope.goTo('/customize');
                $scope.$apply();
            };
        };

        fileReader.readAsArrayBuffer(uploadFile);
    });

    setTimeout(function () {
        $('.say-box').css({height: $scope.config.boxSize});
    }, 50);

    $scope.gameId = connect.gameId;
}]);

