'use strict';

$.event.special.tap = {
    setup: function () {
        var self = this,
            $self = $(self);

        // Bind touch start
        $self.on('touchstart', function (startEvent) {
            // Save the target element of the start event
            var target = startEvent.target;

            // When a touch starts, bind a touch end handler exactly once,
            $self.one('touchend', function (endEvent) {
                // When the touch end event fires, check if the target of the
                // touch end is the same as the target of the start, and if
                // so, fire a click.
                if (target == endEvent.target) {
                    $.event.simulate('tap', self, endEvent);
                }
            });
        });
    }
};