
var userAppModule = angular.module('noviSayUser'),
    canvas;

userAppModule.controller('customizeImageCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
    if (!$scope.message.back) {
        $scope.goTo('/');
        return;
    }

    setTimeout(function () {
        createFabricCanvas();
        drawBackground();
    }, 10);

    $scope.scrollCursor = 0;

    $scope.onChooseImage = onChooseImage;

    $scope.moveToAddText = function () {
        canvas.deactivateAll().renderAll();
        $scope.renderedImage.img = canvas.getElement().toDataURL("image/png");
        $scope.goTo('/add-text');
    }


}]);

function createFabricCanvas() {
    var h = Math.max(document.documentElement.clientHeight * 0.7, window.innerHeight || 0),
        w = Math.max(document.documentElement.clientWidth * 0.7, window.innerWidth || 0);

    var margin = (w - h * 0.5) / 2;
    $('#imagePreview').css('margin-left',margin+'px');
    canvas = new fabric.Canvas('imagePreview', {
        width: h * 0.5,
        height: h * 0.5
    });
}

function drawBackground() {
    var imgElement = document.getElementById('back-image'),
        imgInstance = new fabric.Image(imgElement, {
            left: 0,
            top:  0
        });

    canvas.setBackgroundImage(imgInstance);
    canvas.backgroundImage.width = canvas.getWidth();
    canvas.backgroundImage.height = canvas.getHeight();
    imgInstance.selectable = false;
    canvas.renderAll();
}

function onChooseImage(imageUrl) {
    var h = Math.max(document.documentElement.clientHeight * 0.7, window.innerHeight || 0),
        w = Math.max(document.documentElement.clientWidth * 0.7, window.innerWidth || 0);
    fabric.Image.fromURL(imageUrl, function(imgInstance) {
        imgInstance.height = h * 0.1;
        imgInstance.width = h * 0.1;

        imgInstance.top = w * 0.3;
        imgInstance.left = w * 0.3;

        imgInstance.cornerSize = 12;
        canvas.add(imgInstance);
        imgInstance.set({
            cornerSize: 20,
            cornerColor: '#f08221',
            transparentCorners: false
        });;
        canvas.setActiveObject(imgInstance);
        canvas.renderAll();
    });

}