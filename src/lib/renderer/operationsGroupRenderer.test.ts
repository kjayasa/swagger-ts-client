import * as Swagger from "swagger-schema-official";
import {OperationsBuilder} from "../operation/operationsBuilder";
import {TypeBuilder} from "../type/typeBuilder";

const swagger: Swagger.Spec  = {
    swagger : "2.0",
    info : {
        version : "1",
        title: "rest-api",
    },
    tags : [
        {
            name : "sample",
        },
    ],
    schemes : [ "http", "https" ],
    paths : {
        "/dummy" : {
            post : {
                tags : [ "inh" ],
                operationId : "blaze",
                consumes : [ "application/json" ],
                produces : [ "application/json" ],
                parameters : [
                    {
                        in : "body",
                        name : "body",
                        required : false,
                        schema : {
                            $ref : "#/definitions/Foo",
                        },
                    },
                    {
                        name : "filter",
                        in : "path",
                        required : false,
                        type : "string",
                    },
                    {
                        name : "sort",
                        in : "path",
                        required : true,
                        type : "string",
                    },
                ],
                responses : {
                    200 : {
                        description : "successful operation",
                        schema : {
                            type : "string",
                        },
                    },
                },
            },
        },
    },
    definitions : {
        Foo : {
            type : "object",
            properties : {
                bar: {
                    type: "number",
                    format: "float",
                },
            },
        },
    },
};

test("opGeneration", () => {
    const typeBuilder = new TypeBuilder(swagger.definitions);
    const operationsBuilder = new OperationsBuilder(swagger.paths, typeBuilder);
    const t = operationsBuilder.getAllGroups();

    expect(t).toBeDefined();
    const ops = t[0].operations[0].operationParams;
    expect(ops).toBeDefined();
    expect(ops.length).toEqual(3);
    expect(ops[0].paramName).toEqual("body");
    expect(ops[0].isRequired).toBeFalsy();
    expect(ops[1].paramName).toEqual("filter");
    expect(ops[1].isRequired).toBeFalsy();
    expect(ops[2].paramName).toEqual("sort");
    expect(ops[2].isRequired).toBeTruthy();
});
