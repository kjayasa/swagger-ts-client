export type IParseFunction = (input: any, options: any) => any;
export class ParserWrapper<T>{
    constructor(private parseFn: IParseFunction){

    }
    public parse(input: string, options: {} | undefined = undefined): T{// the generated parser checks for undefined
        return this.parseFn(input, options) as T;
    }
}
