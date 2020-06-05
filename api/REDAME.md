API
====
Scalable API endpoint to schedule messages for a given time and message consumer with Redis backend.
API is written in NodeJS and was tested on NodeJS v14.
Default configuration files preserved for fast launch.

# Server App

## Docs

Koa v2 [docs](https://koajs.com/)

Koa-router v2 [docs](https://github.com/koajs/router/blob/master/API.md)

Testing with Jest [docs](https://jestjs.io/docs/en/testing-frameworks)

## Structure

General Project Structure:

/config - configuration files

/controllers - responsible for routes processing

/helpers - general functionality, single-file in most

/helpers/storage - complex tasks for save/retrieve from the database

/libs - reusable pieces, that haven't been recognized as services or helpers 

/routes - handle request routing, access checks, forwarding to a controller

/services - 3rd party services integration and code which to be excluded in automated tests

/tests - automated tests

/tests/setup - configure tests

/app.js - application itself, entrypoint for server and tests requests

/server.js - runs application, starts a server on allocated port, starts a message consumer

## Run

```bach
cd app
npm i
npm start
```

### Test requests
```bash
curl -H "Content-type: application/json" -d "{\"time\": \"`node -e 'console.log(Date.now())'`\", \"message\": \"`date`\"}" http://localhost:4000/echoAtTime
# add +5 sec delay
curl -H "Content-type: application/json" -d "{\"time\": \"`node -e 'console.log(Date.now()+5000)'`\", \"message\": \"`date`\"}" http://localhost:4000/echoAtTime
# round to a 2 sec to append message to a list (run it fast one after another). delay 10 sec
curl -H "Content-type: application/json" -d "{\"time\": \"`node -e 'console.log(2000*Math.round((Date.now()/2000))+10000)'`\", \"message\": \"`date`\"}" http://localhost:4000/echoAtTime
```

### Test race conditions

Run 1 service on port 4000 with `npm start`, update port in `server.js` to 4001 and start next service with `npm start`.
Use commands above to submit data to either 4000 or 4001 port. Only one of the services will consume messages.

## Testing
Tests are using "database 15" by default. This is configurable in app configs.

Run tests (silent mode)
```bash
npm test
```

Development mode (displays all re-throwed errors)
```bash
npx jest
```

## Debugging

- Open "chrome://inspect/" in Chrome Browser.
- Add a breakpoint "debugger;"
- Run NodeJS in inspect mode "node --inspect=0.0.0.0:9229 server.js"
- Run testing files in inspect mode "node --inspect=0.0.0.0:9229 node_modules/.bin/jest --runInBand tests/profile-details.test.js"

Note, that --inspect=0.0.0.0:9229 bind debugger process to 0.0.0.0 so that it works in both container and host.
