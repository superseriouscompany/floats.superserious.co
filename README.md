# floats.superserious.co

This is the floats api.

## Requirements

1. node
1. docker

## Installation

    $ npm install

## Running
    # run normally
    $ npm run dev

    # run in panic mode
    $ PANIC_MODE=1 npm start

    # run in production mode
    $ NODE_ENV=production npm start

    # run for android (conflict with docker hypervisor)
    $ TEST_MODE=1 node index.js

## Testing

In-memory (fast)

    $ npm test

Against live db (slow)

    $ npm run livetest

## Adding a new dynamodb table, e.g. `poops`

1. Add schema to `schemas/poops.js` (see others for examples)
1. Add key to `schemas/schema.js`
1. Add table names to `config/index.js` and `config/production.js`
1. Run `npm run createTables`
