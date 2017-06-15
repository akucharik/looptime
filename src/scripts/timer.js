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
        if (progress.deltaRepeatCount > 0) {
            let i = 1;
            while (i <= progress.deltaRepeatCount) {
                if (i < progress.deltaRepeatCount) {
                    this.onRepeat();
                }
                else if (i === progress.deltaRepeatCount && this.elapsedDuration > 0) {
                    this.onRepeat();
                }
                i++;
            }
        }
        else if (this._repeatCount > 0 && this.elapsedDuration - progress.deltaElapsedDuration <= 0) {
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
    get totalDuration () {
        return (this.repeat === repeat.INFINITE) ? Infinity : this.delay + this.duration + this.repeat * (this.repeatDelay + this.duration);
    }

    /**
    * Gets the timer progress.
    *
    * @private
    * @param {Number} deltaTime - The change in time.
    * @returns {Object} An object representing the timer's progress.
    */
    _getProgress (deltaTime) {
        let time = deltaTime;
        let deltaElapsedDelay = 0;
        let deltaElapsedDuration = 0;
        let deltaElapsedRepeatDelay = 0;
        let deltaRepeatCount = 0;
        let elapsedDelay = this.elapsedDelay;
        let elapsedDuration = this.elapsedDuration;
        let elapsedRepeatDelay = this.elapsedRepeatDelay;
        let repeatCount = this._repeatCount;
        
        // Determine delay progress and remaining time
        if (this.elapsedDelay < this.delay) {
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
                        let repeatDelayProgress = this._getRepeatDelayProgress(time, elapsedRepeatDelay);
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
    _getRepeatDelayProgress (deltaTime, elapsedDelay) {
        let deltaElapsedTime = 0;
        let elapsedTime = elapsedDelay + deltaTime;

        if (elapsedTime > this.repeatDelay) {
            deltaElapsedTime = this.repeatDelay - elapsedDelay;
            elapsedTime = this.repeatDelay;
        }
        else {
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