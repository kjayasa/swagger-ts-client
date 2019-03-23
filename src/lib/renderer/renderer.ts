import * as fs from "fs";
import * as handlebars from "handlebars";
import {ISettings} from "../settings";
import { readFile } from "../utils/fsUtil";
import {changeCaseHelper, filterListHelper, joinListHelper, someHelper} from "./helpers";

handlebars.registerHelper("joinList", joinListHelper);
handlebars.registerHelper("filterList", filterListHelper);
handlebars.registerHelper("some", someHelper);
handlebars.registerHelper("changeCase", changeCaseHelper);

export function registerHandleBarsHelpers(settings: ISettings){
    if (settings.templateHelpers){
        handlebars.registerHelper(settings.templateHelpers);
    }
}

export interface IRenderer{
    render(stream: fs.WriteStream, obj: any);
}

export abstract class AbstractRenderer<T> implements IRenderer {
    protected templatePath: string;
    private template: string;
    private compliedTemplate: HandlebarsTemplateDelegate<any>;
    constructor(options: {
        template?: string,
        templatePath?: string},
                renderHelpers?: Array<(arg: any[]) => string>){
            if (!options || !(options.template || options.templatePath )){
                throw new Error("Template or Template path is needed");
            }

            if (options.template){
                this.template = options.template;
            } else{
                this.templatePath = options.templatePath;
            }

    }

    public async render(stream: fs.WriteStream, obj: T) {
        if (!this.compliedTemplate){
             await this.compileTemplate();
        }
        try{
            const compiled = this.compliedTemplate(this.getRenderContext(obj));
            stream.write(compiled);
        }catch (e) {
            throw new Error(`Error compiling ${stream.path} : obj "${obj} \n ${e}`);
        }

    }

    protected abstract getRenderContext(obj: T): {};

    private async loadTemplate(): Promise<string>{
        return readFile(this.templatePath, "utf8") as Promise<string>;
    }

    private async compileTemplate(): Promise<HandlebarsTemplateDelegate<any>>{
        if (!this.template){
            try{
                this.template = await this.loadTemplate();
            }
            catch (error)
            {
                throw error;
            }

        }

        return new Promise<HandlebarsTemplateDelegate<any>>((resolve) => {
            this.compliedTemplate = handlebars.compile(this.template, {noEscape: true});
            resolve(this.compliedTemplate);
        });

    }
}
