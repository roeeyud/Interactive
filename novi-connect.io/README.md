# NoviConnect.io - Guide

## Overview

This library will provide a two-way connection between Novisign screens and users.
This library also provides configuration that is needed to run the app, according to the app's options and user-options.

## Usage - Screen

* **Add novi-connect.io.js to html**

           <script src="/novi-connect.io/novi-connect.io.js"></script>

* **Open connection**

    Open a new app session on the server and get ready to accept connections from users.

            // Create new instance of NoviConnect connection
            var connect = new NoviConnect();
            // Set connection as screen connection
            connect.startScreen();

* **Wait for connection and configuration ot load**

            connect.onReady(function () {
                // Connection established and configuration is ready.
            })

* **Events**

    NoviConnect object users an event emitter. To add event handlers simply use 'on' method

            // Listen to 'example-event'
            connect.on('example-event', function (data) {
                // Do something
            });

    *NoviConnect fires several events only to keep screen updated with the status of it's users and if connection has disconnected*

    - **userStatus**: contains one argument, representing the users status, will be sent when user connects and disconnects. 
    
    Event will be emitted with the following object:

            {
                userId: // ID of controller,
                online: // true if
                extraInfo: // Extra info user app can add to connection
            }


    - **allUserStatus**: contains one argument, representing all users status, will be sent when screen connects to server.
    Message will contain an Array, each element will represent the status of a user.

    - **disconnect**: Emitted when connection between screen and server has been disconnected

* **Send messages**

    Sending data to user has a few limitations:
    - data sent most be object.
    - data keys (userId) will be overwritten
    - event names: 'message' cannot be used.

    * **Send message to all users and slave screens**

            var data = {};
            connect.send('event-name', data);   // Send with less than three arguments will be sent to all users and screens on the same connection


    * **Send message to specific user**

            var data = {};
            connect.send('event-name', data, userId);   // Send with three arguments will send message only to userId


## Usage - User

* **Add novi-connect.io.js to html**

           <script src="/novi-connect.io/novi-connect.io.js"></script>

* **Open connection**

    Connect to screen

            // Create new instance of NoviConnect connection
            var connect = new NoviConnect();
            // Connect as user
            connect.connectUser({/*extra-info*/});  // Extra data will be sent to screen via userStatus and allUserStatus messages.

* **Wait for connection and configuration to load, connection to screen hasn't been established yet.**

            connect.onReady(function () {
                // Connection established and configuration is ready.
            });


* **Events**

    NoviConnect object users an event emitter. To add event handlers simply use 'on' method

            // Listen to 'example-event'
            connect.on('example-event', function (data) {
                // Do something
            });
* **Send messages**

    Sending data to user has a few limitations:
    - data sent most be object.
    - data keys (userId) will be overwritten
    - event names: 'message' cannot be used.

    * **Send message to screen**

            var data = {};
            connect.send('event-name', data);
            
            
## Example

### Screen

```javascript

// Create new instance of NoviConnect connection
var connect = new NoviConnect();
// Set connection as screen connection
connect.startScreen();

connect.onReady(function () {
	// connection to server established.
    connect.on('hello-screen', function (msg) {
    	// Send message back to the same user that sent hello-screen message with the same data he sent the screen.
    	connect.send('hello-user', 'Your message was: ' + msg.data, msg.userId);
    })
    
    connect.send('screen-is-ready', 'Hi user !');	// send to all connected users.
    
    connect.send('userStatus', function (userStatus) {
    	if  (userStatus.online) {
        	// Send screen is ready to new user
            connect.send('screen-is-ready', 'Hi user !', userStatus.userId);	
        }
    })
});
```

### User

```javascript

// Create new instance of NoviConnect connection
var connect = new NoviConnect();
// Set connection as screen connection
connect.connectUser();

connect.onReady(function () {
	// connection to server established.
    connect.on('hello-user', function (msg) {
    	// Display message from screen
    	alert(msg.data);
    });
    
    connect.on('screen-is-ready', function (msg) {
    	// Display msg from screen
        alert(msg.data);
    }):
    
    connect.send('hello-screen', 'Hi screen !');
});
```
