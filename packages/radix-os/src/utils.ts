// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this,
      // eslint-disable-next-line prefer-rest-params
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
