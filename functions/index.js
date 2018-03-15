// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const express = require('express');
// We use Request to make the basic authentication request in our example.
const basicAuthRequest = require('request');
const session = express();

// Init
admin.initializeApp(functions.config().firebase);

// build multiple CRUD interfaces:
// app.get('/:id', (req, res) => res.send(Widgets.getById(req.params.id)));
// app.post('/', (req, res) => res.send(Widgets.create()));
// app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)));
// app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)));
// app.get('/', (req, res) => res.send(Widgets.list()));

/**
 * Simple output as String
 */
exports.hello = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

/**
 * Simple output as html
 */
exports.bigben = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1; // london is UTC + 1hr;

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.set('Vary', 'Accept-Encoding, X-My-Custom-Header');
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${'BONG '.repeat(hours)}
    </body>
  </html>`);
});

/**
 * Simple output as object
 */
exports.login = functions.https.onRequest((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({
    "Success": true,
    "ErrorCode": null,
    "Message": {
      "access_token": "grg45h45h45h453432",
      "customerId": "todayisfriday999",
      "regId": "3434324",
      "token_type": 3,
      "refresh_token": "gr4y45654y45yt4ht",
      "expires_in": 3
    }
  }));
});

/**
 * Simple output as object
 */
exports.logout = functions.https.onRequest((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({
    "success": true,
    "errorCode": null,
    "message": "Nice shot!"
  }));
});

/**
 * Simple output as object
 */
exports.register = functions.https.onRequest((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({
    "success": true,
    "errorCode": null,
    "message": {
      "access_token": "grg45h45h45h453432",
      "customerId": "todayisfriday999",
      "regId": "3434324",
      "token_type": 3,
      "refresh_token": "gr4y45654y45yt4ht",
      "expires_in": 3
    }
  }));
});

/**
 * Simple output as object
 */
exports.demo1 = functions.https.onRequest((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({
    "Success": true,
    "ErrorCode": null,
    "Message": {
      "a": 1,
      "b": 2,
      "c": 3
    }
  }));
});

/**
 * Simple output as object
 */
exports.device = functions.https.onRequest((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({ a: 1 }));
});

session.get('/foo', (req, res) => {
    res.status(200).json('hello');
});

session.get('/bar', (req, res) => {
    res.status(200).json('world');
});

session.get('/78fbe0d2dc4fb5081323297ca6ea27dc34394f74', (req, res) => {
    res.status(200).send(JSON.stringify({
      "Success": true,
      "ErrorCode": null,
      "Message": {
        "access_token": "grg45h45h45h453432",
        "customerId": "todayisfriday999",
        "regId": "3434324",
        "token_type": 3,
        "refresh_token": "gr4y45654y45yt4ht",
        "expires_in": 3
      }
    }))
});

exports.session = functions.https.onRequest(session);

function handleGET (req, res) {
  // Do something with the GET request
  res.status(200).send('Hello World!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

exports.helloHttp = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGET(req, res);
      break;
    case 'PUT':
      handlePUT(req, res);
      break;
    default:
      res.status(500).send({ error: 'Something blew up!' });
      break;
  }
};

exports.helloContent = (req, res) => {
  let name;

  switch (req.get('content-type')) {
    // '{"name":"John"}'
    case 'application/json':
      name = req.body.name;
      break;

    // 'John', stored in a Buffer
    case 'application/octet-stream':
      name = req.body.toString(); // Convert buffer to a string
      break;

    // 'John'
    case 'text/plain':
      name = req.body;
      break;

    // 'name=John' in the body of a POST request (not the URL)
    case 'application/x-www-form-urlencoded':
      name = req.body.name;
      break;
  }

  res.status(200).send(`Hello ${name || 'World'}!`);
};

/**
 * Authenticate the provided credentials returning a Firebase custom auth token.
 * `username` and `password` values are expected in the body of the request.
 * If authentication fails return a 401 response.
 * If the request is badly formed return a 400 response.
 * If the request method is unsupported (not POST) return a 403 response.
 * If an error occurs log the details and return a 500 response.
 */
exports.auth = functions.https.onRequest((req, res) => {
  const handleError = (username, error) => {
    console.error({
      User: username,
    }, error);
    return res.sendStatus(500);
  };

  const handleResponse = (username, status, body) => {
    console.log({
      User: username,
    }, {
      Response: {
        Status: status,
        Body: body,
      },
    });
    if (body) {
      return res.status(200).json(body);
    }
    return res.sendStatus(status);
  };

  let username = '';
  try {
    cors(req, res, () => {
      // Authentication requests are POSTed, other requests are forbidden
      if (req.method !== 'POST') {
        return handleResponse(username, 403);
      }
      username = req.body.username;
      if (!username) {
        return handleResponse(username, 400);
      }
      const password = req.body.password;
      if (!password) {
        return handleResponse(username, 400);
      }

      // TODO(DEVELOPER): In production you'll need to update the `authenticate` function so that it authenticates with your own credentials system.
      return authenticate(username, password).then((valid) => {
        if (!valid) {
          return handleResponse(username, 401); // Invalid username/password
        }

        // On success return the Firebase Custom Auth Token.
        return admin.auth().createCustomToken(username);
      }).then((firebaseToken) => {
        return handleResponse(username, 200, {
          token: firebaseToken,
        });
      }).catch((error) => {
        return handleError(username, error);
      });
    });
  } catch (error) {
    return handleError(username, error);
  }
  return null;
});

/**
 * Authenticate the provided credentials.
 * TODO(DEVELOPER): In production you'll need to update this function so that it authenticates with your own credentials system.
 * @returns {Promise<boolean>} success or failure.
 */
function authenticate(username, password) {
  // For the purpose of this example use httpbin (https://httpbin.org) and send a basic authentication request.
  // (Only a password of `Testing123` will succeed)
  const authEndpoint = `https://httpbin.org/basic-auth/${username}/Testing123`;
  const creds = {
    auth: {
      user: username,
      pass: password,
    },
  };
  return new Promise((resolve, reject) => {
    basicAuthRequest(authEndpoint, creds, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      const statusCode = response ? response.statusCode : 0;
      if (statusCode === 401) { // Invalid username/password
        return resolve(false);
      }
      if (statusCode !== 200) {
        return reject(Error('invalid response returned from ', authEndpoint, ' status code ', statusCode));
      }
      return resolve(true);
    });
  });
}
