/**
* @author       Adam Kucharik
* @copyright    2017-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
*/

const repeat = {
    INFINITE: -1
};

/**
* Creates a TapSquire instance.
* 
* @class TapSquire
* @constructor
* @param {Element} element - The HTML element for which the TapSquire instance will manage events.
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

    update (deltaTime) {
        let time = deltaTime;
        
        if (this.isComplete) {
            return this;
        }

        if (this.delay > this.elapsedDelay) {
            this.elapsedDelay += time;
            
            if (this.elapsedDelay >= this.delay) {
                time = this.elapsedDelay - this.delay;
            }
            else {
                return this;
            }
        }

        if (this._repeat > 0 && this.repeatDelay > this.elapsedRepeatDelay) {
            this.elapsedRepeatDelay += time;
            
            if (this.elapsedRepeatDelay >= this.repeatDelay) {
                time = this.elapsedRepeatDelay - this.repeatDelay;
            }
            else {
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
            }
            else {
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
    *//*
    * Adds an event listener with TapSquire magic.
    *
    * @param {String} type - The event type to listen for.
    * @param {Function} handler - A function to execute when the event is triggered.
    * @param {Object} options - An object of options.
    */
    restart () {
        this.elapsedDelay = 0;
        this.elapsedRepeatDelay = 0;
        this.elapsedTime = 0;
        this.isActive = false;
        this.isComplete = false;
        this._repeat = 0;

        return this;
    }
}

export default Timer;