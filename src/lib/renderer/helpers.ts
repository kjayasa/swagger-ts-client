import * as changeCase from "change-case";
import * as handlebars from "handlebars";
import * as os from "os";
import {
  lambdaParser,
} from "../parsers/parsers";

type PredicateFunc < T > = (value: any, index: number, array: any[]) => T;
const compiledCach: Map < string, PredicateFunc < any >> = new Map();

function complieFilterfn < T >(predicate: string): PredicateFunc < T > {
  if (predicate) {
    if (compiledCach.has(predicate)) {
      return compiledCach.get(predicate);
    } else {
      const parseResult = lambdaParser.parse(predicate);
      if (parseResult && parseResult.arguments && parseResult.body) {
        const args = [...parseResult.arguments, `return (${parseResult.body})`];
        return new Function(...args) as PredicateFunc < T > ;
      }
    }
    return null;
  }
}

export function filterListHelper(...args): string {

  let context: any[] = args.shift(),
    options = args.pop(),
    fliter = args.shift(),
    take = args.shift() || -1;

  if (context && context instanceof Array && fliter) {
    /* tslint:disable:triple-equals */
    if (take == -1) // using == beacuse take can be string
    {
      take = context.length;
    }
    /* tslint:enable:triple-equals */
    if (fliter) {
      const fliterFn = complieFilterfn < boolean > (fliter);
      if (fliterFn) {
        let ret = "";
        for (let i = 0; i < take; i++) {
          if (fliterFn(context[i], i, context)) {
            ret = ret + options.fn(context[i]);
          }
        }
        return ret;
      } else {
        throw new Error(`${fliter} is not valid filter expressaion`);
      }

    } else {
      throw new Error("parameter 'filter' in  #filterList Helper is not optional");
    }

  } else {
    return "";
  }
}

export function someHelper(...args): string {

  const context: any[] = args.shift(),
    options = args.pop(),
    fliter = args.shift();

  if (context && context instanceof Array && fliter) {
    if (fliter) {
      const fliterFn = complieFilterfn < boolean > (fliter);
      if (fliterFn) {
        if (context.some(fliterFn)){
          return  options.fn(context);
        }else{
          return "";
        }

      } else {
        throw new Error(`${fliter} is not valid filter expressaion`);
      }
    } else {
      throw new Error("parameter 'filter' in  #sum Helper is not optional");
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
    seperator = seperator ? seperator.replace(/\\n/g, os.EOL) : ",";

    let filteredArray = context;

    if (filter) {
      const fliterFn = complieFilterfn < boolean > (filter);
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

export function changeCaseHelper(context: any, toCase: string, options: any): string{
  if (context && typeof(context) === "string" && toCase && changeCase[toCase] && changeCase[toCase] instanceof Function){
    return changeCase[toCase](context);
  }else{
    return "";
  }
}
