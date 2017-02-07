# floats.superserious.co

This is the floats api.

## Requirements

    $ brew install node

## Installation

    $ npm install

## Running
    # run normally
    $ npm start

    # run in panic mode
    $ PANIC_MODE=1 npm start

    # run in production mode
    $ NODE_ENV=production npm start

## Testing

In-memory (fast)

    $ npm test

Against live db (slow)

    $ docker run -p 8000:8000 deangiberson/aws-dynamodb-local
    $ npm run createTables
    $ npm run livetest
