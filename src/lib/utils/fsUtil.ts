import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";

type Func = (...arg: any[]) => any;
type asyncFunc = (...args) => Promise<any>;
function wrap(func: Func): asyncFunc {
    return (...args) => {
        return new Promise((resolve, reject) => {

            func(...args, (err, ret) => {
                if (err){
                    reject(err);
                }else{
                    resolve(ret);
                }
            });
        });
    };
}

type asyncMkdirp = (path: fs.PathLike, mode?: number | string | undefined | null) => Promise<void>;
const mkdir: asyncMkdirp = wrap(mkdirp);
export type asyncreadFile = (path: fs.PathLike | number, options: { encoding?: null; flag?: string; } | string | undefined | null ) => Promise<string>;
export const readFile: asyncreadFile = wrap(fs.readFile);

export function createWriteStream(outPath: string, filename: string= "") {
    if (filename){
        outPath = path.join(outPath, filename);
    }
    return fs.createWriteStream(outPath);
}

export async function createIfnotExists(outPath: string){
    const parsed = path.parse(outPath);
    if (parsed.ext){
        outPath = parsed.dir;
    }
    if (!fs.existsSync(outPath)){
        await mkdir(outPath);
    }
}
