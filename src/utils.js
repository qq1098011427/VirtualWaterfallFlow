function rafThrottle(fn) {
    let lock = false;
    return (...args) => {
        if (lock) return;
        lock = true;
        window.requestAnimationFrame(() => {
            fn(args);
            lock = false;
        });
    };
}

function debounce(fn, delay = 300) {
    let timer = null;
    return (...args) => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
           fn(args);
        }, delay);
    };
}

export { rafThrottle, debounce };
