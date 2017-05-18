/**
* @author       Adam Kucharik
* @copyright    2017-present, Adam Kucharik, All rights reserved.
* @license      https://github.com/akucharik/looptime/blob/master/LICENSE.md
*/

import Timer from './timer';

/**
* Creates a TapSquire instance.
* 
* @class TapSquire
* @constructor
* @param {Element} element - The HTML element for which the TapSquire instance will manage events.
*/
class TimerManager {
    constructor () {
        this.timers = [];
    }

    destroy () {
        this.removeTimers();
    }

    update (deltaTime) {
        this.timers.forEach((timer) => {
            if (!timer.complete) {
                timer.update(deltaTime);
            }
            else {
                if (timer.destroyOnComplete) {
                    this.removeTimer(timer);
                }
            }
        });
    }

    addTimer (duration, options) {
        const timer = new Timer(duration, options);
        this.timers.push(timer);

        return timer;
    }

    removeTimer (timer) {
        const i = this.timers.indexOf(timer);

        if (i !== -1) {
            return this.timers.splice(i, 1)[0];
        }
    }

    removeTimers () {
        const timers = this.timers;

        this.timers = [];

        return timers;
    }
}

export default TimerManager;