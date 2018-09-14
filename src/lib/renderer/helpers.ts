import * as changeCase from "change-case";
import * as os from "os";
import {
  lambdaParser,
} from "../parsers/parsers";

type PredicateFunc<T> = (value: any, index: number, array: any[]) => T;
const compiledCach: Map<string, PredicateFunc<any>> = new Map();

function complieFilterfn<T>(predicate: string): PredicateFunc<T> {
  if (predicate) {
    if (compiledCach.has(predicate)) {
      return compiledCach.get(predicate);
    } else {
      const parseResult = lambdaParser.parse(predicate);
      if (parseResult && parseResult.arguments && parseResult.body) {
        const args = [...parseResult.arguments, `return (${parseResult.body})`];
        return new Function(...args) as PredicateFunc<T>;
      }
    }
    return null;
  }
}

export function filterListHelper(...args): string {

  let context: any[] = args.shift(),
    options = args.pop(),
    filter = args.shift(),
    take = args.shift() || -1;

  if (context && context instanceof Array && filter) {
    /* tslint:disable:triple-equals */
    if (take == -1) // using == beacuse take can be string
    {
      take = context.length;
    }
    /* tslint:enable:triple-equals */
    if (filter) {
      const fliterFn = complieFilterfn<boolean>(filter);
      if (fliterFn) {
        let ret = "";
        for (let i = 0; i < take; i++) {
          if (fliterFn(context[i], i, context)) {
            ret = ret + options.fn(context[i]);
          }
        }
        return ret;
      } else {
        throw new Error(`${filter} is not valid filter expression`);
      }

    } else {
      throw new Error("parameter 'filter' in  #filterListHelper is not optional");
    }

  } else {
    return "";
  }
}

export function someHelper(...args): string {

  const context: any[] = args.shift(),
    options = args.pop(),
    filter = args.shift();

  if (context && context instanceof Array && filter) {
    if (filter) {
      const fliterFn = complieFilterfn<boolean>(filter);
      if (fliterFn) {
        if (context.some(fliterFn)) {
          return options.fn(context);
        } else {
          return "";
        }

      } else {
        throw new Error(`${filter} is not valid filter expression`);
      }
    } else {
      throw new Error("parameter 'filter' in  #someHelper is not optional");
    }
  } else {
    return "";
  }
}

export function joinListHelper(...args): string {

  const context: any[] = args.shift();
  const options = args.pop();
  if (context && context instanceof Array) {
    let [seperator, filter] = [...args];
    seperator = seperator ? seperator.replace(/\\n/g, os.EOL) : ", ";

    let filteredArray = context;

    if (filter) {
      const fliterFn = complieFilterfn<boolean>(filter);
      if (fliterFn) {
        filteredArray = context.filter(fliterFn);
      } else {
        throw new Error(`${fliterFn} is not valid filter expressaion`);
      }
    }
    return filteredArray.map((c) => options.fn(c)).join(seperator);
  } else {
    return "";
  }
}

export function changeCaseHelper(context: any, toCase: string, options: any): string {
  if (context && typeof (context) === "string" && toCase && changeCase[toCase] && changeCase[toCase] instanceof Function) {
    return changeCase[toCase](context);
  } else {
    return "";
  }
}
