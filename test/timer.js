import { before, beforeEach, describe, it } from 'mocha';
import { expect }  from 'chai';
import jsdom       from 'mocha-jsdom';
import sinon       from 'sinon';
import Timer       from '../src/scripts/timer';
    
describe('Timer:', () => {
    let timer;
    let startSpy;
    let updateSpy;
    let completeSpy;
    let repeatSpy;
    
    let customTimer;
    let customStartSpy;
    let customUpdateSpy;
    let customCompleteSpy;
    let customRepeatSpy;
    let customCallbackScope = {};
    
    let zeroTimer;
    let zeroTimerDelay;
    
    let infiniteTimer;
    let infiniteStartSpy;
    let infiniteUpdateSpy;
    let infiniteCompleteSpy;
    let infiniteRepeatSpy;
    let infiniteCallbackScope = {};
    
    let fakeTimer = sinon.useFakeTimers();
    
    jsdom();
    
    beforeEach('test setup', () => {
        timer = new Timer(1000);
        
        startSpy = sinon.spy(timer, 'onStart');
        updateSpy = sinon.spy(timer, 'onUpdate');
        completeSpy = sinon.spy(timer, 'onComplete');
        repeatSpy = sinon.spy(timer, 'onRepeat');
        
        customTimer = new Timer(1000, {
            delay: 500,
            destroyOnComplete: true,
            repeat: 2,
            repeatDelay: 500,
            onStart: function () {},
            onUpdate: function () {},
            onComplete: function () {},
            onRepeat: function () {},
            callbackScope: customCallbackScope
        });
        
        customStartSpy = sinon.spy(customTimer, 'onStart');
        customUpdateSpy = sinon.spy(customTimer, 'onUpdate');
        customCompleteSpy = sinon.spy(customTimer, 'onComplete');
        customRepeatSpy = sinon.spy(customTimer, 'onRepeat');
        
        infiniteTimer = new Timer(1000, {
            delay: 500,
            destroyOnComplete: true,
            repeat: -1,
            repeatDelay: 500,
            onStart: function () {},
            onUpdate: function () {},
            onComplete: function () {},
            onRepeat: function () {},
            callbackScope: infiniteCallbackScope
        });
        
        infiniteStartSpy = sinon.spy(infiniteTimer, 'onStart');
        infiniteUpdateSpy = sinon.spy(infiniteTimer, 'onUpdate');
        infiniteCompleteSpy = sinon.spy(infiniteTimer, 'onComplete');
        infiniteRepeatSpy = sinon.spy(infiniteTimer, 'onRepeat');
        
        zeroTimer = new Timer(0);
        zeroTimerDelay = new Timer(0, {
            delay: 500
        });
    });
    
    afterEach('test teardown', () => {
        fakeTimer.restore();

        timer.restart(true);
        customTimer.restart(true);
        infiniteTimer.restart(true);
        zeroTimer.restart(true);
        zeroTimerDelay.restart(true);
    });

    describe('when getting the total duration', () => {
        it('should account for the delay, duration, repeat delay, and repeats', () => {
            // Duration
            expect(timer.totalDuration).to.equal(1000);
            
            // Delay, Duration
            timer.delay = 500;
            expect(timer.totalDuration).to.equal(1500);
            
            // Delay, Duration, Repeat Delay, Repeat
            expect(customTimer.totalDuration).to.equal(4500);
            
            // Repeat === INFINITE
            customTimer.repeat = -1;
            expect(customTimer.totalDuration).to.equal(Infinity);
        });
    });

    describe('when getting repeat delay progress from a delay of 0ms on a finite repeat timer', () => {
        it('should be within the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(16, 0);
            expect(progress.deltaElapsedTime).to.equal(16);
            expect(progress.elapsedTime).to.equal(16);
        });
        
        it('should be on the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(500, 0);
            expect(progress.deltaElapsedTime).to.equal(500);
            expect(progress.elapsedTime).to.equal(500);
        });
        
        it('should be after the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(516, 0);
            expect(progress.deltaElapsedTime).to.equal(500);
            expect(progress.elapsedTime).to.equal(500);
        });
    });
    
    describe('when getting infinite repeat delay progress from a delay of 0ms on an infinite repeat timer', () => {
        it('should be within the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(16, 0);
            expect(progress.deltaElapsedTime).to.equal(16);
            expect(progress.elapsedTime).to.equal(16);
        });
        
        it('should be on the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(500, 0);
            expect(progress.deltaElapsedTime).to.equal(500);
            expect(progress.elapsedTime).to.equal(500);
        });
        
        it('should be after the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(516, 0);
            expect(progress.deltaElapsedTime).to.equal(500);
            expect(progress.elapsedTime).to.equal(500);
        });
    });
    
    describe('when getting repeat delay progress from a delay of 16ms on a finite repeat timer', () => {
        it('should be within the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(16, 16);
            expect(progress.deltaElapsedTime).to.equal(16);
            expect(progress.elapsedTime).to.equal(32);
        });
        
        it('should be on the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(484, 16);
            expect(progress.deltaElapsedTime).to.equal(484);
            expect(progress.elapsedTime).to.equal(500);
        });
        
        it('should be after the delay', () => {
            let progress = customTimer._getRepeatDelayProgress(500, 16);
            expect(progress.deltaElapsedTime).to.equal(484);
            expect(progress.elapsedTime).to.equal(500);
        });
    });
    
    describe('when getting repeat delay progress from a delay of 16ms on an infinite repeat timer', () => {
        it('should be within the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(16, 16);
            expect(progress.deltaElapsedTime).to.equal(16);
            expect(progress.elapsedTime).to.equal(32);
        });
        
        it('should be on the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(484, 16);
            expect(progress.deltaElapsedTime).to.equal(484);
            expect(progress.elapsedTime).to.equal(500);
        });
        
        it('should be after the delay', () => {
            let progress = infiniteTimer._getRepeatDelayProgress(500, 16);
            expect(progress.deltaElapsedTime).to.equal(484);
            expect(progress.elapsedTime).to.equal(500);
        });
    });
    
    describe('when getting progress from a duration of 0ms on a 0 duration non-delayed timer', () => {
        it('should be after the duration', () => {
            let progress = zeroTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
    });
    
    describe('when getting progress from a delay of 0ms on a 0 duration delayed timer', () => {
        it('should be within the delay', () => {
            let progress = zeroTimerDelay._getProgress(16);
            expect(progress.elapsedDelay).to.equal(16);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });

        it('should be on the delay', () => {
            let progress = zeroTimerDelay._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('should be after the delay', () => {
            let progress = zeroTimerDelay._getProgress(516);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
    });
    
    describe('when getting progress from a delay of 16ms on a 0 duration delayed timer', () => {
        beforeEach('test setup', () => {
            zeroTimerDelay.update(16);
        });
        
        it('should be within the delay', () => {
            let progress = zeroTimerDelay._getProgress(16);
            expect(progress.elapsedDelay).to.equal(32);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });

        it('should be on the delay', () => {
            let progress = zeroTimerDelay._getProgress(484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('should be after the delay', () => {
            let progress = zeroTimerDelay._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
    });
    
    describe('when getting progress from the end of the delay on a 0 duration delayed timer', () => {
        beforeEach('test setup', () => {
            zeroTimerDelay.update(500);
        });
        
        it('should be after the delay', () => {
            let progress = zeroTimerDelay._getProgress(16);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
    });
    
    describe('when getting progress from a duration of 0ms on a non-delayed timer', () => {
        it('should be within the duration', () => {
            let progress = timer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('should be on the duration', () => {
            let progress = timer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('should be after the duration', () => {
            let progress = timer._getProgress(1016);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(0);
        });
    });
    
    
    
    
    
    
    
    
    
    
    
    
    describe('when getting progress from 0ms', () => {
        it('of 0 duration timer', () => {
            let progress = zeroTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(16);
            expect(progress.elapsedDelay).to.equal(16);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });

        it('on delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('after delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(516);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within duration of timer', () => {
            let progress = timer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of timer', () => {
            let progress = timer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('after duration of timer', () => {
            let progress = timer._getProgress(1016);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within delay of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(16);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on delay of delayed timer', () => {
            let progress = customTimer._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within duration of delayed timer', () => {
            let progress = customTimer._getProgress(600);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(100);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(1600);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(100);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(2000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(2100);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(100);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(3000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(3100);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(100);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(3500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(3600);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(100);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(4500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(4516);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    describe('when getting progress from within a delay', () => {
        beforeEach('test setup', () => {
            timer.update(16);
            customTimer.update(16);
            zeroTimerDelay.update(16);
        });

        afterEach('test teardown', () => {
            timer.restart(true);
            customTimer.restart(true);
            zeroTimerDelay.restart(true);
        });
        
        it('within delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(16);
            expect(progress.elapsedDelay).to.equal(32);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });

        it('on delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('after delay of 0 duration timer', () => {
            let progress = zeroTimerDelay._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within duration of timer', () => {
            let progress = timer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(32);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of timer', () => {
            let progress = timer._getProgress(984);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('after duration of timer', () => {
            let progress = timer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within delay of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(32);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on delay of delayed timer', () => {
            let progress = customTimer._getProgress(484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within duration of delayed timer', () => {
            let progress = customTimer._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of delayed timer', () => {
            let progress = customTimer._getProgress(1484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(1984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(2000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(2984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(3000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(3484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(3500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(4484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(4500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    describe('when getting progress from within the duration', () => {
        beforeEach('test setup', () => {
            timer.update(16);
            customTimer.update(516);
        });

        afterEach('test teardown', () => {
            timer.restart(true);
            customTimer.restart(true);
        });
        
        it('within duration of timer', () => {
            let progress = timer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(32);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of timer', () => {
            let progress = timer._getProgress(984);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('after duration of timer', () => {
            let progress = timer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(0);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within duration of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(32);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('on duration of delayed timer', () => {
            let progress = customTimer._getProgress(984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(0);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(0);
        });
        
        it('within repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(1484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat 1 of delayed timer', () => {
            let progress = customTimer._getProgress(2484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(2500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(2984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(3000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(3984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 of delayed timer', () => {
            let progress = customTimer._getProgress(4000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    describe('when getting progress from within the 1st repeat delay', () => {
        beforeEach('test setup', () => {
            customTimer.update(1516);
        });

        afterEach('test teardown', () => {
            customTimer.restart(true);
        });
        
        it('within repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(32);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat delay of delayed timer', () => {
            let progress = customTimer._getProgress(484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 1 duration of delayed timer', () => {
            let progress = customTimer._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat 1 duration of delayed timer', () => {
            let progress = customTimer._getProgress(1484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(1984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(2000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(2984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(3000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    
    
    
    
    
    describe('when getting progress from within the 2nd repeat delay', () => {
        beforeEach('test setup', () => {
            customTimer.update(3016);
        });

        afterEach('test teardown', () => {
            customTimer.restart(true);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(32);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(1484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    
    
    
    
    
    describe('when getting progress from within the 1st repeat duration', () => {
        beforeEach('test setup', () => {
            customTimer.update(2016);
        });

        afterEach('test teardown', () => {
            customTimer.restart(true);
        });
        
        it('within repeat 1 duration of delayed timer', () => {
            let progress = customTimer._getProgress(16);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(32);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('on repeat 1 duration of delayed timer', () => {
            let progress = customTimer._getProgress(984);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(1);
        });
        
        it('within repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(1000);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(16);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 delay of delayed timer', () => {
            let progress = customTimer._getProgress(1484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(0);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('within repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(1500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(16);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('on repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(2484);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1000);
            expect(progress.repeatCount).to.equal(2);
        });
        
        it('after repeat 2 duration of delayed timer', () => {
            let progress = customTimer._getProgress(2500);
            expect(progress.elapsedDelay).to.equal(500);
            expect(progress.elapsedRepeatDelay).to.equal(500);
            expect(progress.elapsedDuration).to.equal(1016);
            expect(progress.repeatCount).to.equal(2);
        });
    });
    
    
    
    describe('when instantiating', () => {
        it('should have the correct duration', () => {
            expect(timer.duration).to.equal(1000);
        });
        
        it('should have the correct defaults', () => {
            expect(timer.delay).to.equal(0);
            expect(timer.destroyOnComplete).to.be.false;
            expect(timer.repeat).to.equal(0);
            expect(timer.repeatDelay).to.equal(0);
            expect(timer.onStart).to.be.a('function');
            expect(timer.onUpdate).to.be.a('function');
            expect(timer.onComplete).to.be.a('function');
            expect(timer.onRepeat).to.be.a('function');
        });
        
        it('should have the correct custom options', () => {
            expect(customTimer.delay).to.equal(500);
            expect(customTimer.destroyOnComplete).to.be.true;
            expect(customTimer.repeat).to.equal(2);
            expect(customTimer.repeatDelay).to.equal(500);
            expect(customTimer.onStart).to.be.a('function');
            expect(customTimer.onUpdate).to.be.a('function');
            expect(customTimer.onComplete).to.be.a('function');
            expect(customTimer.onRepeat).to.be.a('function');
        });
    });
    
    
    
    
    
    
    describe('when instantiating', () => {
        it('should have the correct duration', () => {
            expect(timer.duration).to.equal(1000);
        });
        
        it('should have the correct defaults', () => {
            expect(timer.delay).to.equal(0);
            expect(timer.destroyOnComplete).to.be.false;
            expect(timer.repeat).to.equal(0);
            expect(timer.repeatDelay).to.equal(0);
            expect(timer.onStart).to.be.a('function');
            expect(timer.onUpdate).to.be.a('function');
            expect(timer.onComplete).to.be.a('function');
            expect(timer.onRepeat).to.be.a('function');
        });
        
        it('should have the correct custom options', () => {
            expect(customTimer.delay).to.equal(500);
            expect(customTimer.destroyOnComplete).to.be.true;
            expect(customTimer.repeat).to.equal(2);
            expect(customTimer.repeatDelay).to.equal(500);
            expect(customTimer.onStart).to.be.a('function');
            expect(customTimer.onUpdate).to.be.a('function');
            expect(customTimer.onComplete).to.be.a('function');
            expect(customTimer.onRepeat).to.be.a('function');
        });
    });

    describe('when delayed', () => {
        it('should track the elapsed delay time', () => {
            // Clean timing
            customTimer.update(16);
            expect(customTimer.elapsedDelay).to.equal(16);
            
            // Dirty timing
            customTimer.restart(true);
            customTimer.update(516);
            expect(customTimer.elapsedDelay).to.equal(500);
        });
        
        it('should not start', () => {
            customTimer.update(16);
            expect(customStartSpy.callCount).to.equal(0);
            expect(customTimer.elapsedDuration).to.equal(0);
            expect(customUpdateSpy.callCount).to.equal(0);
        });
    });
    
    describe('when starting', () => {
        it('should start the timer', () => {
            // Clean timing
            timer.update(16);
            expect(timer.isStarted).to.be.true;
            
            // Delayed: Clean timing
            customTimer.update(500).update(16);
            expect(customTimer.isStarted).to.be.true;
            
            // Delayed: Dirty timing
            customTimer.restart(true);
            customTimer.update(516);
            expect(customTimer.isStarted).to.be.true;
        });
        
        it('should execute the onStart callback', () => {
            // Clean timing
            timer.update(16);
            expect(startSpy.callCount).to.equal(1);
            
            // Delayed: Clean timing
            customTimer.update(500).update(16);
            expect(customStartSpy.callCount).to.equal(1);
            
            // Delayed: Dirty timing
            customStartSpy.reset();
            customTimer.restart(true);
            customTimer.update(516);
            expect(customStartSpy.callCount).to.equal(1);
        });
    });
    
    describe('when updating', () => {
        it('should track the elapsed time', () => {
            // Clean timing
            timer.update(16);
            expect(timer.elapsedDuration).to.equal(16);
            
            // Delayed: Clean timing
            customTimer.update(500).update(16);
            expect(customTimer.elapsedDuration).to.equal(16);
            
            // Delayed: Dirty timing
            customTimer.restart(true);
            customTimer.update(516);
            expect(customTimer.elapsedDuration).to.equal(16);
        });
        
        it('should execute the onUpdate callback', () => {
            // Clean timing
            timer.update(16);
            expect(updateSpy.callCount).to.equal(1);
            
            // Delayed: Clean timing
            customTimer.update(500).update(16);
            expect(customUpdateSpy.callCount).to.equal(1);
            
            // Delayed: Dirty timing
            customUpdateSpy.reset();
            customTimer.restart(true);
            customTimer.update(516);
            expect(customUpdateSpy.callCount).to.equal(1);
        });
    });
    
    describe('when complete', () => {
        it('should have an elapsed time greater than or equal to the duration', () => {
            // Clean timing
            timer.update(1000);
            expect(timer.elapsedDuration).to.equal(1000);
            
            // Dirty timing
            timer.restart();
            timer.update(1016);
            expect(timer.elapsedDuration).to.equal(1016);
        });
        
        it('should execute the onComplete callback', () => {
            // Clean timing
            timer.update(1000);
            expect(completeSpy.callCount).to.equal(1);
            
            // Dirty timing
            completeSpy.reset();
            timer.restart();
            timer.update(1016);
            expect(completeSpy.callCount).to.equal(1);
            
            // Delay & Repeat: Clean timing
            customTimer.update(1500).update(1500).update(1500);
            expect(customCompleteSpy.callCount).to.equal(1);

            // Delay & Repeat: Dirty timing
            customCompleteSpy.reset();
            customTimer.restart(true);
            customTimer.update(4516);
            expect(customCompleteSpy.callCount).to.equal(1);
        });
        
        it('should no longer update', () => {
            // Clean timing
            timer.update(1000).update(16);
            expect(updateSpy.callCount).to.equal(1);
            expect(timer.elapsedDuration).to.equal(1000);
            
            // Dirty timing
            updateSpy.reset();
            timer.restart();
            timer.update(1016);
            expect(updateSpy.callCount).to.equal(1);
            expect(timer.elapsedDuration).to.equal(1016);
        });
    });
    
    describe('when repeating after a large time increment', () => {
        it('should repeat multiple times', () => {
            customTimer.update(3516);
            expect(customTimer._repeatCount).to.equal(2);
            expect(customTimer.elapsedRepeatDelay).to.equal(500);
            expect(customTimer.elapsedDuration).to.equal(16);
            expect(customRepeatSpy.callCount).to.equal(2);
        });
        
        it('should observe the repeat delay', () => {
            customTimer.update(3016);
            expect(customTimer.elapsedRepeatDelay).to.equal(16);
            expect(customTimer.elapsedDuration).to.equal(0);
            expect(customUpdateSpy.callCount).to.equal(0);
            expect(customRepeatSpy.callCount).to.equal(1);
        });
        
        it('should proceed to update after the repeat delay', () => {
            customTimer.update(2016);
            expect(customTimer.elapsedRepeatDelay).to.equal(500);
            expect(customTimer.elapsedDuration).to.equal(16);
            expect(customUpdateSpy.callCount).to.equal(1);
            expect(customRepeatSpy.callCount).to.equal(1);
        });
    });
    
    describe('when repeating after a small time increment', () => {
        it('should repeat once', () => {
            customTimer.update(1516);
            expect(customTimer._repeatCount).to.equal(1);
            expect(customTimer.elapsedRepeatDelay).to.equal(16);
            expect(customTimer.elapsedDuration).to.equal(0);
            expect(customRepeatSpy.callCount).to.equal(0);
        });
        
        it('should observe the repeat delay', () => {
            customTimer.update(1500).update(16);
            expect(customTimer.elapsedRepeatDelay).to.equal(16);
            expect(customTimer.elapsedDuration).to.equal(0);
            expect(customUpdateSpy.callCount).to.equal(1);
            expect(customUpdateSpy.callCount).to.equal(1);
        });
        
        it('should proceed to update after the repeat delay', () => {
            customTimer.update(1500).update(500).update(16);
            expect(customTimer.elapsedRepeatDelay).to.equal(500);
            expect(customTimer.elapsedDuration).to.equal(16);
            expect(customUpdateSpy.callCount).to.equal(2);
            expect(customRepeatSpy.callCount).to.equal(1);
        });
    });
    
    describe('when restarting', () => {
        it('should reset the timer without observing the delay', () => {
            timer.delay = 500;
            timer.repeat = 1;
            timer.repeatDelay = 500;
            timer.update(2500);
            timer.restart();
            expect(timer._repeatCount).to.equal(0);
            expect(timer.elapsedDelay).to.equal(500);
            expect(timer.elapsedRepeatDelay).to.equal(0);
            expect(timer.elapsedDuration).to.equal(0);
            expect(timer._repeatCount).to.equal(0);
            expect(timer.isStarted).to.be.false;
            expect(timer.isComplete).to.be.false;
        });
        
        it('should reset the timer while observing the delay', () => {
            timer.delay = 500;
            timer.repeat = 1;
            timer.repeatDelay = 500;
            timer.update(2500);
            timer.restart(true);
            expect(timer._repeatCount).to.equal(0);
            expect(timer.elapsedDelay).to.equal(0);
            expect(timer.elapsedRepeatDelay).to.equal(0);
            expect(timer.elapsedDuration).to.equal(0);
            expect(timer._repeatCount).to.equal(0);
            expect(timer.isStarted).to.be.false;
            expect(timer.isComplete).to.be.false;
        });
    });
});