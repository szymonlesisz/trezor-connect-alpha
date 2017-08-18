export function popupConsole(tag: string, postMessage: Function) {
    const c = global.console;
    const orig = {
        error: c.error,
        //warn: c.warn,
        info: c.info,
        debug: c.debug,
        log: c.log
    };
    const log = [];

    const inject = (method, level) => {
        return (...args) => {
            args.unshift('[popup.js]');
            let time = new Date().toUTCString();
            log.push([level, time].concat(args));
            postMessage.apply(this, [
                { origin: 'null' },
                { type: tag, level: level, time: time, args: JSON.stringify(args) }
                //{ type: 'LOG', level: level, time: time, args: JSON.stringify(deepClone(args)) }
            ]);
            return method.apply(c, args);
        }
    }

    for (let level in orig) {
        c[level] = inject(orig[level], level);
    }
}

function deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) return obj; // primitives
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    var result = Array.isArray(obj) ? []
               : obj.constructor ? new obj.constructor() : Object.create(null);
    hash.set(obj, result);
    if (obj instanceof Map)
        Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)) );
    return Object.assign(result, ...Object.keys(obj).map (
        key => ({ [key]: deepClone(obj[key], hash) }) ));
}

export function snapshot(obj) {
    if(obj == null || typeof(obj) != 'object') {
        return obj;
    }

    var temp = new obj.constructor();

    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = snapshot(obj[key]);
        }
    }
    return temp;
}
