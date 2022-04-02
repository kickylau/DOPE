const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// This file will hold the resources for the route paths beginning with /api/session.
//User Login API Route

//The POST /api/session login route will expect the body of the request to have
//a key of credential with either the username or email of a user
//and a key of password with the password of the user.
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

  router.get(
    '/require-auth',
    requireAuth,
    (req, res) => {
      return res.json(req.user);
    }
  );


//Log in
//add the POST /api/session route
router.post(
    '/',
    // connect the POST /api/session route to the validateLogin middleware.
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

        return res.json(
            { user }
            //pay attention to {} deconstruct or not
            //matches with frontend session.js await response.json() for the return
        );
    })
);
// Log out
//The DELETE /api/session logout route will remove the token cookie from the response and return a JSON success message.
//asyncHandler wasn't used to wrap the route handler. This is because the route handler is not async.
router.delete(
    '/',
    (_req, res) => {
        res.clearCookie('token');
        return res.json({ message: 'success' });
    }
);







module.exports = router;
