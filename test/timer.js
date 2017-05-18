import { before, beforeEach, describe, it } from 'mocha';
import { expect }  from 'chai';
import jsdom       from 'mocha-jsdom';
import sinon       from 'sinon';
import Timer       from '../src/scripts/timer';
    
describe('Timer:', () => {
    let timer;
    let startSpy = sinon.spy();
    let updateSpy = sinon.spy();
    let completeSpy = sinon.spy();
    let repeatSpy = sinon.spy();
    let fakeTimer = sinon.useFakeTimers();
    jsdom();
    
    beforeEach('test setup', () => {
        timer = new Timer(1000, {
            onStart: startSpy,
            onUpdate: updateSpy,
            onComplete: completeSpy,
            onRepeat: repeatSpy
        });
    });
    
    afterEach('test teardown', () => {
        timer.restart();
        startSpy.reset();
        updateSpy.reset();
        completeSpy.reset();
        repeatSpy.reset();
        fakeTimer.restore();
    });
    
    describe('when instantiating', () => {
        it('should have the correct defaults', () => {
            expect(timer.delay).to.equal(0);
            expect(timer.destroyOnComplete).to.be.false;
            expect(timer.repeat).to.equal(0);
            expect(timer.repeatDelay).to.equal(0);
            expect(timer.onStart).to.be.a('function');
            expect(timer.onUpdate).to.be.a('function');
            expect(timer.onComplete).to.be.a('function');
            expect(timer.onRepeat).to.be.a('function');
            expect(timer.callbackScope).to.equal(timer);
        });
    });

    describe('when starting', () => {
        it('should not start if delayed', () => {
            timer.delay = 500;
            timer.update(16);
            expect(startSpy.callCount).to.equal(0);
        });
        
        it('should start after delay', () => {
            timer.delay = 500;
            timer.update(1500);
            expect(startSpy.callCount).to.equal(1);
        });
        
        it('should be active', () => {
            timer.update(16);
            expect(timer.isActive).to.be.true;
        });
        
        it('should execute onStart callback', () => {
            timer.update(16);
            expect(startSpy.callCount).to.equal(1);
        });
    });
    
    describe('when updating', () => {        
        it('should execute onUpdate callback', () => {
            timer.update(16);
            expect(updateSpy.callCount).to.equal(1);
        });
        
        it('should track the elapsed delay time', () => {
            timer.delay = 500;
            timer.update(16).update(16);
            expect(timer.elapsedDelay).to.equal(32);
            expect(timer.elapsedTime).to.equal(0);
        });
        
        it('should track the elapsed time', () => {
            timer.update(16).update(16);
            expect(timer.elapsedTime).to.equal(32);
        });
    });
    
    describe('when complete', () => {
        it('should not be active', () => {
            timer.update(1000);
            expect(timer.isActive).to.be.false;
        });
        
        it('should execute onComplete callback', () => {
            timer.update(1000);
            expect(completeSpy.callCount).to.equal(1);
        });
        
        it('should no longer execute onUpdate', () => {
            timer.update(1000).update(16);
            expect(updateSpy.callCount).to.equal(1);
            expect(timer.elapsedTime).to.equal(1000);
        });
    });
    
    describe('when repeating', () => {        
        it('should execute onRepeat callback', () => {
            timer.repeat = 1;
            timer.update(1000);
            expect(repeatSpy.callCount).to.equal(1);
        });
        
        it('should set up the timer for the next cycle', () => {
            timer.repeat = 1;
            timer.update(1000);
            expect(timer._repeat).to.equal(1);
            expect(timer.elapsedTime).to.equal(0);
            expect(timer.elapsedRepeatDelay).to.equal(0);
        });
        
        it('should not execute onUpdate if repeat delayed', () => {
            timer.repeat = 1;
            timer.repeatDelay = 500;
            timer.update(1000).update(250);
            expect(updateSpy.callCount).to.equal(1);
        });
        
        it('should track the elapsed repeat delay time', () => {
            timer.repeat = 1;
            timer.repeatDelay = 500;
            timer.update(1000).update(16).update(16);
            expect(timer.elapsedRepeatDelay).to.equal(32);
        });
    });
    
    describe('when restarting', () => {
        it('should reset the timer', () => {
            timer.repeat = 1;
            timer.repeatDelay = 500;
            timer.update(2000);
            timer.restart();
            expect(timer._repeat).to.equal(0);
            expect(timer.elapsedDelay).to.equal(0);
            expect(timer.elapsedRepeatDelay).to.equal(0);
            expect(timer.elapsedTime).to.equal(0);
            expect(timer._repeat).to.equal(0);
            expect(timer.isActive).to.be.false;
            expect(timer.isComplete).to.be.false;
        });
    });
});