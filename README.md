# Introduction 
Swagger-ts-client is a tool that generate TypeScript types and  http client from Swagger ([open api](https://www.openapis.org/)). The code generation is highly configurable through a configuration file. Refer [Configuration section](#Configuration) for more details.

The generated code can completely controlled by using  [Handlebar](http://handlebarsjs.com/) templates.Refer template section for more section. The default template generates http clients based on the [SuperAgent](http://visionmedia.github.io/superagent/) library.

Swagger-ts-client can import swagger definition from multiple sources using provider plugins.The default provider imports JSON formated swagger definition file from the file system.There is also an Http provider built in, that can be configured to import swagger from a url.

## Some differences form other tools for the same purpose
* provides a lot of control in code generation.
* template based code generation. Does not tye the generated code into come specific http client library.
* full support for Generics. Infers generis from swagger types definition especially when  used with [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle), C# and .net.
* can be configured to generate Interface or Classes
* can import swagger definition from multiple sources using providers.Built in providers includes File system And Http providers.

# Getting Started
Swagger-ts-client is written in typescript nad runs on NodeJS and is packed with NPM . You need NodeJS installed to install and run Swagger-ts-client.
## Installing
swagger-ts-client and be installed globally locally as a dev dependency.

npm 
```
$ npm install swagger-ts-client --save-dev
```
## Generating Code
when run with out any arguments , swagger-ts-client looks for a config file named ts-client.config.js and loads configuration from it.

```
$ swagger-ts-client
```

A minimal all defaults no config file example.Loads swagger from ```swagger.json``` generates types to ```./generatedTypes/fooApiTypes.ts``` and generates Http Clients to ```./httpProxy/```
```
$ swagger-ts-client -s ./swagger.json -t ./generatedTypes/fooApiTypes.ts -o ./httpProxy/
```

All generated types are generated into a single file. Operations, default are grouped by tag(swagger spec) and for each group a class is generated and written into separate files.
# Configuration
swagger-ts-client looks for a config file named ```ts-client.config.js``` and loads settings from it. Some configuration can be overridden by comment line args.
## Configuration file
The configuration file needs to export a configuration object. The configuration object has the following schema.
```typescript
{
    swaggerFile?: string;
    swaggerProvider?: {
        provide:Function
    };
    type?: {
        typeAliases?: { 
            [index: string]:string
        };
        generatedTypes?: "type"|"interface"|"class";
        membersOptional?: boolean;
        templateFile?: string;
        outPutPath?: string;
        templateTag?: any;
    };
    operations?: {
        operationsGroupNameTransformFn?: Function;
        operationsNameTransformFn?: Function;
        ungroupedOperationsName?: string;
        templateFile?: string;
        outPutPath?: string;
        outFileNameTransformFn?: Function;
        templateTag?: any;
    };
}
``` 
For example; a simple config file.

```typescript
const settings ={
    swaggerFile:"../swagger.json",
    type:{
        outPutPath:"./src/models.ts"
    },
    operations:{       
        outPutPath:"./src/httpClient/"
    }
};
module.exports=settings;
```
### Configuration Options

* ```swaggerFile```

   The file to import Swagger definitions from. Expects to be JSON representation of swagger. YML is currently not supported.
* ```swaggerProvider```

   An instance of a swagger provider plugin to be used when swagger is not imported from file.

   Example
  ```typescript
    const settings ={ 
        swaggerProvider:new HttpSwaggerProvider("http://api.mysite.com/swagger","Username01","passw0rd")
    }

    module.exports=settings;
   ``` 
* ```type```

   All configuration for Type generation.
* ```type.typeAliases```

   A hash of strings aliases that provide alternative names for existing types.

   Example
  ```typescript
    const settings ={ 
        type:{
            typeAliases:{
                "Int32":"number"
            }
        }
    }

    module.exports=settings;
   ``` 
* ```type.generatedTypes```
   Instructs the generator to  generate either ```class``` or ```interface``` . values can be "class" or "interface". Default is "class"
* ```type.membersOptional```

   A flag if true generates all members of generated types are optional .Default is ```true```
* ```type.templateFile```

   Path to a Handlebar template file used to generate Types . Refer [Template](#Template) section
* ```type.outPutPath```

   Path to write the the generated types file to. If the directory does not exist, it will be created.
   Default is "./serverTypes/serverTypes.ts"
* ```type.templateTag```

   This can be any object and it will be made available in the template.
* ```operations```

   All configuration for Operations generation.
* ```operations.operationsGroupNameTransformFn```
* ```operations.operationsNameTransformFn```
* ```operations.ungroupedOperationsName```
* ```operations.templateFile```
* ```operations.outPutPath```
* ```operations.outFileNameTransformFn```
* ```operations.templateTag```

## CLI

# Template

# Providers

# Build 
Clone or download from git hub.
```
yarn
yarn build
```


