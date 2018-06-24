import * as Swagger from "swagger-schema-official";
import { ILogger } from "../logger";
import { ISettings, settings } from "../settings";
import { FsSwaggerProvider } from "./fsSwaggerProvider";

export interface ISwaggerProvider {
    provide: (settings: ISettings, logger: ILogger) => Promise<Swagger.Spec>;
}

export function getProvider(): ISwaggerProvider {
    if (settings.swaggerProvider && settings.swaggerProvider.provide) {
        return settings.swaggerProvider;
    } else if (settings.swaggerFile) {
        return new FsSwaggerProvider();
    } else {
        throw new Error("Provide a swagger definition source.");
    }
}
