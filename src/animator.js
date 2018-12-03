'use strict';

// requestAnimationFrame polyfill

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// Plus yet further fixes

// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
// requestAnimationFrame polyfill end


/**
 * Change any value using an animation easing function.
 * @param  {string}   Easing function. Possible values are: linear, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuadr, easeOutQuadr, easeInOutQuadr.
 * @param  {number}   The initial value
 * @param  {number}   Change in value
 * @param  {number}   Animation duration
 * @param  {Function} Callback to be called on each iteration. The callback is passed one argument: current value.
 */
var animator = function(easing, startValue, valueChange, dur, cb) {
	var easeFunc = animator.easings[easing],
		tStart = window.performance.now ? window.performance.now() : Date.now(),
		frame = function() {
			var t = (window.performance.now ? window.performance.now() : Date.now()) - tStart,
				curVal = easeFunc(t, startValue, valueChange, dur);
			cb(curVal);
			if(t < dur) requestAnimationFrame(frame);
			else cb(startValue + valueChange);
		};
	requestAnimationFrame(frame);
};


/**
 * Map of easings' strings to functions
 * @type {Object}
 */
animator.easings = {
	linear:  function (t, b, c, d) {
		return c*t/d + b;
	},
	easeInCubic: function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	},
	easeOutCubic: function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	},
	easeInOutCubic: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	},
	easeInQuadr: function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	},
	easeOutQuadr: function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	},
	easeInOutQuadr: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	}
};