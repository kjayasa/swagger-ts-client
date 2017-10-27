# Introduction 
Swagger-ts-client is a tool that generate TypeScript types and  http client from Swagger ([open api](https://www.openapis.org/)). The code generation using [Handlebar](http://handlebarsjs.com/) templates.

The default template generates http clients based on the [SuperAgent](http://visionmedia.github.io/superagent/) library.

# Getting Started
npm 
```
$ npm install swagger-ts-client --save-dev
```
yarn 
```
$ yarn add swagger-ts-client --dev
```
# Configuration
when run with out any arguments , swagger-ts-client looks for a config file named ```ts-client.config.js``` and loads settings from it.

# Build 
Clone or download from git hub.
```
yarn
yarn build
```


