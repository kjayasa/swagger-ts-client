import * as Swagger from "swagger-schema-official";
import {TypeBuilder} from "../type/typeBuilder";
import {TypesDefinitionRender} from "./typesDefinitionRender";

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
            get : {
                tags : [ "sample" ],
                operationId : "dummy",
                produces : [ "application/json" ],
                responses : {
                    200 : {
                        description : "successful operation",
                        schema : {
                            $ref : "#/definitions/ParentObject",
                        },
                    },
                },
            },
        },
        "/inh" : {
            get : {
                tags : [ "inh" ],
                operationId : "blah",
                produces : [ "application/json" ],
                responses : {
                    200 : {
                        description : "successful operation",
                        schema : {
                            type : "array",
                            items : {
                                $ref : "#/definitions/BaseDto",
                            },
                        },
                    },
                },
            },
            post : {
                tags : [ "inh" ],
                operationId : "blaze",
                consumes : [ "application/json" ],
                produces : [ "application/json" ],
                parameters : [ {
                    in : "body",
                    name : "body",
                    required : false,
                    schema : {
                        $ref : "#/definitions/BaseDto",
                    },
                } ],
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
        ParentObject : {
            type : "object",
            required : [ "mandatoryObject", "arrayObject" ],
            properties : {
                mandatoryObject : {
                    $ref : "#/definitions/FullObject",
                },
                arrayObject : {
                    type: "array",
                    items : {
                        $ref : "#/definitions/FullObject",
                    },
                },
            },
        },
        FullObject : {
            type : "object",
            properties : {
                numberFloat: {
                    type: "number",
                    format: "float",
                },
                numberDouble: {
                    type: "number",
                    format: "double",
                },
                numberInt32: {
                    type: "number",
                    format: "int32",
                },
                numberInt64: {
                    type: "number",
                    format: "int64",
                },
                boolean: {
                    type: "boolean",
                },
                stringDate: {
                    type: "string",
                    format: "date",
                },
                stringDateTime: {
                    type: "string",
                    format: "date-time",
                },
                stringPassword: {
                    type: "string",
                    format: "password",
                },
                stringByte: {
                    type: "string",
                    format: "byte",
                },
                stringBinary: {
                    type: "string",
                    format: "binary",
                },
                stringCustom: {
                    type: "string",
                    format: "custom",
                },
            },
        },
        BaseDto : {
            type : "object",
            required : [ "type" ],
            discriminator : "type",
            properties : {
                type : {
                    type : "string",
                },
                prop : {
                    type : "string",
                },
            },
        },
        Sub1 : {
            allOf : [ {
                $ref : "#/definitions/BaseDto",
            },
                      {
                type : "object",
                properties : {
                    sub1Prop : {
                        type : "string",
                    },
                },
            } ],
        },
        Sub2 : {
            allOf : [ {
                $ref : "#/definitions/BaseDto",
            },
                      {
                type : "object",
                properties : {
                    sub2Prop : {
                        type : "string",
                    },
                },
            } ],
        },
    },
};

const b = new TypeBuilder(swagger.definitions);

function expectType(done, name: string, expectedCode: string) {
    const r = new TypesDefinitionRender();
    const t = b.findType(name);
    expect(t).toBeDefined();
    try {
        r.render(
            (s) => {
                expect(s).toBe(expectedCode);
                done();
            },
            [t],
        );
    } catch (e) {
        done(e);
    }
}

test("BaseDto", (done) =>
    expectType(done, "BaseDto", `/*****************************AutoGenerated Code : Do not edit *******************************/
// Type generated from Swagger definition


    export interface BaseDto  {
        type? : string
        prop? : string
    }
`));

test("Sub1", (done) =>
    expectType(done, "Sub1", `/*****************************AutoGenerated Code : Do not edit *******************************/
// Type generated from Swagger definition


    export interface Sub1 extends BaseDto {
        sub1Prop? : string
    }
`));
