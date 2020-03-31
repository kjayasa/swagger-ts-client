import * as Swagger from "swagger-schema-official";
import {IProperty, IType, TypeBuilder} from "./typeBuilder";
import {type} from "os";

const swagger: Swagger.Spec  = {
    "swagger" : "2.0",
    "info" : {
        "version" : "1",
        "title": "rest-api"
    },
    "tags" : [
        {
            "name" : "sample"
        }
    ],
    "schemes" : [ "http", "https" ],
    "paths" : {
        "/dummy" : {
            "get" : {
                "tags" : [ "sample" ],
                "operationId" : "dummy",
                "produces" : [ "application/json" ],
                "responses" : {
                    "200" : {
                        "description" : "successful operation",
                        "schema" : {
                            "$ref" : "#/definitions/ParentObject"
                        }
                    }
                }
            }
        },
        "/inh" : {
            "get" : {
                "tags" : [ "inh" ],
                "operationId" : "blah",
                "produces" : [ "application/json" ],
                "responses" : {
                    "200" : {
                        "description" : "successful operation",
                        "schema" : {
                            "type" : "array",
                            "items" : {
                                "$ref" : "#/definitions/BaseDto"
                            }
                        }
                    }
                }
            },
            "post" : {
                "tags" : [ "inh" ],
                "operationId" : "blaze",
                "consumes" : [ "application/json" ],
                "produces" : [ "application/json" ],
                "parameters" : [ {
                    "in" : "body",
                    "name" : "body",
                    "required" : false,
                    "schema" : {
                        "$ref" : "#/definitions/BaseDto"
                    }
                } ],
                "responses" : {
                    "200" : {
                        "description" : "successful operation",
                        "schema" : {
                            "type" : "string"
                        }
                    }
                }
            }
        }
    },
    "definitions" : {
        "ParentObject" : {
            "type" : "object",
            "required" : [ "mandatoryObject", "arrayObject" ],
            "properties" : {
                "mandatoryObject" : {
                    "$ref" : "#/definitions/FullObject"
                },
                "arrayObject" : {
                    "type": "array",
                    "items" : {
                        "$ref" : "#/definitions/FullObject"
                    }
                }
            }
        },
        "FullObject" : {
            "type" : "object",
            "properties" : {
                "numberFloat": {
                    "type": "number",
                    "format": "float"
                },
                "numberDouble": {
                    "type": "number",
                    "format": "double"
                },
                "numberInt32": {
                    "type": "number",
                    "format": "int32"
                },
                "numberInt64": {
                    "type": "number",
                    "format": "int64"
                },
                "boolean": {
                    "type": "boolean"
                },
                "stringDate": {
                    "type": "string",
                    "format": "date"
                },
                "stringDateTime": {
                    "type": "string",
                    "format": "date-time"
                },
                "stringPassword": {
                    "type": "string",
                    "format": "password"
                },
                "stringByte": {
                    "type": "string",
                    "format": "byte"
                },
                "stringBinary": {
                    "type": "string",
                    "format": "binary"
                },
                "stringCustom": {
                    "type": "string",
                    "format": "custom"
                }
            }
        },
        "BaseDto" : {
            "type" : "object",
            "required" : [ "type" ],
            "discriminator" : "type",
            "properties" : {
                "type" : {
                    "type" : "string"
                },
                "prop" : {
                    "type" : "string"
                }
            }
        },
        "Sub1" : {
            "allOf" : [ {
                "$ref" : "#/definitions/BaseDto"
            }, {
                "type" : "object",
                "properties" : {
                    "sub1Prop" : {
                        "type" : "string"
                    }
                }
            } ]
        },
        "Sub2" : {
            "allOf" : [ {
                "$ref" : "#/definitions/BaseDto"
            }, {
                "type" : "object",
                "properties" : {
                    "sub2Prop" : {
                        "type" : "string"
                    }
                }
            } ]
        }
    }
};

const b = new TypeBuilder(swagger.definitions);

test("type builder should have all types", () => {
    expect(
        b.getAllTypes().map(t => t.swaggerTypeName)
    ).toStrictEqual(["ParentObject", "FullObject", "BaseDto", "Sub1", "Sub2"])

});

test("base class should have its own fields and discriminant", () => {
   const baseDto = b.findType("BaseDto");
   expect(baseDto).toBeDefined();
   const typeProp = b.findProp(baseDto, "type");
   expect(typeProp).toBeDefined();
   expect(typeProp.required).toBe("");
   expect(typeProp.typeName).toBe("string");
   const propProp = b.findProp(baseDto, "prop");
   expect(propProp).toBeDefined();
   expect(propProp.required).toBe("?");
   expect(propProp.typeName).toBe("string");
   expect(baseDto.properties.length).toBe(2);
   expect(baseDto.interfaces.length).toBe(0);
});

test("subclass should have its own props, and extend base class", () => {
    const sub1 = b.findType("Sub1");
    expect(sub1).toBeDefined();
    const sub1Prop = b.findProp(sub1, "sub1Prop");
    expect(sub1Prop).toBeDefined();
    expect(sub1Prop.required).toBe("?");
    expect(sub1Prop.typeName).toBe("string");
    expect(sub1.properties.length).toBe(1);
    expect(sub1.interfaces.length).toBe(1);
    expect(sub1.interfaces[0]).toBe("BaseDto");
});
