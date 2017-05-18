(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Looptime = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.TimerManager = exports.Timer = undefined;

var _timer = require('./timer');

var _timer2 = _interopRequireDefault(_timer);

var _timerManager = require('./timerManager');

var _timerManager2 = _interopRequireDefault(_timerManager);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Timer = _timer2.default;
exports.TimerManager = _timerManager2.default;
exports.version = _version2.default;

},{"./timer":2,"./timerManager":3,"./version":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var repeat = {
    INFINITE: -1
};

/**
* Creates a TapSquire instance.
* 
* @class TapSquire
* @constructor
* @param {Element} element - The HTML element for which the TapSquire instance will manage events.
*/

var Timer = function () {
    function Timer(duration) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref$delay = _ref.delay,
            delay = _ref$delay === undefined ? 0 : _ref$delay,
            _ref$destroyOnComplet = _ref.destroyOnComplete,
            destroyOnComplete = _ref$destroyOnComplet === undefined ? false : _ref$destroyOnComplet,
            _ref$repeat = _ref.repeat,
            repeat = _ref$repeat === undefined ? 0 : _ref$repeat,
            _ref$repeatDelay = _ref.repeatDelay,
            repeatDelay = _ref$repeatDelay === undefined ? 0 : _ref$repeatDelay,
            _ref$onStart = _ref.onStart,
            onStart = _ref$onStart === undefined ? function () {} : _ref$onStart,
            _ref$onUpdate = _ref.onUpdate,
            onUpdate = _ref$onUpdate === undefined ? function () {} : _ref$onUpdate,
            _ref$onComplete = _ref.onComplete,
            onComplete = _ref$onComplete === undefined ? function () {} : _ref$onComplete,
            _ref$onRepeat = _ref.onRepeat,
            onRepeat = _ref$onRepeat === undefined ? function () {} : _ref$onRepeat,
            _ref$callbackScope = _ref.callbackScope,
            callbackScope = _ref$callbackScope === undefined ? this : _ref$callbackScope;

        _classCallCheck(this, Timer);

        /**
        * @property {Element} - The element to manage.
        * @readonly
        */
        this.callbackScope = callbackScope;
        this.delay = delay;
        this.destroyOnComplete = destroyOnComplete;
        this.duration = duration;
        this.elapsedDelay = 0;
        this.elapsedRepeatDelay = 0;
        this.elapsedTime = 0;
        this.isActive = false;
        this.isComplete = false;
        this.repeat = repeat;
        this.repeatDelay = repeatDelay;
        this._repeat = 0;
        this.onStart = onStart.bind(this.callbackScope);
        this.onUpdate = onUpdate.bind(this.callbackScope);
        this.onComplete = onComplete.bind(this.callbackScope);
        this.onRepeat = onRepeat.bind(this.callbackScope);
    }

    _createClass(Timer, [{
        key: "update",
        value: function update(deltaTime) {
            var time = deltaTime;

            if (this.isComplete) {
                return this;
            }

            if (this.delay > this.elapsedDelay) {
                this.elapsedDelay += time;

                if (this.elapsedDelay >= this.delay) {
                    time = this.elapsedDelay - this.delay;
                } else {
                    return this;
                }
            }

            if (this._repeat > 0 && this.repeatDelay > this.elapsedRepeatDelay) {
                this.elapsedRepeatDelay += time;

                if (this.elapsedRepeatDelay >= this.repeatDelay) {
                    time = this.elapsedRepeatDelay - this.repeatDelay;
                } else {
                    return this;
                }
            }

            if (!this.isActive) {
                this.isActive = true;
                this.onStart();
            }

            this.elapsedTime += time;
            this.onUpdate();

            if (this.elapsedTime >= this.duration) {
                if (this.repeat === repeat.INFINITE || this.repeat > this._repeat) {
                    this._repeat++;
                    this.elapsedTime = 0;
                    this.elapsedRepeatDelay = 0;
                    this.onRepeat();
                } else {
                    this.isActive = false;
                    this.isComplete = true;
                    this.onComplete();
                }
            }

            return this;
        }

        /**
        * Adds an event listener with TapSquire magic.
        *
        * @param {String} type - The event type to listen for.
        * @param {Function} handler - A function to execute when the event is triggered.
        * @param {Boolean} useCapture - Indicates that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
        */ /*
           * Adds an event listener with TapSquire magic.
           *
           * @param {String} type - The event type to listen for.
           * @param {Function} handler - A function to execute when the event is triggered.
           * @param {Object} options - An object of options.
           */

    }, {
        key: "restart",
        value: function restart() {
            this.elapsedDelay = 0;
            this.elapsedRepeatDelay = 0;
            this.elapsedTime = 0;
            this.isActive = false;
            this.isComplete = false;
            this._repeat = 0;

            return this;
        }
    }]);

    return Timer;
}();

exports.default = Timer;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _timer = require('./timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Creates a TapSquire instance.
* 
* @class TapSquire
* @constructor
* @param {Element} element - The HTML element for which the TapSquire instance will manage events.
*/
var TimerManager = function () {
    function TimerManager() {
        _classCallCheck(this, TimerManager);

        this.timers = [];
    }

    _createClass(TimerManager, [{
        key: 'destroy',
        value: function destroy() {
            this.removeTimers();
        }
    }, {
        key: 'update',
        value: function update(deltaTime) {
            var _this = this;

            this.timers.forEach(function (timer) {
                if (!timer.complete) {
                    timer.update(deltaTime);
                } else {
                    if (timer.destroyOnComplete) {
                        _this.removeTimer(timer);
                    }
                }
            });
        }
    }, {
        key: 'addTimer',
        value: function addTimer(duration, options) {
            var timer = new _timer2.default(duration, options);
            this.timers.push(timer);

            return timer;
        }
    }, {
        key: 'removeTimer',
        value: function removeTimer(timer) {
            var i = this.timers.indexOf(timer);

            if (i !== -1) {
                return this.timers.splice(i, 1)[0];
            }
        }
    }, {
        key: 'removeTimers',
        value: function removeTimers() {
            var timers = this.timers;

            this.timers = [];

            return timers;
        }
    }]);

    return TimerManager;
}();

exports.default = TimerManager;

},{"./timer":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
* @author       Adam Kucharik
* @copyright    2016-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/oculo/blob/master/LICENSE.md
*/

var version = '0.1.0-alpha';

exports.default = version;

},{}]},{},[1])(1)
});