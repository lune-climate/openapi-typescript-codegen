# Developer documentation

This document is for the developers of this project, not for the users.

## Common commands

Install the dependencies:

```
npm install
```

Build the project (doesn't run the tests):

```
npm run build
```

Run the tests (we have to build in order for the current code to be used):

```
npm run build && npm run test
```

Update the test snapshots (we have to build in order for the current code to be used):

```
npm run build && npm run test -- -u
```
