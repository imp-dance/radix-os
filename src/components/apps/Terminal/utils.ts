export function quotableRestArgs(args: string[]) {
  let nextPath = args[0];
  if (nextPath.startsWith('"')) {
    nextPath = nextPath.substring(1);
    if (nextPath.endsWith('"')) {
      nextPath = nextPath.slice(0, -1);
    }
    for (let i = 1; i < args.length; i++) {
      if (args[i].endsWith('"')) {
        nextPath += " " + args[i].slice(0, -1);
        break;
      } else {
        nextPath += " " + args[i];
      }
    }
  }
  return nextPath;
}
