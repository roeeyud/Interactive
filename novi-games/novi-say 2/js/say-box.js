var adminAppModule = angular.module('noviSayBox', []),
    easeAndTiming = require('./ease-timing');

function checkRTL(s){
    var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
        rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');

    return rtlDirCheck.test(s);
};

adminAppModule.directive('sayBox', function () {
    return {
        restrict: 'C',
        templateUrl: 'files/templates/say-box.html',
        controller: function ($scope) {

        },
        link: function (scope, elem, attrs) {
            //setTimeout(function () {
            var containerStyle = 'width:' + scope.config.boxSize + 'px; height:' + scope.config.boxSize + 'px;',
                boxStyle = 'width:' + (scope.config.boxSize) + 'px; height:' + (scope.config.boxSize) + 'px;',
                marqueeStyle = 'margin-top: ' + (scope.config.boxSize * scope.config.yTextPos) + 'px; font-size: ' + scope.config.fontSize + 'px',
                animations = {
                    right: {left: '+=' + scope.config.boxSize  + 'px', height: (scope.config.boxSize ) + 'px', width: (scope.config.boxSize ) + 'px'},
                    up: { top: '-=' + scope.config.boxSize  + 'px', height: (scope.config.boxSize ) + 'px', width: (scope.config.boxSize ) + 'px'},
                    left: { left: '-=' + scope.config.boxSize  + 'px', height: (scope.config.boxSize ) + 'px', width: (scope.config.boxSize ) + 'px'},
                    down: { top: '+=' + scope.config.boxSize  + 'px', height: (scope.config.boxSize ) + 'px', width: (scope.config.boxSize ) + 'px'},
                    none: {top: '0px', left: '0px', height: (scope.config.boxSize ) + 'px', width: (scope.config.boxSize ) + 'px'}
                },
                startPosition = {
                    right: {top: '0px', left: '-' + scope.config.boxSize + 'px'},
                    up: {top: scope.config.boxSize + 'px', left: '0px'},
                    left: {top: '0px', left: scope.config.boxSize + 'px'},
                    down: {top: '-' +  scope.config.boxSize + 'px', left: '0px'},
                    none: {top: '0px', left: '0px'}
                },
                enterSpeed = scope.config.speed * 1000,
                changeCount = 0;

            scope.containerStyle = containerStyle;
            scope.boxStyle = boxStyle;
            scope.marqueeStyle = marqueeStyle;

            var containers = elem.find('.message-container');

            var readyForNewMessage = true;
            function changeMessage(message) {
                if (!message || message === undefined || !readyForNewMessage)
                    return;

                if (message.showQR === "QR") {
                    message.qRLink = window.location.origin + '/connect/' + scope.config.sessionId;
                    return;
                } else {
                    message.qRLink = null;
                }

                var rndI = Math.floor((Math.random() * easeAndTiming.length) + 1) - 1;
                var ease = easeAndTiming[rndI];

                if (message.direction === undefined) {
                    message.direction = 'none'
                }

                if (changeCount > 0) {
                    if (message.direction === 'none') {
                        var $remove = $(containers[(changeCount + 1) % 2]);
                        $remove.hide();

                    } else {
                        var myAnim = angular.copy(animations[message.direction]),
                            easeName = ease.name,
                            leaveSpeed = enterSpeed * 0.8;

                        if (angular.isNumber(ease.leaveTiming)) {
                            leaveSpeed = leaveSpeed * ease.leaveTiming;
                        }

                        if (angular.isString(ease.leaveEase)) {
                            easeName = ease.leaveEase;
                        }

                        // Remove other container
                        var $remove = $(containers[(changeCount + 1) % 2]);
                        console.log('leaveSpeed = ' + leaveSpeed + ' easeName = ' + easeName + ' myAnim: ');
                        console.dir(myAnim);

                        $remove.find('.box-message').animate(myAnim, leaveSpeed, easeName, function() {
                            $remove.hide();
                        });
                    }
                }

                var $curContainer = $(containers[(changeCount) % 2]);

                $curContainer.find('span').text(message.msg.toUpperCase());
                $curContainer.find('img').attr('src', message.back);

                $curContainer.show();
                var enterAnimation = animations[message.direction];

                $curContainer.css(startPosition[message.direction]);
                var $box = $($curContainer.find('.box-message'));
                readyForNewMessage = false;

                console.log('enterSpeed = ' + enterSpeed + ' easeName = ' + ease.name + ' myAnim: ');
                console.dir(enterAnimation);
                $box.css({top: '0px', left: '0px'});
                $box.animate(enterAnimation, {
                    duration: enterSpeed,
                    easing: ease.name,
                    done: function() {
                        $(this).find('.marquee span').addClass('play');
                        readyForNewMessage = true;
                    }
                });

                changeCount++;

                markRTL(message.msg, $box);
            }

            function markRTL(msg, $box) {
                if (checkRTL(msg)) {
                    $box.addClass('RTL')
                } else {
                    $box.removeClass('RTL')
                }
            }

            scope.$watch('message', changeMessage, true);
            changeMessage();
            //}, 10);
        }
    }
});