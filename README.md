#  This is a demo Microservice

This is fully runnable demo microservice for use to see how it can be integrated
into your current automation test strategy.

## Installing and Starting
The microservice has been built in NodeJs and uses NPM.

To use please make sure you have the latest version of nodeJs installed
* just google nodejs install

Once cloned then run the below command inside the repo
`
npm install
`

To start the service run this command
`
node server/server.js
`

### Installing MongoDB
This microservice needs mongoDb to be running locally on the server on port 27017 (default mongo port)
Please install mongo using their instructions and run it and leave it running
* Should only take a few minutes
Once running use RoboMongo or a similar tool to create a database called 'data-pools' once created the microservice will connect and work with it

## Demonstrated Features
The microservice has been built with a couple pretend API endpoints for creating "users" and "widgets" these are to demonstrate the ability to abstract complex calls

### Test Data Staging
To demonstrate the test data staging you need to have mongo running with a data-pools data base created inside (see above instructions)

You can use a tool like RoboMongo to inspect the data pools while running staging commands

### Connection to external databases
The microservice is built with support to interact with Oracle, MySql databases.  Inside are config files pointed to nothing, if you wish to connect to a DB please update the config file with your parameters

### UI Test Execution for Data Staging
The microservice is built to execute a NightWatch UI test for demonstration purposes.  IT is likely you are not using the same NW framework however.  So if you wish to wire it up to your framework follow the below instructions

* Copy your UI framework (in whatever language) into the uiFramework directory
* Modify the executeNwTest endpoint (in server/routes/index.js) to instead run a command for your test
* Update any UI script you plan on running to create data to call back into the server with a POST to /pool/:poolName/storeFromUi
