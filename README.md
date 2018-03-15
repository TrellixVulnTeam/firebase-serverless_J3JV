# firebase-serverless

Serverless for web clients.

## Requirement

* [NodeJS]

## Installation

What tools need to install first.

### 1. Install the Firebase CLI

```
$ npm install -g firebase-tools
```

### 2. Initialize the Project

To log in to Firebase via the browser and authenticate the CLI tool.
```
$ firebase login
```

Go to /functions, and then execute the following command.
```
$ npm install
```

#### Optional
If you'd like to reconnect the dependencies.
```
$ firebase init functions
```

### 3. Deploy the Cloud Function

Let's deploy our Cloud Function. Run this command for deployment:
```
$ firebase deploy --only functions
```
