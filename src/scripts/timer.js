/**
* @author       Adam Kucharik
* @copyright    2017-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
*/

const repeat = {
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
class Timer {
    constructor (duration, {
        delay = 0,
        destroyOnComplete = false,
        repeat = 0,
        repeatDelay = 0,
        onStart = function () {},
        onUpdate = function () {},
        onComplete = function () {},
        onRepeat = function () {},
        callbackScope = this
    } = {}) {
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
    update (deltaTime) {
        if (this.isComplete) {
            return this;
        }
        
        let progress = this._getProgress(deltaTime);
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
        let i = 0;
        while (i < progress.deltaRepeatCount) {
            this.onRepeat();
            i++;
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
    get totalDuration () {
        return (this.repeat === repeat.INFINITE) ? Infinity : this.delay + this.duration + this.repeat * (this.repeatDelay + this.duration);
    }
    
    /**
    * @property {Number} - The duration of a single repeat. Includes the repeat delay.
    * @private
    * @readonly
    */
    get _repeatDuration () {
        return (this.repeat > 0 || this.repeat === repeat.INFINITE) ? this.repeatDelay + this.duration : 0;
    }

    _getProgress (deltaTime) {
        let time = deltaTime;
        let deltaElapsedDelay = 0;
        let deltaElapsedDuration = 0;
        let deltaElapsedRepeatDelay = 0;
        let deltaRepeatCount = 0;
        let elapsedDelay = this.elapsedDelay;
        let elapsedDuration = this.elapsedDuration;
        let elapsedRepeatDelay = this.elapsedRepeatDelay;
        
        // Handle edge cases when last update was precisely at the end of the duration
        if (this.elapsedDuration === this.duration) {
            if (this._repeatCount === 0) {
                elapsedDuration = 0;
            }

            if (this.elapsedRepeatDelay === this.repeatDelay) {
                elapsedRepeatDelay = 0;
            }
        }
        
        // Determine delay progress and remaining time
        if (elapsedDelay < this.delay) {
            elapsedDelay += time;

            if (elapsedDelay > this.delay) {
                deltaElapsedDelay = this.delay - this.elapsedDelay;
                time = elapsedDelay - this.delay;
                elapsedDelay = this.delay;
            }
            else {
                deltaElapsedDelay = time;
                time = 0;
            }
        }
        
        // Determine repeat delay progress and remaining time
        if ((this.elapsedDelay === this.delay && this.elapsedDuration === this.duration) || this._repeatCount > 0) {            
            if (elapsedRepeatDelay < this.repeatDelay) {
                elapsedRepeatDelay += time;

                if (elapsedRepeatDelay > this.repeatDelay) {
                    deltaElapsedRepeatDelay = this.repeatDelay - this.elapsedRepeatDelay;
                    time = elapsedRepeatDelay - this.repeatDelay;
                    elapsedRepeatDelay = this.repeatDelay;
                    deltaRepeatCount++;
                }
                else {
                    deltaElapsedRepeatDelay = time;
                    time = 0;
                }
            }
        }
        
        deltaElapsedDuration = time;
        elapsedDuration += time;
        
        // Determine repeat progress        
        if (elapsedDuration > this.duration && (this.repeat > 0 || this.repeat === repeat.INFINITE)) {
            elapsedDuration -= this.duration;
            
            // Determine repeat count and remaining time
            if (elapsedDuration > this._repeatDuration) {
                const maxRepeats = Math.floor(elapsedDuration / this._repeatDuration);
                const repeats = (this.repeat === repeat.INFINITE) ? maxRepeats : Math.min(this.repeat, maxRepeats);
                elapsedDuration = elapsedDuration - this._repeatDuration * repeats;                
                deltaRepeatCount += repeats;
                
                if (deltaRepeatCount + this._repeatCount === this.repeat) {
                    elapsedDuration += this.duration;
                    elapsedRepeatDelay += this.repeatDelay;
                }
            }

            // Determine repeat delay progress and remaining time
            if (this._repeatCount + deltaRepeatCount < this.repeat || this.repeat === repeat.INFINITE) {
                if (elapsedDuration > this.repeatDelay) {
                    deltaElapsedRepeatDelay = elapsedRepeatDelay = this.repeatDelay;
                    deltaElapsedDuration = elapsedDuration -= this.repeatDelay;

                    if (this._repeatCount + deltaRepeatCount < this.repeat || this.repeat === repeat.INFINITE) {
                        deltaRepeatCount++;
                    }
                }
                else {
                    deltaElapsedRepeatDelay = elapsedRepeatDelay = elapsedDuration;
                    deltaElapsedDuration = elapsedDuration = 0;
                }
            }
        }
        // Increment repeat count when last update was precisely at the ended of repeat delay 
        else if (this.elapsedDuration === 0 && this.elapsedRepeatDelay === this.repeatDelay && (this.repeat > 0 || this.repeat === repeat.INFINITE)) {
            deltaRepeatCount++;
        }
        
        return {
            deltaElapsedDelay: deltaElapsedDelay,
            deltaElapsedDuration: deltaElapsedDuration,
            deltaElapsedRepeatDelay: deltaElapsedRepeatDelay,
            deltaRepeatCount: deltaRepeatCount,
            elapsedDelay: elapsedDelay,
            elapsedDuration: elapsedDuration,
            elapsedRepeatDelay: elapsedRepeatDelay,
            repeatCount: deltaRepeatCount + this._repeatCount
        };
    }
    
    
    /**
    * Restarts the timer.
    *
    * @param {Boolean} includeDelay - Whether or not to observe the delay when restarting.
    * @returns {this} self
    */
    restart (includeDelay = false) {
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
}

export default Timer;