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

exports.Timer = _timer2.default; /**
                                 * @author       Adam Kucharik
                                 * @copyright    2017-present, Adam Kucharik, All rights reserved.
                                 * @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
                                 */

exports.TimerManager = _timerManager2.default;
exports.version = _version2.default;
exports.default = {
    Timer: _timer2.default,
    TimerManager: _timerManager2.default,
    version: _version2.default
};

},{"./timer":2,"./timerManager":3,"./version":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* @author       Adam Kucharik
* @copyright    2017-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
*/

var repeat = {
    INFINITE: -1
};

/**
* Creates a Timer instance.
* 
* @class Timer
* @constructor
* @param {Number} duration - The duration in milliseconds.
* @param {Object} [options] - An object of timer options.
* @param {Number} [options.delay=0] - The delay in milliseconds before the timer begins.
* @param {Boolean} [options.destroyOnComplete=false] - Whether or not to destroy the timer upon completion.
* @param {Number} [options.repeat=0] - The number of times that the time should repeat after its first iteration. To repeat indefinitely, use looptime.Timer.INFINITE or -1.
* @param {Number} [options.repeatDelay=0] - The delay in milliseconds before the timer repeats.
* @param {Function} [options.onStart] - A function to be called when the timer begins.
* @param {Function} [options.onUpdate] - A function to be called when the timer updates.
* @param {Function} [options.onComplete] - A function to be called when the timer completes.
* @param {Function} [options.onRepeat] - A function to be called when the timer repeats.
* @param {Object} [options.callbackScope=this] - The scope for all the callbacks.
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
        * @property {Number} - The delay in milliseconds before the timer begins.
        */
        this.delay = delay;

        /**
        * @property {Boolean} - Whether or not to destroy the timer upon completion.
        */
        this.destroyOnComplete = destroyOnComplete;

        /**
        * @property {Number} - The duration in milliseconds.
        */
        this.duration = duration;

        /**
        * @property {Number} - The elapsed delay in milliseconds.
        */
        this.elapsedDelay = 0;

        /**
        * @property {Number} - The elapsed time in milliseconds.
        */
        this.elapsedDuration = 0;

        /**
        * @property {Number} - The elapsed repeat delay in milliseconds.
        */
        this.elapsedRepeatDelay = 0;

        /**
        * @property {Boolean} - Whether or not the timer has started. The timer is started when its delay has elapsed.
        */
        this.isStarted = false;

        /**
        * @property {Boolean} - Whether or not the timer is complete.
        */
        this.isComplete = false;

        /**
        * @property {Number} - The number of times that the time should repeat after its first iteration. To repeat indefinitely, use looptime.Timer.INFINITE or -1.
        */
        this.repeat = repeat;

        /**
        * @property {Number} - The delay in milliseconds before the timer repeats.
        */
        this.repeatDelay = repeatDelay;

        /**
        * @property {Number} - The number of times the timer has repeated.
        * @private
        */
        this._repeatCount = 0;

        /**
        * @property {Function} - A function to be called when the timer begins.
        */
        this.onStart = onStart.bind(callbackScope);

        /**
        * @property {Function} - A function to be called when the timer updates.
        */
        this.onUpdate = onUpdate.bind(callbackScope);

        /**
        * @property {Function} - A function to be called when the timer completes.
        */
        this.onComplete = onComplete.bind(callbackScope);

        /**
        * @property {Function} - A function to be called when the timer repeats.
        */
        this.onRepeat = onRepeat.bind(callbackScope);
    }

    /**
    * Updates the timer.
    *
    * @param {Number} deltaTime - The elapsed time since the timer was updated.
    * @returns {this} self
    */


    _createClass(Timer, [{
        key: "update",
        value: function update(deltaTime) {
            if (this.isComplete) {
                return this;
            }

            var progress = this._getProgress(deltaTime);
            this.elapsedDelay = progress.elapsedDelay;
            this.elapsedDuration = progress.elapsedDuration;
            this.elapsedRepeatDelay = progress.elapsedRepeatDelay;
            this._repeatCount = progress.repeatCount;

            // Start
            if (this.elapsedDuration > 0 && this.isStarted === false) {
                this.isStarted = true;
                this.onStart();
            }

            // Update
            if (this.elapsedDuration > 0) {
                this.onUpdate();
            }

            // Repeat
            if (progress.deltaRepeatCount > 0) {
                var i = 1;
                while (i <= progress.deltaRepeatCount) {
                    if (i < progress.deltaRepeatCount) {
                        this.onRepeat();
                    } else if (i === progress.deltaRepeatCount && this.elapsedDuration > 0) {
                        this.onRepeat();
                    }
                    i++;
                }
            } else if (this._repeatCount > 0 && this.elapsedDuration - progress.deltaElapsedDuration <= 0) {
                this.onRepeat();
            }

            // Complete
            if (this.elapsedDuration >= this.duration && this._repeatCount === this.repeat) {
                this.isComplete = true;
                this.onComplete();
            }

            return this;
        }

        /**
        * @property {Number} - The total timer duration. Includes the delay, duration, and any repeating.
        * @readonly
        */

    }, {
        key: "_getProgress",


        /**
        * Gets the timer progress.
        *
        * @private
        * @param {Number} deltaTime - The change in time.
        * @returns {Object} An object representing the timer's progress.
        */
        value: function _getProgress(deltaTime) {
            var time = deltaTime;
            var deltaElapsedDelay = 0;
            var deltaElapsedDuration = 0;
            var deltaElapsedRepeatDelay = 0;
            var deltaRepeatCount = 0;
            var elapsedDelay = this.elapsedDelay;
            var elapsedDuration = this.elapsedDuration;
            var elapsedRepeatDelay = this.elapsedRepeatDelay;
            var repeatCount = this._repeatCount;

            // Determine delay progress and remaining time
            if (this.elapsedDelay < this.delay) {
                elapsedDelay += time;

                if (elapsedDelay > this.delay) {
                    deltaElapsedDelay = this.delay - this.elapsedDelay;
                    time = elapsedDelay - this.delay;
                    elapsedDelay = this.delay;
                } else {
                    deltaElapsedDelay = time;
                    time = 0;
                }
            }

            // Determine repeat progress
            if ((this.repeat > 0 || this.repeat === repeat.INFINITE) && (elapsedDuration + time > this.duration || repeatCount > 0)) {
                // Handle first repeat
                if (repeatCount === 0) {
                    time = elapsedDuration + time - this.duration;
                    elapsedDuration = 0;
                    deltaRepeatCount++;
                    repeatCount++;
                }

                // Handle time increments that don't trigger a repeat
                if (elapsedDuration > 0 && elapsedDuration + time <= this.duration) {
                    deltaElapsedDuration = time;
                    elapsedDuration += time;
                }
                // Handle time increments that trigger a repeat
                else {
                        time += elapsedDuration;
                        while (time > 0) {
                            // Handle repeat delay
                            if (elapsedRepeatDelay < this.repeatDelay) {
                                var repeatDelayProgress = this._getRepeatDelayProgress(time, elapsedRepeatDelay);
                                deltaElapsedRepeatDelay = repeatDelayProgress.deltaElapsedTime;
                                elapsedRepeatDelay = repeatDelayProgress.elapsedTime;
                                time -= repeatDelayProgress.deltaElapsedTime;
                            }

                            // Handle maxed repeat duration
                            if (time > this.duration && (repeatCount < this.repeat || this.repeat === repeat.INFINITE)) {
                                time -= this.duration;
                                elapsedDuration = 0;
                                elapsedRepeatDelay = 0;
                                deltaRepeatCount++;
                                repeatCount++;
                            }
                            // Handle within repeat duration
                            else {
                                    deltaElapsedDuration = time;
                                    elapsedDuration += time;
                                    time = 0;
                                }
                        }
                    }
            }
            // Determine non-repeat progress
            else {
                    deltaElapsedDuration = time;
                    elapsedDuration += time;
                }

            return {
                deltaElapsedDelay: deltaElapsedDelay,
                deltaElapsedDuration: deltaElapsedDuration,
                deltaElapsedRepeatDelay: deltaElapsedRepeatDelay,
                deltaRepeatCount: deltaRepeatCount,
                elapsedDelay: elapsedDelay,
                elapsedDuration: elapsedDuration,
                elapsedRepeatDelay: elapsedRepeatDelay,
                repeatCount: repeatCount
            };
        }

        /**
        * Gets the repeat delay progress.
        *
        * @private
        * @param {Number} deltaTime - The change in time.
        * @param {Number} elapsedDelay - The current elapsed repeat delay time.
        * @returns {Object} An object representing the timer's elapsed repeat delay progress.
        */

    }, {
        key: "_getRepeatDelayProgress",
        value: function _getRepeatDelayProgress(deltaTime, elapsedDelay) {
            var deltaElapsedTime = 0;
            var elapsedTime = elapsedDelay + deltaTime;

            if (elapsedTime > this.repeatDelay) {
                deltaElapsedTime = this.repeatDelay - elapsedDelay;
                elapsedTime = this.repeatDelay;
            } else {
                deltaElapsedTime = deltaTime;
            }

            return {
                deltaElapsedTime: deltaElapsedTime,
                elapsedTime: elapsedTime
            };
        }

        /**
        * Restarts the timer.
        *
        * @param {Boolean} includeDelay - Whether or not to observe the delay when restarting.
        * @returns {this} self
        */

    }, {
        key: "restart",
        value: function restart() {
            var includeDelay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (includeDelay === true) {
                this.elapsedDelay = 0;
            }

            this.elapsedDuration = 0;
            this.elapsedRepeatDelay = 0;
            this.isStarted = false;
            this.isComplete = false;
            this._repeatCount = 0;

            return this;
        }
    }, {
        key: "totalDuration",
        get: function get() {
            return this.repeat === repeat.INFINITE ? Infinity : this.delay + this.duration + this.repeat * (this.repeatDelay + this.duration);
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @author       Adam Kucharik
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @copyright    2017-present, Adam Kucharik, All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

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
* @copyright    2017-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
*/

var version = '0.1.0-alpha';

exports.default = version;

},{}]},{},[1])(1)
});