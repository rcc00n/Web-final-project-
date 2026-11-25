import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setupIntro, MAX_INTRO_MS } from '../intro.js';

function fixture(reducedMotion = false) {
    const video = Object.assign(new EventTarget(), { hidden: false, pause() { this.paused = true; } });
    const skipButton = Object.assign(new EventTarget(), { hidden: false, focused: false, matches() { return this.focused; } });
    const controls = { focus() { this.focused = true; } };
    const eventTarget = new EventTarget();
    let timeout, delay, cleared = false;
    const stop = setupIntro({ video, skipButton, controls, eventTarget, reducedMotion,
        setTimer: (fn, ms) => { timeout = fn; delay = ms; return 42; },
        clearTimer: () => { cleared = true; },
    });
    return { video, skipButton, controls, eventTarget, stop, expire: () => timeout(), delay: () => delay, cleared: () => cleared };
}
test('unloaded intro stays hidden and has a bounded fallback', () => {
    const f = fixture();
    assert.equal(f.video.hidden, true); assert.equal(f.skipButton.hidden, true);
    assert.equal(f.delay(), MAX_INTRO_MS); f.expire();
    f.video.dispatchEvent(new Event('playing'));
    assert.equal(f.video.hidden, true); assert.equal(f.video.paused, true); assert.ok(f.cleared());
});
for (const event of ['ended', 'error', 'abort']) {
    test(`playing intro resolves on ${event} and cannot restart`, () => {
        const f = fixture(); f.video.dispatchEvent(new Event('playing'));
        assert.equal(f.video.hidden, false); assert.equal(f.skipButton.hidden, false);
        f.video.dispatchEvent(new Event(event)); f.video.dispatchEvent(new Event('playing'));
        assert.equal(f.video.hidden, true); assert.equal(f.skipButton.hidden, true);
    });
}
test('skip restores focus without leaving hidden controls active', () => {
    const f = fixture(); f.video.dispatchEvent(new Event('playing')); f.skipButton.focused = true;
    f.skipButton.dispatchEvent(new Event('click'));
    assert.equal(f.video.hidden, true); assert.equal(f.controls.focused, true);
});
for (const event of ['pointerdown', 'keydown']) {
    test(`${event} dismisses without consuming calculator input`, () => {
        const f = fixture(); f.video.dispatchEvent(new Event('playing'));
        const input = new Event(event, { cancelable: true }); f.eventTarget.dispatchEvent(input);
        assert.equal(input.defaultPrevented, false); assert.equal(f.video.hidden, true);
    });
}
test('reduced motion never displays or starts the intro', () => {
    const f = fixture(true); f.video.dispatchEvent(new Event('playing'));
    assert.equal(f.video.hidden, true); assert.equal(f.video.paused, true); assert.equal(f.delay(), undefined);
});
