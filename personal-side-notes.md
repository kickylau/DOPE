# Authenticate Me - Backend

In this multi-part project, you will learn how to put together an entire
Express + React application with authentication.

## Phase 0: Backend Set Up

First, you need to setup the backend of your application. This includes
installing dependencies, setting up Sequelize, initializing your Express
application, connecting Express security middlewares, and testing your server
setup.

### Backend and Frontend Separation

In this project, you will separate the backend Express code from the frontend
React code.

Create a folder called `authenticate-me`. Inside that folder, create two more
folders called `backend` and `frontend`.

Your file structure should look like this:

```plaintext
authenticate-me
├── backend
└── frontend
```

### `.gitignore`

Create a `.gitignore` file at the root of the project with the following
contents:

```plaintext
node_modules
.env
build
.DS_Store
```

### Dependencies

In the `backend` folder, initialize the server's `package.json` by running
`npm init -y`.

`npm install` the following packages as dependencies:

- `bcryptjs` - password hashing
- `cookie-parser` - parsing cookies from requests
- `cors` - CORS
- `csurf` - CSRF protection
- `dotenv` - load environment variables into Node.js from a `.env` file
- `express` - Express
- `express-async-handler` - handling `async` route handlers
- `express-validator` - validation of request bodies
- `helmet` - security middleware
- `jsonwebtoken` - JWT
- `morgan` - logging information about server requests/responses
- `per-env` - use environment variables for starting app differently
- `pg@">=8.4.1"` - PostgresQL greater or equal to version 8.4.1
- `sequelize@5` - Sequelize
- `sequelize-cli@5` - use `sequelize` in the command line

`npm install -D` the following packages as dev-dependencies:

- `dotenv-cli` - use `dotenv` in the command line
- `nodemon` - hot reload server `backend` files

### Configuration

In the `backend` folder, create a `.env` file that will be used to define your
environment variables.

Populate the `.env` file based on the example below:

```plaintext
PORT=5000
DB_USERNAME=auth_app
DB_PASSWORD=«auth_app user password»
DB_DATABASE=auth_db
DB_HOST=localhost
JWT_SECRET=«generate_strong_secret_here»
JWT_EXPIRES_IN=604800
```

Assign `PORT` to `5000`, add a user password and a strong JWT secret.

> Recommendation to generate a strong secret: create a random string using
> `openssl` (a library that should already be installed in your Ubuntu/MacOS
> shell). Run `openssl rand -base64 10` to generate a random JWT secret.

Next, you will create a `js` configuration file that will read the environment
variables loaded and export them.

Add a folder called `config` in your `backend` folder. Inside of the folder,
create an `index.js` file with the following contents:

```js
// backend/config/index.js
module.exports = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST
  },
  jwtConfig: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  }
};
```

Each environment variable will be read and exported as a key from this file.

### Sequelize Setup

You will set up Sequelize to look in the `backend/config/database.js` file for
its database configurations. You will also set up the `backend/db` folder to
contain all the files for models, seeders, and migrations.

To do this, create a `.sequelizerc` file in the `backend` folder with the
following contents:

```js
// backend/.sequelizerc
const path = require('path');

module.exports = {
  config: path.resolve('config', 'database.js'),
  'models-path': path.resolve('db', 'models'),
  'seeders-path': path.resolve('db', 'seeders'),
  'migrations-path': path.resolve('db', 'migrations')
};
```

Initialize Sequelize to the `db` folder by running:

```bash
npx sequelize init
```

Replace the contents of the newly created `backend/config/database.js` file with
the following:

```js
// backend/config/database.js
const config = require('./index');

const db = config.db;
const username = db.username;
const password = db.password;
const database = db.database;
const host = db.host;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'postgres',
    seederStorage: 'sequelize'
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
```

This will allow you to load the database configuration environment variables
from the `.env` file into the `config/index.js`.

Notice how the `production` database configuration has different keys than the
`development` configuration? When you deploy your application to production,
your database will be read from a URL path instead of a username, password, and
database name combination.

Next, create a user using the same credentials in the `.env` file with the
ability to create databases.

```bash
psql -c "CREATE USER <username> PASSWORD '<password>' CREATEDB"
```

Finally, create the database using `sequelize-cli`.

```bash
npx dotenv sequelize db:create
```

Remember, any `sequelize db:` commands need to be prefixed with `dotenv` to load
the database configuration environment variables from the `.env` file.

### Express Setup

After you setup Sequelize, it's time to start working on getting your Express
application set up.

#### `app.js`

Create a file called `app.js` in the `backend` folder. Here you will initialize
your Express application.

At the top of the file, import the following packages:

```js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
```

Create a variable called `isProduction` that will be `true` if the environment
is in production or not by checking the `environment` key in the configuration
file (`backend/config/index.js`):

```js
const { environment } = require('./config');
const isProduction = environment === 'production';
```

Initialize the Express application:

```js
const app = express();
```

Connect the `morgan` middleware for logging information about requests and
responses:

```js
app.use(morgan('dev'));
```

Add the `cookie-parser` middleware for parsing cookies and the `express.json`
middleware for parsing JSON bodies of requests with `Content-Type` of
`"application/json"`.

```js
app.use(cookieParser());
app.use(express.json());
```

Add several security middlewares:

1. Only allow CORS (Cross-Origin Resource Sharing) in development using the
`cors` middleware because the React frontend will be served from a different
server than the Express server. CORS isn't needed in production since all of our
React and Express resources will come from the same origin.
2. Enable better overall security with the `helmet` middleware (for more on what
`helmet` is doing, see [helmet on the `npm` registry]). React is generally safe
at mitigating XSS (i.e., [Cross-Site Scripting]) attacks, but do be sure to
research how to protect your users from such attacks in React when deploying a
large production application. Now add the `crossOriginResourcePolicy` to the
`helmet` middleware with a `policy` of `cross-origin`. This will allow images
with URLs to render in deployment.
3. Add the `csurf` middleware and configure it to use cookies.

```js
// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);
```

The `csurf` middleware will add a `_csrf` cookie that is HTTP-only (can't be
read by JavaScript) to any server response. It also adds a method on all
requests (`req.csrfToken`) that will be set to another cookie (`XSRF-TOKEN`)
later on. These two cookies work together to provide CSRF (Cross-Site Request
Forgery) protection for your application. The `XSRF-TOKEN` cookie value needs to
be sent in the header of any request with all HTTP verbs besides `GET`. This
header will be used to validate the `_csrf` cookie to confirm that the
request comes from your site and not an unauthorized site.

Now that you set up all the pre-request middleware, it's time to set up the
routes for your Express application.

#### Routes

Create a folder called `routes` in your `backend` folder. All your routes will
live in this folder.

Create an `index.js` file in the `routes` folder. In this file, create an
Express router, create a test route, and export the router at the bottom of the
file.

```js
// backend/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/hello/world', function(req, res) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.send('Hello World!');
});

module.exports = router;
```

In this test route, you are setting a cookie on the response with the name of
`XSRF-TOKEN` to the value of the `req.csrfToken` method's return. Then, you are
sending the text, `Hello World!` as the response's body.

Add the routes to the Express application by importing with the other imports
in `backend/app.js` and connecting the exported router to `app` after all the
middlewares.

```js
// backend/app.js
const routes = require('./routes');

// ...

app.use(routes); // Connect all the routes
```

Finally, at the bottom of the `app.js` file, export `app`.

```js
// backend/app.js
// ...

module.exports = app;
```

After setting up the Express application, it's time to create the server.

#### `bin/www`

Create a folder in `backend` called `bin`. Inside of it, add a file called
`www` with the following contents:

```js
#!/usr/bin/env node
// backend/bin/www
const { port } = require('../config');

const app = require('../app');
const db = require('../db/models');

// Check the database connection before starting the app
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection success! Sequelize is ready to use...');

    // Start listening for connections
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  })
  .catch((err) => {
    console.log('Database connection failure.');
    console.error(err);
  });
```

Here, you will be starting your Express application to listen for server
requests only after authenticating your database connection.

### Test the Server

At this point, your database, Express application, and server are all set up and
ready to be tested!

In your `package.json`, add the following scripts:

```json
  "scripts": {
    "sequelize": "sequelize",
    "sequelize-cli": "sequelize-cli",
    "start": "per-env",
    "start:development": "nodemon -r dotenv/config ./bin/www",
    "start:production": "node ./bin/www"
  }
```

`npm start` will run the `/bin/www` in `nodemon` when started in the development
environment with the environment variables in the `.env` file loaded, or in
`node` when started in production.

Now, it's time to finally test your entire set up!

Run `npm start` in the `backend` folder to start your server on the port defined
in the `.env` file, which should be `5000`.

Navigate to the test route at [http://localhost:5000/hello/world]. You should
see the text `Hello World!`. Take a look at your cookies in the `Application`
tab of your Chrome DevTools Inspector. Delete all the cookies to make sure there
are no lingering cookies from other projects, then refresh the page. You should
still see the text `Hello World!` on the page as well as two cookies, one called
`_csrf` and the other called `XSRF-TOKEN` in your DevTools.

If you don't see this, then check your backend server logs in the terminal
where you ran `npm start`. Then check your routes.

If there is a database connection error, make sure you set up the correct
username and password defined in the `.env` file.

When you're finished testing, commit! Now is a good time to commit because you
have working code.

## Phase 1: API Routes

The main purpose of this Express application is to be a REST API server. All the
API routes will be served at URL's starting with `/api/`.

Get started by nesting an `api` folder in your `routes` folder. Add an
`index.js` file in the `api` folder with the following contents:

```js
// backend/routes/api/index.js
const router = require('express').Router();

module.exports = router;
```

Import this file into the `routes/index.js` file and connect it to the `router`
there.

```js
// backend/routes/index.js
// ...
const apiRouter = require('./api');

router.use('/api', apiRouter);
// ...
```

All the URLs of the routes in the `api` router will be prefixed with `/api`.

### Test the API Router

Make sure to test this setup by creating the following test route in the
`api` router:

```js
// backend/routes/api/index.js
// ...

router.post('/test', function(req, res) {
  res.json({ requestBody: req.body });
});

// ...
```

A router is created and an API test route is added to the router. The API test
route is accepting requests with the URL path of `/api/test` with the HTTP verb
of `POST`. It sends a JSON response containing whatever is in the body of the
request.

Test this route by navigating to the other test route,
[http://localhost:5000/hello/world], and creating a `fetch` request in the
browser's DevTools console. Make a request to `/api/test` with the
`POST` method, a body of `{ hello: 'world' }`, a `"Content-Type"` header, and an
`XSRF-TOKEN` header with the value of the `XSRF-TOKEN` cookie located in your
DevTools.

Example fetch request:

```js
fetch('/api/test', {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ hello: 'world' })
}).then(res => res.json()).then(data => console.log(data));
```

Replace the `<value of XSRF-TOKEN cookie>` with the value of the `XSRF-TOKEN`
cookie. If you don't have the `XSRF-TOKEN` cookie anymore, access the
[http://localhost:5000/hello/world] route to add the cookie back.

After the response returns to the browser, parse the JSON response body and
print it out.

If you get an error, check your backend server logs in the terminal where you
ran `npm start`. Also, check your `fetch` request syntax and your API router
setup.

After you finish testing, commit your code!

## Phase 2: Error Handling

The next step is to set up your server error handlers.

Connect the following error handling middlewares after your route connections in
`app.js` (i.e., after `app.use(routes)`). Here is a refresher on how to create
an [Express error-handling middleware].

### Resource Not Found Error-Handler

The first error handler is actually just a regular middleware. It will catch
any requests that don't match any of the routes defined and create a server
error with a status code of `404`.

```js
// backend/app.js
// ...
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});
```

If this resource-not-found middleware is called, an error will be created with
the message `"The requested resource couldn't be found."` and a status code of
`404`. Afterwards, `next` will be invoked with the error. Remember, `next`
invoked with nothing means that error handlers defined **after** this middleware
**will not** be invoked. However, `next` invoked with an error means that error
handlers defined **after** this middleware **will** be invoked.

### Sequelize Error-Handler

The second error handler is for catching Sequelize errors and formatting them
before sending the error response.

```js
// backend/app.js
// ...
const { ValidationError } = require('sequelize');

// ...

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = 'Validation error';
  }
  next(err);
});
```

If the error that caused this error-handler to be called is an instance of
`ValidationError` from the `sequelize` package, then the error was created from
a Sequelize database validation error and the additional keys of `title` string
and `errors` array will be added to the error and passed into the next error
handling middleware.

### Error Formatter Error-Handler

The last error handler is for formatting all the errors before returning a JSON
response. It will include the error message, the errors array, and the error
stack trace (if the environment is in development) with the status code of the
error message.

```js
// backend/app.js
// ...
// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});
```

This should be the last middleware in the `app.js` file of your Express
application.

### Testing the Error Handlers

You can't really test the Sequelize error handler now because you have no
Sequelize models to test it with, but you can test the _Resource Not Found_
error handler and the Error Formatter error handler.

To do this, try to access a route that hasn't been defined in your `routes`
folder yet, like [http://localhost:5000/not-found].

If you see the json below, you have successfully set up your _Resource Not
Found_ and Error Formatter error handlers!

```json
{
  "title": "Resource Not Found",
  "message": "The requested resource couldn't be found.",
  "errors": [
    "The requested resource couldn't be found."
  ],
  "stack": "Error: The requested resource couldn't be found.\n ...<stack trace>..."
}
```

If you don't see the json above, check your backend server logs in your
terminal where you ran `npm start`.

Make sure your other test route at [http://localhost:5000/hello/world] is still
working. If it is not working, make sure you are defining your error handlers
**after** your route connections in `app.js` (i.e., after `app.use(routes)`).

You will test the Sequelize error handler later when you populate the
database with a table.

Before moving onto the next task, commit your error handling code!

## Phase 3: User Authentication

Now that you have finished setting up both Sequelize and the Express
application, you are ready to start implementing user authentication in the
backend.

With Sequelize, you will create a `Users` table that will have the following
schema:

| column name      |   data type   | constraints                                   |
| :--------------- | :-----------: | :-------------------------------------------- |
| `id`             |    integer    | not null, primary key                         |
| `username`       |    string     | not null, indexed, unique, max 30 characters  |
| `email`          |    string     | not null, indexed, unique, max 256 characters |
| `hashedPassword` | binary string | not null                                      |
| `createdAt`      |   datetime    | not null, default value of now()              |
| `updatedAt`      |   datetime    | not null, default value of now()              |

### Users Table Migration

First, generate a migration and model file. Navigate into the `backend` folder
in the terminal and run the following command:

```bash
npx sequelize model:generate --name User --attributes username:string,email:string,hashedPassword:string
```

This will create a file in your `backend/db/migrations` folder and a file called
`user.js` in your `backend/db/models` folder.

In the migration file, apply the constraints in the schema. If completed
correctly, your migration file should look something like this:

```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
```

Migrate the `Users` table by running the following command:

```bash
npx dotenv sequelize db:migrate
```

If there is an error when migrating, check your migration file and make changes.

If there is no error when migrating, but you want to change the migration file
afterwards, undo the migration first, change the file, then migrate again.

Command to undo the migration:

```bash
npx dotenv sequelize db:migrate:undo
```

You can check out the `Users` table schema created in your PostgreSQL database
by running the following command in the terminal:

```bash
psql <database name> -c '\d "Users"'
```

### User Model

After you migrate the `Users` table with the database-level constraints, you
need to add Sequelize model-level constraints. In your `User` model file,
`backend/db/models/user.js`, add the following constraints:

| column name      |   data type   | constraints                                                       |
| :--------------- | :-----------: | :---------------------------------------------------------------- |
| `username`       |    string     | not null, unique, min 4 characters, max 30 characters, isNotEmail |
| `email`          |    string     | not null, unique, min 3 characters, max 256 characters, isEmail   |
| `hashedPassword` | binary string | not null, min and max 60 characters                               |

See the Sequelize docs on [model-level validations] for a reminder on how to
apply these constraints. A custom validator needs to be created for the
`isNotEmail` constraint. See here for a refresher on [custom Sequelize
validators][model-level validations]. You can use the imported `isEmail`
validation from the `sequelize` package's `Validator` to check if the `username`
is an email. If it is, throw an error with a message.

Your `user.js` file should look like this with the applied constraints:

```js
'use strict';
const { Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error('Cannot be an email.');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256]
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  }, {});

  User.associate = function(models) {
    // associations can be defined here
  };

  return User;
};
```

### User Seeds

Generate a user seeder file for the demo user with the following command:

```bash
npx sequelize seed:generate --name demo-user
```

In the seeder file, create a demo user with `email`, `username`, and
`hashedPassword` fields. For the `down` function, delete the user with the
`username` or `email` of the demo user. If you'd like, you can also add other
users and populate the fields with random fake data. To generate the
`hashedPassword` you should use the `bcryptjs` package's `hashSync` method.

Your seeder file should look something like this:

```js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Users', {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
```

Notice how you do not need to add the `createdAt` and `updatedAt` fields for the
users. This is a result of the default value that you defined in the Sequelize
migration file for those fields.

Make sure to import `bcryptjs` at the top of the file.

After you finish creating your demo user seed file, migrate the seed file by
running the following command:

```bash
npx dotenv sequelize db:seed:all
```

If there is an error with seeding, check your seed file and make changes.

If there is no error in seeding but you want to change the seed file, remember
to undo the seed first, change the file, then seed again.

Command to undo the migration for the most recent seed file:

```bash
npx dotenv sequelize db:seed:undo
```

Command to undo the migrations for all the seed files:

```bash
npx dotenv sequelize db:seed:undo:all
```

Check your database to see if the users have been successfully created by
running:

```bash
psql <database name> -c 'SELECT * FROM "Users"'
```

### Model Scopes - Protecting Users' Information

To ensure that a user's information like their `hashedPassword` doesn't get
sent to the frontend, you should define `User` model scopes. Check out the
official documentation on [model scoping] to look up how to define a model scope
to prevent certain fields from being sent in a query.

For the default query when searching for `Users`, the `hashedPassword`,
`updatedAt`, and, depending on your application, `email` and `createdAt` fields
should not be returned. To do this, set a `defaultScope` on the `User` model to
exclude the desired fields from the default query. For example, when you run
`User.findAll()` all fields besides `hashedPassword`, `updatedAt`, `email`, and
`createdAt` will be populated in the return of that query.

Next, define a `User` model scope for `currentUser` that will exclude only the
`hashedPassword` field. Finally, define another scope for including all the
fields, which should only be used when checking the login credentials of a user.
These scopes need to be explicitly used when querying. For example,
`User.scope('currentUser').findByPk(id)` will find a `User` by the specified
`id` and return only the `User` fields that the `currentUser` model scope
allows.

Your `user.js` model file should now look like this:

```js
'use strict';
const { Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error('Cannot be an email.');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256]
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  },
  {
    defaultScope: {
      attributes: {
        exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
      }
    },
    scopes: {
      currentUser: {
        attributes: { exclude: ['hashedPassword'] }
      },
      loginUser: {
        attributes: {}
      }
    }
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  return User;
};
```

These scopes help protect sensitive user information that should not be exposed
to other users. You will be using these scopes in the later sections.

### Authentication Flow

The backend login flow in this project will be based on the following plan:

1. The API login route will be hit with a request body holding a valid
   credential (either username or email) and password combination.
2. The API login handler will look for a `User` with the input credential in
   either the `username` or `email` columns.
3. Then the `hashedPassword` for that found `User` will be compared with the
   input `password` for a match.
4. If there is a match, the API login route should send back a JWT in an
   HTTP-only cookie and a response body. The JWT and the body will hold the
   user's `id`, `username`, and `email`.

The backend sign-up flow in this project will be based on the following plan:

1. The API signup route will be hit with a request body holding a `username`,
   `email`, and `password`.
2. The API signup handler will create a `User` with the `username`, an `email`,
   and a `hashedPassword` created from the input `password`.
3. If the creation is successful, the API signup route should send back a JWT in
   an HTTP-only cookie and a response body. The JWT and the body will hold the
   user's `id`, `username`, and `email`.

The backend logout flow will be based on the following plan:

1. The API logout route will be hit with a request.
2. The API logout handler will remove the JWT cookie set by the login or signup
   API routes and return a JSON success message.

### User Model Methods

After creating the model scopes, you should create methods that the API routes
for authentication will use to interact with the `Users` table. The planned
methods are based on the authentication flow plans outlined above.

Define an instance method `User.prototype.toSafeObject` in the `user.js` model
file. This method will return an object with only the `User` instance
information that is safe to save to a JWT.

```js
User.prototype.toSafeObject = function() { // remember, this cannot be an arrow function
  const { id, username, email } = this; // context will be the User instance
  return { id, username, email };
};
```

Define an instance method `User.prototype.validatePassword` in the `user.js`
model file. It should accept a `password` string and return `true` if there is a
match with the `User` instance's `hashedPassword`. If there is no match, it
should return `false`.

```js
User.prototype.validatePassword = function (password) {
 return bcrypt.compareSync(password, this.hashedPassword.toString());
};
```

You are using the `bcryptjs` package to compare the `password` and the
`hashedPassword`, so make sure to import the package at the top of the `user.js`
file.

```js
const bcrypt = require('bcryptjs');
```

Define a static method `User.getCurrentUserById` in the `user.js` model file
that accepts an `id`. It should use the `currentUser` scope to return a
`User` with that `id`.

```js
User.getCurrentUserById = async function (id) {
 return await User.scope('currentUser').findByPk(id);
};
```

Define a static method `User.login` in the `user.js` model file. It should
accept an object with `credential` and `password` keys. The method should search
for one `User` with the specified `credential` (either a `username` or an
`email`). If a user is found, then the method should validate the `password` by
passing it into the instance's `.validatePassword` method. If the `password` is
valid, then the method should return the user by using the `currentUser` scope.

```js
User.login = async function ({ credential, password }) {
  const { Op } = require('sequelize');
  const user = await User.scope('loginUser').findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential
      }
    }
  });
  if (user && user.validatePassword(password)) {
    return await User.scope('currentUser').findByPk(user.id);
  }
};
```

Define a static method `User.signup` in the `user.js` model file that accepts an
object with a `username`, `email`, and `password` key. Hash the `password` using
the `bcryptjs` package's `hashSync` method. Create a `User` with the `username`,
`email`, and `hashedPassword`. Return the created user using the `currentUser`
scope.

```js
User.signup = async function ({ username, email, password }) {
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    username,
    email,
    hashedPassword
  });
  return await User.scope('currentUser').findByPk(user.id);
};
```

### User Auth Middlewares

There are three functions in this section that will aid you in authentication.

Create a folder called `utils` in your `backend` folder. Inside that folder, add
a file named `auth.js` to store the auth helper functions.

At the top of the file, add the following imports:

```js
// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;
```

#### `setTokenCookie`

This first function is setting the JWT cookie after a user is logged in or
signed up. It takes in the response and the session user and generates a JWT
using the imported secret. It is set to expire in however many seconds you
set on the `JWT_EXPIRES_IN` key in the `.env` file. The payload of the JWT will
be the return of the instance method `.toSafeObject` that you added previously
to the `User` model. After the JWT is created, it's set to an HTTP-only cookie
on the response as a `token` cookie.

```js
// backend/utils/auth.js
// ...

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
  // Create the token.
  const token = jwt.sign(
    { data: user.toSafeObject() },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie('token', token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax"
  });

  return token;
};
```

This function will be used in the login and signup routes later.

#### `restoreUser`

Certain authenticated routes will require the identity of the current session
user. You will create and utilize a middleware function called restoreUser that
will restore the session user based on the contents of the JWT cookie. Create a
middleware function that will verify and parse the JWT's payload and search the
database for a `User` with the id in the payload. (This query should use the
`currentUser` scope since the `hashedPassword` is not needed for this
operation.) If there is a `User` found, then save the user to a key of `user`
onto the request. If there is an error verifying the JWT or a `User` cannot be
found with the `id`, then clear the `token` cookie from the response.

```js
// backend/utils/auth.js
// ...

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.scope('currentUser').findByPk(id);
    } catch (e) {
      res.clearCookie('token');
      return next();
    }

    if (!req.user) res.clearCookie('token');

    return next();
  });
};
```

This will be added as a pre-middleware for route handlers and for the following
authentication middleware.

#### `requireAuth`

The last authentication middleware to add is for requiring a session user to be
authenticated before accessing a route.

Create an Express middleware called `requireAuth`. Define this middleware as an
array with the `restoreUser` middleware function you just created as the first
element in the array. This will ensure that if a valid JWT cookie exists, the
session user will be loaded into the `req.user` attribute. The second middleware
will check `req.user` and will go to the next middleware if there is a session
user present there. If there is no session user, then an error will be created
and passed along to the error-handling middlewares.

```js
// backend/utils/auth.js
// ...

// If there is no current user, return an error
const requireAuth = [
  restoreUser,
  function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Unauthorized');
    err.title = 'Unauthorized';
    err.errors = ['Unauthorized'];
    err.status = 401;
    return next(err);
  }
];
```

Both restoreUser and requireAuth will be applied as a pre-middleware to route
handlers where needed.

Finally, export all the functions at the bottom of the file.

```js
// backend/utils/auth.js
// ...

module.exports = { setTokenCookie, restoreUser, requireAuth };
```

#### Test User Auth Middlewares

Let's do some testing! It's always good to test your code anytime you have an
opportunity to do it. Testing at the very end is not a good idea because it will
be hard to pinpoint the location of the error in your code.

Add a test route in your `backend/routes/api/index.js` file that will test the
`setTokenCookie` function by getting the demo user and calling `setTokenCookie`.

```js
// backend/routes/api/index.js
// ...

// GET /api/set-token-cookie
const asyncHandler = require('express-async-handler');
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
router.get('/set-token-cookie', asyncHandler(async (_req, res) => {
  const user = await User.findOne({
      where: {
        username: 'Demo-lition'
      }
    });
  setTokenCookie(res, user);
  return res.json({ user });
}));

// ...
```

Go to [http://localhost:5000/api/set-token-cookie] and see if there is a `token`
cookie set in your browser's DevTools. If there isn't, then check your backend
server logs in the terminal where you ran `npm start`. Also, check the syntax
of your `setTokenCookie` function as well as the test route.

Next, add a test route in your `backend/routes/api/index.js` file that will test
the `restoreUser` middleware by connecting the middleware and checking whether
or not the `req.user` key has been populated by the middleware properly.

```js
// backend/routes/api/index.js
// ...

// GET /api/restore-user
const { restoreUser } = require('../../utils/auth.js');
router.get(
  '/restore-user',
  restoreUser,
  (req, res) => {
    return res.json(req.user);
  }
);

// ...
```

Go to [http://localhost:5000/api/restore-user] and see if the response has the
demo user information returned as JSON. Then, remove the `token` cookie manually
in your browser's DevTools and refresh. The JSON response should be empty.

If this isn't the behavior, then check your backend server logs in the terminal
where you ran `npm start` as well as the syntax of your `restoreUser` middleware
and test route.

To set the `token` cookie back, just go to the `GET /api/set-token-cookie` route
again: [http://localhost:5000/api/set-token-cookie].

Lastly, test your `requireAuth` middleware by adding a test route in your
`backend/routes/api/index.js` file. If there is no session user, the route will
return an error. Otherwise it will return the session user's information.

```js
// backend/routes/api/index.js
// ...

// GET /api/require-auth
const { requireAuth } = require('../../utils/auth.js');
router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);

// ...
```

Set the `token` cookie back by accessing the `GET /api/set-token-cookie` route
again: [http://localhost:5000/api/set-token-cookie].

Go to [http://localhost:5000/api/require-auth] and see if the response has the
demo user's information returned as JSON. Then, remove the `token` cookie
manually in your browser's DevTools and refresh. The JSON response should now
be an `"Unauthorized"` error.

If this isn't the behavior, then check your backend server logs in the terminal
where you ran `npm start` as well as the syntax of your `requireAuth` middleware
and test route.

To set the `token` cookie back, just go to the `GET /api/set-token-cookie` route
again: [http://localhost:5000/api/set-token-cookie].

**Once you are satisfied with the test results, you can remove all code for
testing the user auth middleware routes.**

## Phase 4: User Auth Routes

It's finally time to create the authentication API routes!

In this section, you will add the following routes to your Express application:

- Login: `POST /api/session`
- Logout: `DELETE /api/session`
- Signup: `POST /api/users`
- Get session user: `GET /api/session`

First, create a file called `session.js` in the `backend/routes/api` folder.
This file will hold the resources for the route paths beginning with
`/api/session`. Create and export an Express router from this file.

```js
// backend/routes/api/session.js
const express = require('express')
const router = express.Router();

module.exports = router;
```

Next create a file called `users.js` in the `backend/routes/api` folder. This
file will hold the resources for the route paths beginning with `/api/users`.
Create and export an Express router from this file.

```js
// backend/routes/api/users.js
const express = require('express')
const router = express.Router();

module.exports = router;
```

Connect all the routes exported from these two files in the `index.js` file
nested in the `backend/routes/api` folder.

Your `backend/routes/api/index.js` file should now look like this:

```js
// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
```

### User Login API Route

In the `backend/routes/api/session.js` file, import the following code at the
top of the file and create an Express router:

```js
// backend/routes/api/session.js
const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
```

The `asyncHandler` function from `express-async-handler` will wrap asynchronous
route handlers and custom middlewares.

Next, add the `POST /api/session` route to the router using an asynchronous
route handler. In the route handler, call the `login` static method from the
`User` model. If there is a user returned from the `login` static method, then
call `setTokenCookie` and return a JSON response with the user information. If
there is no user returned from the `login` static method, then create a `"Login
failed"` error and invoke the next error-handling middleware with it.

```js
// backend/routes/api/session.js
// ...

// Log in
router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.login({ credential, password });

    if (!user) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = ['The provided credentials were invalid.'];
      return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
      user
    });
  })
);
```

Make sure to export the `router` at the bottom of the file.

```js
// backend/routes/api/session.js
// ...

module.exports = router;
```

#### Test the Login Route

Test the login route by navigating to the [http://localhost:5000/hello/world]
test route and making a fetch request from the browser's DevTools console.
Remember, you need to pass in the value of the `XSRF-TOKEN` cookie as a header
in the fetch request because the login route has a `POST` HTTP verb.

If at any point you don't see the expected behavior while testing, then check
your backend server logs in the terminal where you ran `npm start`. Also, check
the syntax in the `session.js` as well as the `login` method in the `user.js`
model file.

Try to login the demo user with the username first.

```js
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ credential: 'Demo-lition', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

Remember to replace the `<value of XSRF-TOKEN cookie>` with the value of the
`XSRF-TOKEN` cookie found in your browser's DevTools. If you don't have the
`XSRF-TOKEN` cookie anymore, access the [http://localhost:5000/hello/world]
route to add the cookie back.

Then try to login the demo user with the email next.

```js
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ credential: 'demo@user.io', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

Now test an invalid user `credential` and `password` combination.

```js
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ credential: 'Demo-lition', password: 'Hello World!' })
}).then(res => res.json()).then(data => console.log(data));
```

You should get a `Login failed` error back with an invalid `password` for the
user with that `credential`.

Commit your code for the login route once you are done testing!

### User Logout API Route

The `DELETE /api/session` logout route will remove the `token` cookie from the
response and return a JSON success message.

```js
// backend/routes/api/session.js
// ...

// Log out
router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

// ...
```

Notice how `asyncHandler` wasn't used to wrap the route handler. This is because
the route handler is not `async`.

#### Test the Logout Route

Start by navigating to the [http://localhost:5000/hello/world] test route and
making a fetch request from the browser's DevTools console to test the logout
route. Check that you are logged in by confirming that a `token` cookie is in
your list of cookies in the browser's DevTools. Remember, you need to pass in
the value of the `XSRF-TOKEN` cookie as a header in the fetch request because
the logout route has a `DELETE` HTTP verb.

Try to logout the session user.

```js
fetch('/api/session', {
  method: 'DELETE',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  }
}).then(res => res.json()).then(data => console.log(data));
```

You should see the `token` cookie disappear from the list of cookies in your
browser's DevTools. If you don't have the `XSRF-TOKEN` cookie anymore, access
the [http://localhost:5000/hello/world] route to add the cookie back.

If you don't see this expected behavior while testing, then check your backend
server logs in the terminal where you ran `npm start` as well as the syntax in
the `session.js` route file.

Commit your code for the logout route once you are done testing!

### User Signup API Route

In the `backend/routes/api/users.js` file, import the following code at the top
of the file and create an Express router:

```js
const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
```

Next, add the `POST /api/users` route to the router using the asyncHandler
function and an asynchronous route handler. In the route handler, call the
`signup` static method on the `User` model. If the user is successfully created,
then call `setTokenCookie` and return a JSON response with the user information.
If the creation of the user is unsuccessful, then a Sequelize Validation error
will be passed onto the next error-handling middleware.

```js
// backend/routes/api/users.js
// ...

// Sign up
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    const user = await User.signup({ email, username, password });

    await setTokenCookie(res, user);

    return res.json({
      user
    });
  })
);
```

Make sure to export the `router` at the bottom of the file.

```js
// backend/routes/api/users.js
// ...

module.exports = router;
```

#### Test the Signup Route

Test the signup route by navigating to the [http://localhost:5000/hello/world]
test route and making a fetch request from the browser's DevTools console.
Remember, you need to pass in the value of the `XSRF-TOKEN` cookie as a header
in the fetch request because the login route has a `POST` HTTP verb.

If at any point you don't see the expected behavior while testing, check your
backend server logs in the terminal where you ran `npm start`. Also, check the
syntax in the `users.js` route file as well as the `signup` method in the
`user.js` model file.

Try to signup a new valid user.

```js
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({
    email: 'spidey@spider.man',
    username: 'Spidey',
    password: 'password'
  })
}).then(res => res.json()).then(data => console.log(data));
```

Remember to replace the `<value of XSRF-TOKEN cookie>` with the value of the
`XSRF-TOKEN` cookie found in your browser's DevTools. If you don't have the
`XSRF-TOKEN` cookie anymore, access the [http://localhost:5000/hello/world]
route to add the cookie back.

Next, try to hit the Sequelize model validation errors by testing the following
which should give back a `Validation error`:

- `email` is not unique (signup with an existing `email`)
- `username` is not unique (signup with an existing `username`)

If you don't see the `Validation error` for any of these, check the syntax in
your `backend/db/models/user.js` model file.

Commit your code for the signup route once you are done testing!

### Get Session User API Route

The `GET /api/session` get session user route will return the session user
as JSON under the key of `user` . If there is not a session, it will return a
JSON with an empty object. To get the session user, connect the `restoreUser`
middleware.

Add the route to the `router` in the `backend/routes/api/session.js` file.

```js
// backend/routes/api/session.js
// ...

// Restore session user
router.get(
  '/',
  restoreUser,
  (req, res) => {
    const { user } = req;
    if (user) {
      return res.json({
        user: user.toSafeObject()
      });
    } else return res.json({});
  }
);

// ...
```

#### Test the Get Session User Route

Test the route by navigating to [http://localhost:5000/api/session]. You should
see the current session user information if you have the `token` cookie. If you
don't have a token cookie, you should see an empty object returned.

If you don't have the `XSRF-TOKEN` cookie anymore, access the
[http://localhost:5000/hello/world] route to add the cookie back.

If you don't see this expected behavior, then check your backend server logs in
your terminal where you ran `npm start` and the syntax in the `session.js` route
file and the `restoreUser` middleware function.

Commit your code for the get session user route once you are done testing!

## Phase 5: Validating the Request Body

Before using the information in the body of the request, it's good practice to
validate the information.

You will use a package, `express-validator`, to validate the body of the
requests for routes that expect a request body. The `express-validator` package
has two functions, `check` and `validationResult` that are used together to
validate the request body. `check` is a middleware function creator that
checks a particular key on the request body. `validationResult` gathers the
results of all the `check` middlewares that were run to determine which parts of
the body are valid and invalid.

In the `backend/utils` folder, add a file called `validation.js`. In this file,
define an Express middleware called `handleValidationErrors` that will call
`validationResult` from the `express-validator` package passing in the request.
If there are no validation errors returned from the `validationResult` function,
invoke the next middleware. If there are validation errors, create an error
with all the validation error messages and invoke the next error-handling
middleware.

```js
// backend/utils/validation.js
const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors
      .array()
      .map((error) => `${error.msg}`);

    const err = Error('Bad request.');
    err.errors = errors;
    err.status = 400;
    err.title = 'Bad request.';
    next(err);
  }
  next();
};

module.exports = {
  handleValidationErrors
};
```

The `handleValidationErrors` function is exported at the bottom of the file. You
will test this function later when it's used.

Here's another great time to commit!

### Validating Login Request Body

In the `backend/routes/api/session.js` file, import the `check` function from
`express-validator` and the `handleValidationError` function you just created.

```js
// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...
```

The `check` function from `express-validator` will be used with the
`handleValidationErrors` to validate the body of a request.

The `POST /api/session` login route will expect the body of the request to have
a key of `credential` with either the `username` or `email` of a user and a key
of `password` with the password of the user.

Make a middleware called `validateLogin` that will check these keys and validate
them:

```js
// backend/routes/api/session.js
// ...

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];
```

The `validateLogin` middleware is composed of the `check` and
`handleValidationErrors` middleware. It checks to see whether or not
`req.body.credential` and `req.body.password` are empty. If one of them is
empty, then an error will be returned as the response.

Next, connect the `POST /api/session` route to the `validateLogin` middleware.
Your login route should now look like this:

```js
// backend/routes/api/session.js
// ...

// Log in
router.post(
  '/',
  validateLogin,
  asyncHandler(async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.login({ credential, password });

    if (!user) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = ['The provided credentials were invalid.'];
      return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
      user
    });
  })
);
```

#### Test the Login Validation

Test `validateLogin` by navigating to the [http://localhost:5000/hello/world]
test route and making a fetch request from the browser's DevTools console.
Remember, you need to pass in the value of the `XSRF-TOKEN` cookie as a header
in the fetch request because the login route has a `POST` HTTP verb.

If at any point you don't see the expected behavior while testing, check your
backend server logs in the terminal where you ran `npm start`. Also, check the
syntax in the `users.js` route file as well as the `handleValidationErrors`
middleware.

Try setting the `credential` user field to an empty string. You should get a
`Bad Request` error back.

```js
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ credential: '', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

Remember to replace the `<value of XSRF-TOKEN cookie>` with the value of the
`XSRF-TOKEN` cookie found in your browser's DevTools. If you don't have the
`XSRF-TOKEN` cookie anymore, access the [http://localhost:5000/hello/world]
route to add the cookie back.

Test the `password` field by setting it to an empty string. You should get a
`Bad Request` error back with `Please provide a password` as one of the errors.

```js
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({ credential: 'Demo-lition', password: '' })
}).then(res => res.json()).then(data => console.log(data));
```

Once you finish testing, commit your code!

### Validating Signup Request Body

In the `backend/routes/api/users.js` file, import the `check` function from
`express-validator` and the `handleValidationError` function you created.

```js
// backend/routes/api/users.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...
```

The `POST /api/users` signup route will expect the body of the request to have
a key of `username`, `email`, and `password` with the password of the user
being created.

Make a middleware called `validateSignup` that will check these keys and
validate them:

```js
// backend/routes/api/users.js
// ...
const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];
```

The `validateSignup` middleware is composed of the `check` and
`handleValidationErrors` middleware. It checks to see if `req.body.email` exists
and is an email, `req.body.username` is a minimum length of 4 and is not an
email, and `req.body.password` is not empty and has a minimum length of 6. If at
least one of the `req.body` values fail the check, an error will be returned as
the response.

Next, connect the `POST /api/users` route to the `validateSignup` middleware.
Your signup route should now look like this:

```js
// backend/routes/api/users.js
// ...

// Sign up
router.post(
  '/',
  validateSignup,
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    const user = await User.signup({ email, username, password });

    await setTokenCookie(res, user);

    return res.json({
      user,
    });
  }),
);
```

#### Test the Signup Validation

Test `validateSignup` by navigating to the [http://localhost:5000/hello/world]
test route and making a fetch request from the browser's DevTools console.
Remember, you need to pass in the value of the `XSRF-TOKEN` cookie as a header
in the fetch request because the login route has a `POST` HTTP verb.

If at any point you don't see the expected behavior while testing, check your
backend server logs in the terminal where you ran `npm start`. Also, check the
syntax in the `users.js` route file as well as the `handleValidationErrors`
middleware.

First, test the signup route with an empty `password` field. You should get a
`Bad Request` error back with `'Please provide a password'` as one of the
errors.

```js
fetch('/api/users', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
  },
  body: JSON.stringify({
    email: 'firestar@spider.man',
    username: 'Firestar',
    password: ''
  })
}).then(res => res.json()).then(data => console.log(data));
```

Remember to replace the `<value of XSRF-TOKEN cookie>` with the value of the
`XSRF-TOKEN` cookie found in your browser's DevTools. If you don't have the
`XSRF-TOKEN` cookie anymore, access the [http://localhost:5000/hello/world]
route to add the cookie back.

Then try to sign up with more invalid fields to test out the checks in the
`validateSignup` middleware. Make sure to cover each of the following test
cases which should give back a `Bad Request` error:

- `email` field is an empty string
- `email` field is not an email
- `username` field is an empty string
- `username` field is only 3 characters long
- `username` field is an email
- `password` field is only 5 characters long

If you don't see the `Bad Request` error for any of these, check your syntax for
the `validateSignup` middleware.

Commit your code once you're done testing!

## Wrapping up the Backend

You can now remove the `GET /hello/world` test routes. **Do not remove the
`POST /api/test` route just yet. You will be using it in the next part.**

Awesome work! You just finished setting up the entire backend for this project!
In the next part, you will implement the React frontend.

[helmet on the `npm` registry]: https://www.npmjs.com/package/helmet
[Express error-handling middleware]: https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
[model-level validations]: https://sequelize.org/master/manual/validations-and-constraints.html
[model scoping]: https://sequelize.org/master/manual/scopes.html
[Content Security Policy]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[Cross-Site Scripting]: https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
[crossOriginResourcePolicy]: https://www.npmjs.com/package/helmet
[http://localhost:5000/hello/world]: http://localhost:5000/hello/world
[http://localhost:5000/not-found]: http://localhost:5000/not-found
[http://localhost:5000/api/set-token-cookie]: http://localhost:5000/api/set-token-cookie
[http://localhost:5000/api/restore-user]: http://localhost:5000/api/restore-user
[http://localhost:5000/api/require-auth]: http://localhost:5000/api/require-auth
[http://localhost:5000/api/session]: http://localhost:5000/api/session

# Authenticate Me - Frontend

This is part two of a two-part project. In the first part, you should have
implemented the entire Express + Sequelize backend with user authentication
routes. In this part, you will add a React frontend that uses your backend API
routes to login, signup, and logout a user.

## Phase 0: Choose your path

If you want to set up Redux from scratch, follow Method 1. Otherwise, you can
follow Method 2, which will allow you to set up Redux easily. (To go to Method
2, just search for it within this page.)

### Method 1: Set up Redux from scratch

Use the `create-react-app` command from inside your `frontend` folder to
initialize React inside of the `frontend` folder:

```bash
npx create-react-app . --template @appacademy/react-v17 --use-npm
```

### Dependencies

In the `frontend` folder, `npm install` the following packages as dependencies:

- `js-cookie` - extracts cookies
- `react-redux` - React components and hooks for Redux
- `react-router-dom@^5` - routing for React
- `redux` - Redux
- `redux-thunk` - add Redux thunk

`npm install -D` the following packages as dev-dependencies:

- `redux-logger` - log Redux actions in the browser's dev tools console

### Setting up the Redux store

First, setup your Redux store. Make a folder in `frontend/src` called `store`
and add an `index.js` file. In this file, import `createStore`,
`combineReducers`, `applyMiddleware`, and `compose` from the `redux` package.
Import `thunk` from `redux-thunk`.

```js
// frontend/src/store/index.js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
```

Create a `rootReducer` that calls `combineReducers` and pass in an empty object
for now.

```js
// frontend/src/store/index.js
// ...
const rootReducer = combineReducers({
});
```

Initialize an `enhancer` variable that will be set to different store enhancers
depending on if the Node environment is in development or production.

In production, the `enhancer` should only apply the `thunk` middleware.

In development, the `logger` middleware and Redux dev tools compose enhancer as
well. To use these tools, create a `logger` variable that uses the default
export of `redux-logger`.  Then, grab the Redux dev tools compose enhancer with
`window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` and store it in a variable called
`composeEnhancers`. You can use an __or__ `||` to keep the Redux's original
`compose` as a fallback. Then set the `enhancer` variable to the return of the
`composeEnhancers` function passing in `applyMiddleware` invoked with `thunk`
then `logger`.

```js
// frontend/src/store/index.js
// ...

let enhancer;

if (process.env.NODE_ENV === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require('redux-logger').default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}
```

Next, create a `configureStore` function that takes in an optional
`preloadedState`. Return `createStore` invoked with the `rootReducer`, the
`preloadedState`, and the `enhancer`.

```js
// frontend/src/store/index.js
// ...

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
```

Finally, export the `configureStore` function at the bottom of the file as the
default export. This function will be used by `index.js` to attach the Redux
store to the React application.

### Redux `Provider` and `BrowserRouter`

In your React application, you'll be using `BrowserRouter` from React Router for
routing and `Provider` from Redux to provide the Redux store. Import those
components as well as the `configureStore` function that you just wrote in
`frontend/src/store/index.js`.

Your imports should now look something like this:

```js
// frontend/src/index.js
import React from 'react';

import './index.css';

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import configureStore from './store';
```

Create a variable to access your store and expose it to the `window`. It should
not be exposed in production, be sure this is only set in development.

```js
// frontend/src/index.js
// ...
const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}
```

Next, define a `Root` React functional component that returns the `App`
component wrapped in Redux's `Provider` and React Router DOM's `BrowserRouter`
provider components.

```js
// frontend/src/index.js
// ...
function Root() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}
```

Make sure to pass in the key of `store` with the value of `store` to the
`Provider`.

After defining the `Root` functional component, call `ReactDOM.render` function
passing in the `Root` component and the HTML element with the id of `"root"`.

```js
// frontend/src/index.js
// ...
ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root'),
);
```

Congratulations, you have finished Method 1! You may now skip to the "Test the
Redux store setup" section below. (Just scroll through Method 2; it's not long.)

### Method 2: Use Redux template

Use the `create-react-app` command from inside your `frontend` folder to
initialize React inside of the `frontend` folder:

```bash
npx create-react-app . --template @appacademy/react-redux-v17 --use-npm
```

You will also need to install `js-cookie` as a dependency to continue. This
dependency will allow your frontend to extract cookies from the browser.

```sh
npm install js-cookie
```

### Test the Redux store setup

**From this point, Method 1 and Method 2 have the same instructions.**

Test your Redux store setup by starting your React frontend server (run
`npm start` in your `frontend` folder) and navigate to [http://localhost:3000].

Check to see if your Redux dev tools was successfully connected and if there is
a `store` on the `window` in your browser's dev tools console.

You can ignore the "Store does not have a valid reducer" error. This error is a
result of not passing in anything into the `rootReducer`'s `combineReducer`.

Try to dispatch an action from your browser's dev tools console. Make sure to
include a `type` key in the action that you dispatch.

```js
window.store.dispatch({ type: 'hello' });
```

![test-redux-store-image]

If you cannot dispatch an action or if you cannot see the action in the Redux
dev tools, check the syntax in your `frontend/src/store/index.js` and in your
`frontend/src/index.js`.

**Now is a good time to commit your initial set up!**

### Wrapping `fetch` requests with CSRF

Your Express backend server is configured to be CSRF protected and will only
accept requests that have the right CSRF secret token in a header and the right
CSRF token value in a cookie.

First, you need to add a `"proxy"` in your `frontend/package.json`. Add a
`"proxy"` key with the value of `http://localhost:5000` or wherever you are
serving your backend Express application. This proxy will force the frontend
server to act like it's being served from the backend server. So if you do a
`fetch` request in the React frontend like `fetch('/api/csrf/restore)`, then the
`GET /api/csrf/restore` request will be made to the backend server instead of
the frontend server.

Your `frontend/package.json`'s `"proxy"` key should like this:

```json
  "proxy": "http://localhost:5000"
```

**Remember to restart the frontend server after you make any edits to the
`package.json` file.**

Next, to make `fetch` requests with any HTTP verb other than `GET`, you need to
set a `XSRF-TOKEN` header on the request and the value of the header should be
set to the value of the `XSRF-TOKEN` cookie. To do this, you are going to wrap
the `fetch` function on the `window` that will be used in place of the default
`fetch` function.

Add a `csrf.js` file in the `frontend/src/store` folder. Import `Cookies` from
`js-cookie` that will be used to extract the `XSRF-TOKEN` cookie value. Define
an `async` function called `csrfFetch` that will take in a `url` parameter and
an `options` parameter that defaults to an empty object. If `options.headers` is
not set, default it to an empty object. If `options.method` is not set, set it
to the `GET` method. If it is any method other than a `GET` method, set the
`XSRF-TOKEN` header on the `options` object to the extracted value of the
`XSRF-TOKEN` cookie. Call and `await` the `window.fetch` with the `url` and the
`options` object to get the response.

If the response status code is 400 or above, `throw` the response as the error.
Otherwise, return the response.

```js
// frontend/src/store/csrf.js
import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};

  // if the options.method is not 'GET', then set the "Content-Type" header to
    // "application/json", and set the "XSRF-TOKEN" header to the value of the
    // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }
  // call the default window's fetch with the url and the options passed in
  const res = await window.fetch(url, options);

  // if the response status code is 400 or above, then throw an error with the
    // error being the response
  if (res.status >= 400) throw res;

  // if the response status code is under 400, then return the response to the
    // next promise chain
  return res;
}
```

Export the custom `csrfFetch` function from this file.

### Restore the XSRF-TOKEN cookie

In development, the backend and frontend servers are separate. In production
though, the backend also serves up all the frontend assets, including the
`index.html` and any JavaScript files in the `frontend/build` folder after
running `npm start` in the `frontend` folder.

In production, the `XSRF-TOKEN` will be attached to the `index.html` file in the `frontend/build` folder. In the `backend/routes/index.js` file, serve the
`index.html` file at the `/` route and any routes that don't start with `/api`.
Along with it, attach the `XSRF-TOKEN` cookie to the response. Serve the static
files in the `frontend/build` folder using the `express.static` middleware.

```js
// backend/routes/index.js
// ... after `router.use('/api', apiRouter);`

// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });

  // Serve the static assets in the frontend's build folder
  router.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });
}

// ...
```

In development, you need another way to get the `XSRF-TOKEN` cookie on your
frontend application because the React frontend is on a different server than
the Express backend. To solve this, add a backend route, `GET /api/csrf/restore`
in the same file that can be accessed only in development and will restore the
`XSRF-TOKEN` cookie.

```js
// backend/routes/index.js
// ...

// Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({});
  });
}

// ...
```

Back in the React frontend, this `GET /api/csrf/restore` route needs to be
called when the application is loaded.

Define and export a function called `restoreCSRF` in the
`frontend/src/store/csrf.js` that will call the custom `csrfFetch` function with
`/api/csrf/restore` as the `url` parameter.

```js
// frontend/src/store/csrf.js
// ...

// call this to get the "XSRF-TOKEN" cookie, should only be used in development
export function restoreCSRF() {
  return csrfFetch('/api/csrf/restore');
}
```

In the frontend entry file (`frontend/src/index.js`), call the `restoreCSRF`
function when in development before defining the `Root` functional component.
Also, attach the custom `csrfFetch` function onto the `window` when in development
as `window.csrfFetch`.

```js
// frontend/src/index.js
// ... other imports
import { restoreCSRF, csrfFetch } from './store/csrf';

// ... const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
}
```

#### Test custom `csrfFetch` with CSRF

To test the custom `csrfFetch` function that attaches the CSRF token to the header,
navigate to root route of the React application, [http://localhost:3000]. In the
browser's dev tools console, make a request to `POST /api/session` with the demo
user credentials using the `window.csrfFetch` function. There is no need to
specify the headers because the default header for `"Content-Type"`, set to
`"application/json"`, and the `"XSRF-TOKEN"` header are added by the custom
`csrfFetch`.

```js
window.csrfFetch('/api/test', {
  method: 'POST',
  body: JSON.stringify({ credential: 'Demo-lition', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

If you see an object with a key of `requestBody` logged in the terminal with the
value as the object that you passed into the body of the request, then you
successfully set up CSRF protection on the frontend. If you don't then check
your syntax in the `frontend/src/store/csrf.js` and the `frontend/src/index.js`.

You can now remove the `POST /api/test` test route in your backend code, as you
won't be needing it anymore.

At this point, all the frontend setup is been complete. **Commit your code!**

Now it's time to render some React components!

## Phase 1: Login form page

The Login Form Page is the first page that you will add to your frontend
application.

### Session actions and reducer

First, you will add the Redux store actions and reducers that you need for this
feature. You will use the `POST /api/session` backend route to login in a user
as well as add the session user's information to the frontend Redux store.

Make a file called `session.js` in the `frontend/src/store` folder. This file
will contain all the actions specific to the session user's information and the
session user's Redux reducer.

In this file, add a `session` reducer that will hold the current session user's
information. The `session` slice of state should look like this if there is a
current session user:

```js
{
  user: {
    id,
    email,
    username,
    createdAt,
    updatedAt
  }
}
```

If there is no session user, then the `session` slice of state should look like
this:

```js
{
  user: null
}
```

By default, there should be no session user in the `session` slice of state.

Create two POJO action creators. One that will set the session user in the
`session` slice of state to the action creator's input parameter, and another
that will remove the session user. Their types should be extracted as a
constant and used by the action creator and the `session` reducer.

You need to call the API to login then set the session user from the response,
so add a thunk action for the `POST /api/session`. Make sure to use the custom
`csrfFetch` function from `frontend/src/store/csrf.js`. The `POST /api/session`
route expects the request body to have a key of `credential` with an existing
username or email and a key of `password`. After the response from the AJAX call
comes back, parse the JSON body of the response, and dispatch the action for
setting the session user to the user in the response's body.

Export the login thunk action, and export the reducer as the default export.

Import the reducer in `session.js` into the file with the root reducer,
`frontend/src/store/index.js`.

Set a key of `session` in the `rootReducer`'s `combineReducer` object argument
to the session reducer.

#### Test the session actions and reducer

Login should be working so give it a try! Test the login thunk action and the
`session` reducer.

Import all the actions from the `session.js` file into the frontend application
entry file, `frontend/src/index.js`. Then attach the actions to the `window`
at the key of `sessionActions`:

```js
// frontend/src/index.js
// ... other imports
import * as sessionActions from './store/session';

const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
}
// ...
```

Navigate to [http://localhost:3000] and in the browser's dev tools console, try
dispatching the login thunk action with the demo user login credentials.

The `previous state` in the console should look like this:

```js
{
  session: {
    user: null
  }
}
```

The `next state` in the console should look something like this:

```js
{
  session: {
    user: {
      createdAt: "<Some date time format>",
      email: "demo@appacademy.io",
      id: 1,
      updatedAt: "<Some date time format>",
      username: "Demo-lition",
    }
  }
}
```

If there is an error or if the previous or next state does not look like this,
then check your logic in your session reducer and your actions.

After you finished testing, **commit your code**.

#### Example session actions and reducer

There is no absolute "right" way of doing this. As long as your `session`
actions and reducers are displaying the expected initial state and states after
each dispatched action, then your setup is fine.

Here's an example for the `session` actions and reducer:

```js
// frontend/src/store/session.js
import { csrfFetch } from './csrf';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({
      credential,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case SET_USER:
      newState = Object.assign({}, state);
      newState.user = action.payload;
      return newState;
    case REMOVE_USER:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;
    default:
      return state;
  }
};

export default sessionReducer;
```

Here's an example for the `rootReducer` setup:

```js
// frontend/src/store/index.js
// ...
import sessionReducer from './session';

const rootReducer = combineReducers({
  session: sessionReducer,
});
// ...
```

Here's an example for the login thunk action test in the browser's dev tools
console:

```js
window.store.dispatch(window.sessionActions.login({
  credential: 'Demo-lition',
  password: 'password'
}));
```

### `LoginFormPage` component

After finishing the Redux actions and the reducer for the login feature, the
React components are next.

Create a `components` folder in the `frontend/src` folder. This is where all
your components besides `App` will live.

Make a folder called `LoginFormPage` nested in the new `components` folder which
will hold all the files for the login form. Add an `index.js` file in the
`LoginFormPage`. Inside of this file, add a React functional component named
`LoginFormPage`.

Render a form with a controlled input for the user login credential (username or
email) and a controlled input for the user password.

On submit of the form, dispatch the login thunk action with the form input
values. Make sure to handle and display errors from the login thunk action
if there are any.

Export the `LoginFormPage` component at the bottom of the file, then render it
in `App.js` at the `"/login"` route.

If there is a current session user in the Redux store, then redirect the user
to the `"/"` path if trying to access the `LoginFormPage`.

Test your component by navigating to the `"/login"` page. Try logging into the
form there with the demo user's credentials. Once you login, you should be
redirected to the `"/"` route. Check your code for the `LoginFormPage` and the
`App` component if this is not the flow that you are experiencing.

Also try logging in with invalid fields to test your handling and displaying of
error messages.

After testing, **commit your `LoginFormPage` code**!

#### Example `LoginFormPage` component

Again, there is no absolute "right" way of doing this. As long as your React
application is behaving as expected, then you don't need to make your code look
exactly like the example code.

Here's an example for `LoginFormPage` component:

```js
// frontend/src/components/LoginFormPage/index.js
import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  if (sessionUser) return (
    <Redirect to="/" />
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <ul>
        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
      </ul>
      <label>
        Username or Email
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Log In</button>
    </form>
  );
}

export default LoginFormPage;
```

Here's an example for how `App.js` should look like now:

```js
// frontend/src/App.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import LoginFormPage from './components/LoginFormPage';

function App() {
  return (
    <Switch>
      <Route path="/login">
        <LoginFormPage />
      </Route>
    </Switch>
  );
}

export default App;
```

#### `LoginForm` CSS

Add a `LoginForm.css` file in your `LoginFormPage` folder. Import this CSS
file into the `frontend/src/components/LoginFormPage/index.js` file.

```js
// frontend/src/components/LoginFormPage/index.js
// ...
import './LoginForm.css';
// ...
```

Define all your CSS styling rules for the `LoginFormPage` component in the
`LoginForm.css` file. Practice doing some CSS now to make your login page
look better. Make sure to **commit your code afterwards**!

## Restore the session user

Right now, if you login successfully, you get redirected to the `"/"` route. If
you refresh at that `"/"` page and navigate to the `"/login"` page, then you
will not be redirected because the store does not retain the session user
information on a refresh. How do you retain the session user information
across a refresh? By loading the application after accessing the route to
get the current session user `GET /api/session` and adding the user info to the
Redux store again.

Add a thunk action in `frontend/src/store/session.js` that will call the
`GET /api/session`, parse the JSON body of the response, and dispatch the action
for setting the session user to the user in the response's body.

Test your thunk action by logging in then refreshing at the
[http://localhost:3000] route. Make sure you have a `token` in your cookies. In
the browser's dev tools console, try dispatching the restore session user
thunk action.

The `previous state` in the console should look like this:

```js
{
  session: {
    user: null
  }
}
```

The `next state` in the console should look something like this:

```js
{
  session: {
    user: {
      createdAt: "<Some date time format>",
      email: "demo@appacademy.io",
      id: 1,
      updatedAt: "<Some date time format>",
      username: "Demo-lition",
    }
  }
}
```

If you don't see this behavior, then check your syntax for the restore user
thunk action.

After you test it to see if it works, then use this thunk action inside of
`App.js` after the `App` component's first render.

**Commit after testing!**

### Example restore session user thunk action

Again, there is no absolute "right" way of doing this. As long as your React
application is behaving as expected, then you don't need to make your code look
exactly like the example code.

Here's an example of the restore session user thunk action:

```js
// frontend/src/store/session.js
// ...
export const restoreUser = () => async dispatch => {
  const response = await csrfFetch('/api/session');
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};
// ...
```

Here's an example of how to test the `restoreUser` thunk action:

```js
window.store.dispatch(window.sessionActions.restoreUser());
```

Here's an example for how `App.js` could look like now:

```js
// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import * as sessionActions from "./store/session";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return isLoaded && (
    <Switch>
      <Route path="/login">
        <LoginFormPage />
      </Route>
    </Switch>
  );
}

export default App;
```

## Phase 2: Signup form page

The Signup Form Page is the second page that you will add to your frontend
application. The flow will be very similar to how you did the Login Form Page.
Can you remember all the steps to implement it? If so, **try doing this on your
own before looking below for help!**

### Signup action

You will use the `POST /api/users` backend route to signup a user.

In the session store file, add a signup thunk action that will hit the signup
backend route with `username`, `email`, and `password` inputs. After the
response from the AJAX call comes back, parse the JSON body of the response, and
dispatch the action for setting the session user to the user in the response's
body.

Export the signup thunk action.

#### Test the signup action

Test the signup thunk action.

Navigate to [http://localhost:3000]. If there is a `token` cookie, remove it and
refresh. In the browser's dev tools console, try dispatching the signup thunk
action with a new `username`, a new `email`, and a `password`.

The `previous state` in the console should look like this:

```js
{
  session: {
    user: null
  }
}
```

The `next state` in the console should look something like this:

```js
{
  session: {
    user: {
      createdAt: "<Some date time format>",
      email: "<new email>",
      id: "<new id>",
      updatedAt: "<Some date time format>",
      username: "<new password>",
    }
  }
}
```

If there is an error or if the previous or next state does not look like this,
then check your logic in your signup action.

**Commit your code for the signup actions!**

#### Example signup action

Again, there is no absolute "right" way of doing this. As long as your signup
action is displaying the expected initial state and states after each dispatched
action, then your setup is fine.

Here's an example for the signup thunk action:

```js
// frontend/src/store/session.js
// ...
export const signup = (user) => async (dispatch) => {
  const { username, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};
// ...
```

Here's an example for the signup thunk action test in the browser's dev tools
console:

```js
window.store.dispatch(window.sessionActions.signup({
  username: 'NewUser',
  email: 'new@user.io',
  password: 'password'
}));
```

### `SignupFormPage` component

After finishing the Redux action for the signup feature, the React components
are next.

Create a folder in the `components` directory for your signup page components.
Add an `index.js` and create a functional component named `SignupFormPage`.

Render a form with controlled inputs for the new user's username, email, and
password, and confirm password fields.

On submit of the form, validate that the confirm password is the same as the
password fields, then dispatch the signup thunk action with the form input
values. Make sure to handle and display errors from the signup thunk action
if there are any. If the confirm password is not the same as the password,
display an error message for this.

Export the `SignupFormPage` component at the bottom of the file, then render it
in `App.js` at the `"/signup"` route.

If there is a current session user in the Redux store, then redirect the user
to the `"/"` path if trying to access the `SignupFormPage`.

Test your component by navigating to the `"/signup"` page. Try logging into the
form there with new user's information. Once you signup, you should be
redirected to the `"/"` route. Check your code for the `SignupFormPage` and the
`App` component if this is not the flow that you are experiencing.

Also try signing up with invalid fields to test your handling and displaying of
error messages.

**After testing, commit your `SignupFormPage` code!**

#### Example `SignupFormPage` component

Again, there is no absolute "right" way of doing this. As long as your React
application is behaving as expected, then you don't need to make your code look
exactly like the example code.

Here's an example for `SignupFormPage` component:

```js
// frontend/src/components/SignupFormPage/index.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as sessionActions from "../../store/session";

function SignupFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);

  if (sessionUser) return <Redirect to="/" />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors([]);
      return dispatch(sessionActions.signup({ email, username, password }))
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
        });
    }
    return setErrors(['Confirm Password field must be the same as the Password field']);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ul>
        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
      </ul>
      <label>
        Email
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Confirm Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignupFormPage;
```

Here's an example for how `App.js` should look like now:

```js
// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return isLoaded && (
    <Switch>
      <Route path="/login">
        <LoginFormPage />
      </Route>
      <Route path="/signup">
        <SignupFormPage />
      </Route>
    </Switch>
  );
}

export default App;
```

#### `SignupForm` CSS

Add a `SignupForm.css` file in your `SignupFormPage` folder. Import this CSS
file into the `frontend/src/components/SignupFormPage/index.js` file.

```js
// frontend/src/components/SignupFormPage/index.js
// ...
import './SignupForm.css';
// ...
```

Define all your CSS styling rules for the `SignupFormPage` component in the
`SignupForm.css` file. Practice doing some CSS now to make your signup page
look better. Make sure to **commit your code afterwards**!

## Phase 3: Logout

The last part of the authentication flow is logging out. The logout button will
be placed in a dropdown menu in a navigation bar only when a session user
exists.

### Logout action

You will use the `DELETE /api/session` backend route to logout a user.

In the session store file, add a logout thunk action that will hit the logout
backend route. After the response from the AJAX call comes back, dispatch the
action for removing the session user.

Export the logout thunk action.

#### Test the logout action

Test the logout thunk action.

Navigate to [http://localhost:3000]. If there is no `token` cookie, add one by
logging in or signing up. In the browser's dev tools console, try dispatching
the logout thunk action.

The `previous state` in the console should look like this:

```js
{
  session: {
    user: {
      createdAt: "<Some date time format>",
      email: "<new email>",
      id: "<new id>",
      updatedAt: "<Some date time format>",
      username: "<new password>",
    }
  }
}
```

The `next state` in the console should look something like this:

```js
{
  session: {
    user: null
  }
}
```

If there is an error or if the previous or next state does not look like this,
then check your logic in your logout action and in your session reducer.

**Commit your code for the logout action.**

#### Example logout action

Again, there is no absolute "right" way of doing this. As long as your logout
action is displaying the expected initial state and states after each dispatched
action, then your setup is fine.

Here's an example for the logout thunk action:

```js
// frontend/src/store/session.js
// ...
export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
  return response;
};
// ...
```

Here's an example for the logout thunk action test in the browser's dev tools
console:

```js
window.store.dispatch(window.sessionActions.logout());
```

### `Navigation` component

After finishing the Redux action for the logout feature, the React components
are next. The `Navigation` component will render navigation links and a logout
button.

Make a folder called `Navigation` nested in the `frontend/src/components`
folder which will hold all the files for the signup form. Add an `index.js` file
in the `Navigation` folder. Inside of this file, add a React functional
component named `Navigation`.

Your navigation should render an unordered list with a navigation link to the
home page. It should only contain navigation links to the login and signup
routes when there is no session user and a logout button when there is.

Make a `ProfileButton.js` file in the `Navigation` folder. Create a React
functional component called `ProfileButton` that will render an icon from
[Font Awesome].

Follow the [instructions here for setting up Font Awesome][Font Awesome]. The
easiest way to connect Font Awesome to your React application is by sharing your
email and creating a new kit. The kit should let you copy an HTML `<script>`.
Add this script to the `<head>` of your `frontend/public/index.html` file.

**If you don't want to signup for Font Awesome** and are okay with using Font
Awesome icons that may not be up to date, you can just add the following `link`
to the `<head>` of your `frontend/public/index.html` file:

```html
<link
  rel="stylesheet"
  href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
  integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU"
  crossorigin="anonymous" />
```

Now you can use any of the [free icons available in Font Awesome][Choose a Font Awesome Icon] by adding the `<i>` element with the desired `className` to ber
rendered in a React component. To change the size or color of the icon, wrap
the `<i>` element in a parent element like a `div`. Manipulating the `font-size`
of the parent element changes the size of the icon. The color of the parent
element will be the color of the icon. For example, to render a big orange
[carrot icon]:

```js
const Carrot = () => (
  <div style={{ color: "orange", fontSize: "100px" }}>
    <i className="fas fa-carrot"></i>
  </div>
);
```

[Choose an icon][Choose a Font Awesome Icon] that will represent the user
profile button and render it in the `ProfileButton` component.

Export the `ProfileButton` component at the bottom of the file, and import it
into the `Navigation` component. Render the `ProfileButton` component only when
there is a session user.

Export the `Navigation` component and import it into the `App` component. Render
the `Navigation` component so that it shows up at the top of each page.

Navigate to the [http://localhost:3000] and remove the `token` cookie if there
is one. Refresh and see if there is a navigation bar with links to the login
and signup pages. After logging in, the navigation bar should have the links
to login and signup replaced with the Font Awesome user icon.

**Now is a good time to commit your working code.**

#### Dropdown menu

When clicked, the profile button should trigger a component state change and
cause a dropdown menu to be rendered. When there is a click outside of the
dropdown menu list or on the profile button again, then the dropdown menu should
disappear.

Dropdown menus in React is a little challenging. You will need to use your
knowledge of vanilla JavaScript DOM manipulation for this feature.

First, create a state variable called `showMenu` to control displaying the
dropdown. `showMenu` defaults to `false` indicating that the menu is hidden.
When the `ProfileButton` is clicked, toggle `showMenu` to `true` indicating that
the menu should now be shown. Modify the return value of your functional
component conditionally to either show or hide the menu based on the `showMenu`
_state variable_. The dropdown navigation menu should show the session user's
username and email, and add a button that will dispatch the logout action when
clicked.

Test this out by navigating to [http://localhost:3000]. If you click the profile
button, the menu list with the logout button should appear with the session
user's username and email. When you click the logout button, the profile button
and menu list should disappear. If you try logging in again and clicking the
profile button, there is currently no way to close the menu list once it's open
unless you logout. Let's work on this next, but first, make sure that you have
the above behavior in your navigation bar.

The dropdown menu should close when anywhere outside the dropdown menu is
clicked. To do this, you need to add an event listener to the entire document
to listen to any click changes and set the `showMenu` state variable to `false`
for any clicks outside of the dropdown menu.

Create a function called `openMenu` in the `ProfileButton` component. If
`showMenu` is `false`, nothing should happen. If `showMenu` is `true`, then
set the `showMenu` to `true`. When the profile button is clicked, it should call
`openMenu`.

When the dropdown menu is open, you need to register an event listener for
`click` events on the entire page (the `document`), in order to know when to
close the menu. Use an `useEffect` hook to create, register, and remove this
listener.

Inside the `useEffect`, create a function called `closeMenu`. When this function
is called set the `showMenu` state variable to `false` to trigger the dropdown
menu to close. Register the `closeMenu` function as an event listener for
`click` events on the entire page. The cleanup function for the `useEffect`
should remove this event listener.

If you try to test this on [http://localhost:3000], you'll notice that the
dropdown menu just doesn't open at all. Why do you think that is? Add a
`debugger` in the `openMenu` and the `closeMenu` functions. When you click on
the profile button, both `debugger`'s in the `openMenu` and `closeMenu`
functions will be triggered. To prevent this behavior, the listener should only
be added when `showMenu` changes to `true`. Make sure to only add the event
listener and return the cleanup function if `showMenu` is `true`. Add `showMenu`
to the dependencies array for `useEffect`.

Now, navigate to the home page and try opening and closing the dropdown menu.
You should see the dropdown menu open and close as expected!

Congratulations on implementing an awesome dropdown menu all in React! **Make
sure to commit your code!**

#### Examples of `Navigation` and `ProfileButton` components

Here's an example for how `Navigation/index.js` should look like:

```js
// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <ProfileButton user={sessionUser} />
    );
  } else {
    sessionLinks = (
      <>
        <NavLink to="/login">Log In</NavLink>
        <NavLink to="/signup">Sign Up</NavLink>
      </>
    );
  }

  return (
    <ul>
      <li>
        <NavLink exact to="/">Home</NavLink>
        {isLoaded && sessionLinks}
      </li>
    </ul>
  );
}

export default Navigation;
```

Here's an example for how `ProfileButton.js` should look like:

```js
// frontend/src/components/Navigation/ProfileButton.js
import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = () => {
      setShowMenu(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  return (
    <>
      <button onClick={openMenu}>
        <i className="fas fa-user-circle" />
      </button>
      {showMenu && (
        <ul className="profile-dropdown">
          <li>{user.username}</li>
          <li>{user.email}</li>
          <li>
            <button onClick={logout}>Log Out</button>
          </li>
        </ul>
      )}
    </>
  );
}

export default ProfileButton;
```

Here's an example for how `App.js` should look like now:

```js
// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route path="/login">
            <LoginFormPage />
          </Route>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
```

Here's an example for how `frontend/public/index.html` should look like now with
the recommended [Font Awesome] setup. Replace `{kit_id}` in the `script`'s `src`
with the value of your Font Awesome starter kit's id.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Simple React App</title>
    <script src="https://kit.fontawesome.com/{kit_id}.js" crossorigin="anonymous"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

As an alternative, you can also use the somewhat outdated Font Awesome CSS
stylesheet if you don't want to register for Font Awesome:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Simple React App</title>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

#### `Navigation` CSS

Add a `Navigation.css` file in your `Navigation` folder. Import this CSS
file into the `frontend/src/components/Navigation/index.js` file.

```js
// frontend/src/components/Navigation/index.js
// ...
import './Navigation.css';
// ...
```

Define all your CSS styling rules for the `Navigation` component in the
`Navigation.css` file. Make your navigation bar look good and your dropdown menu
flow well with the rest of the elements. **Afterwards, commit!**

## Bonus: Make the login form page into a modal

Modals are everywhere in modern applications. Here's one way of implementing a
modal in React without any external libraries/packages.

You will create a modal with using `ReactDOM`'s `createPortal` method.
[Portals in React] provide a way to render React elements into an entirely
separate HTML DOM element from where the React component is rendered.

Let's get started!

### Modal context

First, make a folder in `frontend/src` called `context`. This folder will hold
all the different context and context providers for your application. Add a file
in the `context` folder called `Modal.js`. Create a React context called a
`ModalContext`.

Create a functional component called `ModalProvider` that renders the
`ModalContext.Provider` component with all the `children` from the props as a
child. Render a `div` element as a sibling and right after the
`ModalContext.Provider`.

Create a React ref called `modalRef`. Set the `ref` prop on the rendered `div`
element to this `modalRef`. `modalRef.current` will be set to the actual HTML
DOM element that gets rendered from the `div`. Create a component state variable
called `value` that will be set to `modalRef.current` after the initial render
(hint: use the `useEffect` hook). Pass this `value` as the `value` prop to the
`ModalContext.Provider` component. Export the `ModalProvider` component. Import
the `ModalProvider` component in `frontend/src/index.js` and wrap all the
contents of the Root component with it.

Create a functional component called `Modal` that expects an `onClose` function
and `children` as props. Get the value of the `ModalContext` into the `Modal`
component by using the `useContext` hook and setting the value equal to a
variable called `modalNode`. Render a `div` with an id of `modal` and nest a
`div` with an id of `modal-background` and another `div` with an id of
`modal-content`. In the `modal-content` div, render the `children` props. When
the `modal-background` is clicked, the `onClose` prop should be invoked. Return
`null` if `modalNode` is falsey.

The `modal-background` div needs to be rendered **before** the `modal-content`
because it will naturally be placed "behind" the depth of the `modal-content`
if it comes before the `modal-content` in the DOM tree.

To get these elements to show up in the `div` in the `ModalProvider` component,
pass the rendered elements in the `Modal` component as the first argument of
`ReactDOM.createPortal` and pass in the `modalNode` as the second argument,
which is the reference to the actual HTML DOM element of the `ModalProvider`'s
`div`. Return the invocation of `ReactDOM.createPortal`. Make sure to import
`ReactDOM` from the `react-dom` package.

Add a CSS file in the `context` folder called `Modal.css`. The `modal` div
should have a `position` `fixed` and take up the entire width and height of the
window. The `modal-background` should also take up the entire width and height
of the window and have a `position` `absolute`. The `modal-content` div should
be centered inside of the `modal` div by flexing the `modal` div and have a
`position` of `absolute`. You may want to give the `modal-background` a
`background-color` of `rgba(0, 0, 0, 0.7)` and the `modal-content` a
`background-color` of `white` just to see them better.

Import the `Modal.css` file into the `Modal.js` context file.

### Login form modal

Now it's time to refactor the `LoginFormPage` component to be a modal instead
of a page.

Rename the `LoginFormPage` folder to `LoginFormModal`. Create a file called
`LoginForm.js` in this folder and move all the code from the `index.js` file in
the `LoginFormModal` file over to the `LoginForm.js` file. Rename the component
from `LoginFormPage` to just `LoginForm`. The code for redirecting the user
if there is no session user in the Redux store can be removed.

In the `index.js` file, import the `LoginForm` component. Create a functional
component called `LoginFormModal`. Add a component state variable called
`showModal` and default it to `false`. Render a button with the text `Log In`
that, when clicked, will set the `showModal` state variable to `true`.

Import the `Modal` component into this file. Render the `Modal` component with
the `LoginForm` component as its child **only when** the `showModal` state
variable is `true`. Add an `onClose` prop to the `Modal` component set to a
function that will change the `showModal` state variable to `false` when
invoked. Export the `LoginFormModal` component as default from this file.

Import the new `LoginFormModal` component into the `Navigation` component.
Replace the link to the login page with this `LoginFormModal` component.

Remove the `LoginFormPage` component from the `App` component.

It's finally time to test out your login form modal! Head to the home page,
[http://localhost:3000], and make sure you are logged out. Click the `Log In`
button. The login form modal should pop up. It should close when you click
anywhere outside of the form. Make sure the login functionality still works!

**Commit, commit, commit!**

### Example modal and login form modal

Here's an example for how `Modal.js` should look like:

```js
// frontend/src/context/Modal.js
import React, { useContext, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const ModalContext = React.createContext();

export function ModalProvider({ children }) {
  const modalRef = useRef();
  const [value, setValue] = useState();

  useEffect(() => {
    setValue(modalRef.current);
  }, [])

  return (
    <>
      <ModalContext.Provider value={value}>
        {children}
      </ModalContext.Provider>
      <div ref={modalRef} />
    </>
  );
}

export function Modal({ onClose, children }) {
  const modalNode = useContext(ModalContext);
  if (!modalNode) return null;

  return ReactDOM.createPortal(
    <div id="modal">
      <div id="modal-background" onClick={onClose} />
      <div id="modal-content">
        {children}
      </div>
    </div>,
    modalNode
  );
}
```

Here's an example for how `Modal.css` should look like:

```css
/* frontend/src/context/Modal.css */
#modal {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

#modal-background {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

#modal-content {
  position: absolute;
  background-color:white;
}
```

Here's an example for how `LoginFormModal/index.js` should look like:

```js
// frontend/src/components/LoginFormModal/index.js
import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm from './LoginForm';

function LoginFormModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Log In</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <LoginForm />
        </Modal>
      )}
    </>
  );
}

export default LoginFormModal;
```

Here's an example for how `LoginForm.js` should look like:

```js
// frontend/src/components/LoginFormModal/LoginForm.js
import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";

function LoginForm() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password })).catch(
      async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <ul>
        {errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
      <label>
        Username or Email
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Log In</button>
    </form>
  );
}

export default LoginForm;
```

Here's an example for how `Navigation.js` should look like now:

```js
// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import LoginFormModal from '../LoginFormModal';
import './Navigation.css';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <ProfileButton user={sessionUser} />
    );
  } else {
    sessionLinks = (
      <>
        <LoginFormModal />
        <NavLink to="/signup">Sign Up</NavLink>
      </>
    );
  }

  return (
    <ul>
      <li>
        <NavLink exact to="/">Home</NavLink>
        {isLoaded && sessionLinks}
      </li>
    </ul>
  );
}

export default Navigation;
```

Here's an example of what `App.js` should look like now:

```js
// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
```

Here's an example of how `frontend/src/index.js` should look:

```js
// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ModalProvider } from "./context/Modal";

import configureStore from "./store";
import { restoreCSRF, csrfFetch } from "./store/csrf";
import * as sessionActions from "./store/session";

const store = configureStore();

if (process.env.NODE_ENV !== "production") {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
}

function Root() {
  return (
    <Provider store={store}>
      <ModalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModalProvider>
    </Provider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
```

[test-redux-store-image]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/react-redux/topics/react-redux-auth/authenticate-me/assets/test-redux-store-setup.png
[Font Awesome]: https://fontawesome.com/start
[Choose a Font Awesome Icon]: https://fontawesome.com/icons?d=gallery&m=free
[carrot icon]: https://fontawesome.com/icons/carrot?style=solid
[Portals in React]: https://reactjs.org/docs/portals.html
[http://localhost:3000]: http://localhost:3000


# Authenticate Me - Deploying your Express + React app to Heroku

Heroku is an web application that makes deploying applications easy for a
beginner.

Before you begin deploying, **make sure to remove any `console.log`'s or
`debugger`'s in any production code**. You can search your entire project folder
if you are using them anywhere.

You will set up Heroku to run on a production, not development, version of your
application. When a Node.js application like yours is pushed up to Heroku, it is
identified as a Node.js application because of the `package.json` file. It runs
`npm install` automatically. Then, if there is a `heroku-postbuild` script in
the `package.json` file, it will run that script. Afterwards, it will
automatically run `npm start`.

In the following phases, you will configure your application to work in
production, not just in development, and configure the `package.json` scripts
for `install`, `heroku-postbuild` and `start` scripts to install, build your
React application, and start the Express production server.

## Phase 1: Heroku Connection

If you haven't created a Heroku account yet, create one [here][Create Heroku
Account].

Add a new application in your [Heroku dashboard] named whatever you want. Under
the "Resources" tab in your new application, click "Find more add-ons" and add
the "Heroku Postgres" add-on with the free Hobby Dev setting.

In your terminal, install the [Heroku CLI]; for WSL users, see "Standalone
Installation" Instructions. Afterwards, login to Heroku in your
terminal by running the following:

```bash
heroku login
```

Add Heroku as a remote to your project's git repository in the following command
and replace `<name-of-Heroku-app>` with the name of the application you created
in the [Heroku dashboard].

```js
heroku git:remote -a <name-of-Heroku-app>
```

Next, you will set up your Express + React application to be deployable to
Heroku.

## Phase 2: Setting up your Express + React application

Right now, your React application is on a different localhost port than your
Express application. However, since your React application only consists of
static files that don't need to bundled continuously with changes in production,
your Express application can serve the React assets in production too. These
static files live in the `frontend/build` folder after running `npm run build`
in the `frontend` folder.

Add the following changes into your `backend/routes.index.js` file.

At the root route, serve the React application's static `index.html` file along
with `XSRF-TOKEN` cookie. Then serve up all the React application's static
files using the `express.static` middleware. Serve the `index.html` and set the
`XSRF-TOKEN` cookie again on all routes that don't start in `/api`. You should
already have this set up in `backend/routes/index.js` which should now look
like this:

```js
// backend/routes/index.js
const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

router.use('/api', apiRouter);

// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });

  // Serve the static assets in the frontend's build folder
  router.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });
}

// Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.status(201).json({});
  });
}

module.exports = router;
```

Your Express backend's `package.json` should include scripts to run the
`sequelize` CLI commands.

The `backend/package.json`'s scripts should now look like this:

```json
  "scripts": {
    "sequelize": "sequelize",
    "sequelize-cli": "sequelize-cli",
    "start": "per-env",
    "start:development": "nodemon -r dotenv/config ./bin/www",
    "start:production": "node ./bin/www"
  },
```

Initialize a `package.json` file at the very root of your project directory
(outside of both the `backend` and `frontend` folders) with `npm init -y`.
The scripts defined in this `package.json` file will be run by Heroku, not
the scripts defined in the `backend/package.json` or the
`frontend/package.json`.

When Heroku runs `npm install`, it should install packages for both the
`backend` and the `frontend`. Overwrite the `install` script in the root
`package.json` with:

```bash
npm --prefix backend install backend && npm --prefix frontend install frontend
```

This will run `npm install` in the `backend` folder then run `npm install` in
the `frontend` folder.

Next, define a `heroku-postbuild` script that will run the `npm run build`
command in the `frontend` folder. Remember, Heroku will automatically run this
script after running `npm install`.

Define a `sequelize` script that will run `npm run sequelize` in the `backend`
folder.

Finally, define a `start` that will run `npm start` in the `backend folder.

The root `package.json`'s scripts should look like this:

```json
  "scripts": {
    "heroku-postbuild": "npm run build --prefix frontend",
    "install": "npm --prefix backend install backend && npm --prefix frontend install frontend",
    "dev:backend": "npm install --prefix backend start",
    "dev:frontend": "npm install --prefix frontend start",
    "sequelize": "npm run --prefix backend sequelize",
    "sequelize-cli": "npm run --prefix backend sequelize-cli",
    "start": "npm start --prefix backend"
  },
```

The `dev:backend` and `dev:frontend` scripts are optional and will not be used
for Heroku.

<!-- Not using CSP in helmet anymore -->
<!-- There's just one more thing to edit. For the `build` script in the
`frontend/package.json` file, add an `INLINE_RUNTIME_CHUNK=false` environment
variable before `react-scripts build`. This is necessary because the `helmet`
backend package is a middleware you added as an extra layer of security to the
Express application in production. The `helmet` middleware adds a [Content
Security Policy] which doesn't allow unsafe-inline JavaScript scripts. React,
by default, adds their JavaScript scripts as unsafe-inline. To remove this,
you need to have an environment variable of `INLINE_RUNTIME_CHUNK` set to
`false` before running `react-scripts build`.

`frontend/package.json`'s scripts should now look like this:

```json
  "scripts": {
    "start": "react-scripts start",
    "build": "INLINE_RUNTIME_CHUNK=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
``` -->

Finally, commit your changes.

## Phase 3: Deploy to Heroku

Once you're finished setting this up, navigate to your application's Heroku
dashboard. Under "Settings" there is a section for "Config Vars". Click the
`Reveal Config Vars` button to see all your production environment variables.
You should have a `DATABASE_URL` environment variable already from the
Heroku Postgres add-on.

Add environment variables for `JWT_EXPIRES_IN` and `JWT_SECRET` and any other
environment variables you need for production.

You can also set environment variables through the Heroku CLI you installed
earlier in your terminal. See the docs for [Setting Heroku Config Variables].

Push your project to Heroku. Heroku only allows the `master` branch to be
pushed. But, you can alias your branch to be named `master` when pushing to
Heroku. For example, to push a branch called `login-branch` to `master` run:

```bash
git push heroku login-branch:master
```

If you do want to push the `master` branch, just run:

```bash
git push heroku master
```

You may want to make two applications on Heroku, the `master` branch site that
should have working code only. And your `staging` site that you can use to test
your work in progress code.

Now you need to migrate and seed your production database.

Using the Heroku CLI, you can run commands inside of your production
application just like in development using the `heroku run` command.

For example to migrate the production database, run:

```bash
heroku run npm run sequelize db:migrate
```

To seed the production database, run:

```bash
heroku run npm run sequelize db:seed:all
```

Note: You can interact with your database this way as you'd like, but beware
that  `db:drop` **cannot** be run in the Heroku environment. If you want to drop
and create the database, you need to remove and add back the "Heroku Postgres"
add-on.

Another way to interact with the production application is by opening a bash
shell through your terminal by running:

```bash
heroku bash
```

In the opened shell, you can run things like `npm run sequelize db:migrate`.

Open your deployed site and check to see if you successfully deployed your
Express + React application to Heroku!

If you see an `Application Error` or are experiencing different behavior than
what you see in your local environment, check the logs by running:

```bash
heroku logs
```

If you want to open a connection to the logs to continuously output to your
terminal, then run:

```bash
heroku logs --tail
```

The logs may clue you into why you are experiencing errors or different
behavior.

### Wrapping up

You can also open your site in the browser with `heroku open`. If it works,
congratulations, you've created a production-ready, dynamic, full-stack website
that can be securely accessed anywhere in the world! Give yourself a pat on the
back. You're a web developer!

[Heroku Dashboard]: https://dashboard.heroku.com/
[Create Heroku Account]: https://signup.heroku.com/
[Heroku CLI]: https://devcenter.heroku.com/articles/heroku-command-line
[Setting Heroku Config Variables]: https://devcenter.heroku.com/articles/config-vars
[Content Security Policy]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP


 create the authentication API routes!

 Login: POST /api/session
Logout: DELETE /api/session
Signup: POST /api/users
Get session user: GET /api/session


Express + Sequelize backend with user authentication routes.
add a React frontend (use redux template) that uses your backend API routes to login, signup, and logout a user.


Heroku will automatically run this script after running npm install.

git push heroku main


 This proxy will force the frontend server to act like it's being served from the backend server.


The backend login flow in this project will be based on the following plan:

The API login route will be hit with a request body holding a valid credential (either username or email) and password combination.
The API login handler will look for a User with the input credential in either the username or email columns.
Then the hashedPassword for that found User will be compared with the input password for a match.
If there is a match, the API login route should send back a JWT in an HTTP-only cookie and a response body. The JWT and the body will hold the user's id, username, and email.


The backend sign-up flow in this project will be based on the following plan:

The API signup route will be hit with a request body holding a username, email, and password.
The API signup handler will create a User with the username, an email, and a hashedPassword created from the input password.
If the creation is successful, the API signup route should send back a JWT in an HTTP-only cookie and a response body. The JWT and the body will hold the user's id, username, and email.
The backend logout flow will be based on the following plan:

The API logout route will be hit with a request.
The API logout handler will remove the JWT cookie set by the login or signup API routes and return a JSON success message.
