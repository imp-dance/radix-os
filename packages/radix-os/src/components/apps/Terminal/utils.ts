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

export function joinQuotedArgs(args: string[]) {
  const quote = ["'", '"', "`"];
  const nextArgs: string[] = [];
  let argBuilder: string | null = null;
  let startQuote: string | null = null;
  args.forEach((arg) => {
    const hasStartQuote = quote.some((quoteSymbol) =>
      arg.startsWith(quoteSymbol)
    );
    const hasEndQuote =
      startQuote !== null && arg.endsWith(startQuote!);
    if (hasStartQuote && argBuilder === null) {
      argBuilder = arg.slice(1);
      startQuote = quote.find((quoteSymbol) =>
        arg.startsWith(quoteSymbol)
      )!;
      if (argBuilder.endsWith(startQuote)) {
        // one word
        nextArgs.push(argBuilder.slice(0, -1));
        argBuilder = null;
        startQuote = null;
      }
    } else if (hasEndQuote && argBuilder !== null) {
      argBuilder += ` ${arg.slice(0, -1)}`;
      nextArgs.push(argBuilder);
      argBuilder = null;
      startQuote = null;
    } else if (argBuilder !== null) {
      argBuilder += ` ${arg}`;
    } else {
      nextArgs.push(arg);
    }
  });
  return nextArgs;
}

export function extractFlags(args: string[]) {
  const flagRecord: Record<string, string> = {};

  args.forEach((arg, index) => {
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      const value = args[index + 1];
      flagRecord[flag] = value;
    } else if (arg.startsWith("-")) {
      const flags = arg.slice(1);
      const value = args[index + 1];
      flagRecord[flags] = value;
    }
  });

  return flagRecord;
}
