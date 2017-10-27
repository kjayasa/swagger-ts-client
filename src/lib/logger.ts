export interface ILogger{
    info(message:string);
    error(error:Error);
}

class Logger implements ILogger{
     info(message:string){
        console.info(message);
    }
     error(error:Error){
        console.error("\x1b[31m%s\x1b[0m",error.message);
        console.error("\x1b[2m\x1b[31m%s\x1b[0m",error.stack);
    }
}

export const logger:ILogger = new Logger();