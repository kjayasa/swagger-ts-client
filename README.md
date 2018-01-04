# swagger-ts-client [![Build Status](https://travis-ci.org/kjayasa/swagger-ts-client.svg?branch=master)](https://travis-ci.org/kjayasa/swagger-ts-client)

Swagger-ts-client is a tool that generate TypeScript types and  http client from Swagger ([open api](https://www.openapis.org/)). The code generation is highly configurable through a configuration file. Refer [Configuration section](#Configuration) for more details.

The generated code can completely controlled by using  [Handlebar](http://handlebarsjs.com/) templates.Refer template section for more section. The default template generates http clients based on the [SuperAgent](http://visionmedia.github.io/superagent/) library.

Swagger-ts-client can import swagger definition from multiple sources using provider plugins.The default provider imports JSON formated swagger definition file from the file system.There is also an Http provider built in, that can be configured to import swagger from a url.

## Some differences form other tools for the same purpose
* provides a lot of control in code generation.
* template based code generation. Does not tye the generated code into come specific http client library.
* full support for Generics. Infers generis from swagger types definition especially when  used with [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle), C# and .net.
* can be configured to generate Interface or Classes
* can import swagger definition from multiple sources using providers.Built in providers includes File system And Http providers.
# Whats new
+ Added option to register custom HandleBars helpers vis settings.  
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
    templateHelpers?:{
        [index: string]:IHandleBarHelper
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
* ```templateHelpers```

   A hash of functions with that are registered with the handlebar runtime as [handlebar helper](http://handlebarsjs.com/reference.html).

   Example
  ```typescript
    templateHelpers : {
        toUpper: function(context,...options) {
            if (context && typeof(context) === "string"){
                return context.toUpperCase();
            }
            else{
                 return ""
            }
           
        },
        toLower: function(context,...options) {
            if (context && typeof(context) === "string"){
                return context.toLowerCase();
            }
            else{
                 return ""
            }
           
        }
    }
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
   A Function when called with an operation schema, should return name of the group group that the operation should belong to. This name will be used as name of the generated class in which the the operation would me a method.

   default is concatenation of Tag and "HttpSvc".

   The signature of the function is as follows.
   ```typescript
   (operationName: string, httpVerb: HttpVerb , operation: Swagger.Operation) => string;
   ```
   ```HttpVerb``` can be any of the following ```"get"|"put"|"post"|"delete"|" options"|"head"|" patch"```

* ```operations.operationsNameTransformFn```
   
   A Function when called with an operation schema, should return name of the operation should belong to. This name will be used as name of the method which would perform the http operation.
      
    Default is , if the schema has tag and that tag is present in the operation ID , it will be replaced with the verb. Example
    

   The signature of the function is as follows.
   ```typescript
   (operationName: string, httpVerb: HttpVerb , operation: Swagger.Operation) => string;
   ```
   ```HttpVerb``` can be any of the following ```"get"|"put"|"post"|"delete"|" options"|"head"|" patch"```
* ```operations.ungroupedOperationsName```
    
  A string that will ne sued as the name of all un named operations
* ```operations.templateFile```

   Path to  [Handlebar](http://handlebarsjs.com/) template to be used for code generation. The default template generates Classes for each operation group using [Superagent](http://visionmedia.github.io/superagent/).
* ```operations.outPutPath```

   Path to write the the generated types file to. If the directory does not exist, it will be created. A file will be created for each operation group. Default is "./serverTypes/httpClients/
* ```operations.outFileNameTransformFn```

   A Function when called with an operation group, should return name of file to which the operation group would be written into
   
   Default is a function that returns ```operationGroup.ts```

## CLI
Executing swagger-ts-client with out any options, it tries to load settings from ```./ts-client.config.js. ``` and generate code.

The recommended way of using swagger-ts-client is by putting all the configuration in the config file, but some options are provided which will the configuration settings from the config file. Using these options it might be possible to run swagger-ts-client with out a config file.

There are some options that can be used to change 

| Option|                                               	| Explanation                            	|
|----	|--------------------------------------------------	|------------------------------------------	|
| -V 	| --version                                        	| output the version number                	|
| -c 	| --config ./path/to/config.file.js               	| use the configuration file from the path 	|
| -s 	| --swaggerFile ./path/to/swagger.doc.json        	| use swagger definition from the path     	|
| -t 	| --typesOut ./path/to/generate/types.ts>          	| generate output types at the location    	|
| -u 	| --url http://url.to.swaggerDef/swagger/v1/docs	| use url as swagger source                	|
| -o 	| --operationsOut ./path/to/generate/operations/   	| generate operations at the location      	|
| -h 	| --help                                           	| output usage information                 	|


# Template

# Providers

# Build 
Clone or download from git hub.
```
yarn
yarn build
```


