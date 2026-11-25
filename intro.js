// The opening video is optional: it never owns access to the calculator.
export const MAX_INTRO_MS = 6000;

export function setupIntro({ video, skipButton, controls, eventTarget, reducedMotion = false,
    setTimer = setTimeout, clearTimer = clearTimeout }) {
    let finished = false;
    let timer;
    const listeners = [];
    const listen = (target, type, handler) => {
        target.addEventListener(type, handler);
        listeners.push(() => target.removeEventListener(type, handler));
    };
    const finish = () => {
        if (finished) return;
        finished = true;
        const restoreFocus = skipButton.matches(':focus');
        video.hidden = true;
        skipButton.hidden = true;
        video.pause();
        clearTimer(timer);
        listeners.forEach(remove => remove());
        if (restoreFocus) controls.focus({ preventScroll: true });
    };
    video.hidden = true;
    skipButton.hidden = true;
    if (reducedMotion) {
        finish();
        return finish;
    }
    listen(video, 'playing', () => {
        video.hidden = false;
        skipButton.hidden = false;
    });
    for (const event of ['ended', 'error', 'abort']) listen(video, event, finish);
    listen(skipButton, 'click', finish);
    // A click or keystroke dismisses the optional visual without swallowing input.
    listen(eventTarget, 'pointerdown', finish);
    listen(eventTarget, 'keydown', finish);
    timer = setTimer(finish, MAX_INTRO_MS);
    if (video.error || video.ended) finish();
    else if (!video.paused && video.readyState >= 3) video.dispatchEvent(new Event('playing'));
    return finish;
}

if (typeof document !== 'undefined') {
    setupIntro({
        video: document.getElementById('introVideo'),
        skipButton: document.getElementById('skipIntro'),
        controls: document.getElementById('display'),
        eventTarget: window,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
}
