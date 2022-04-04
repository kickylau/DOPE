const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const cafesRouter = require("../cafes.js");
//const {Cafe,Review,User } = require("../db/models")
//const cafesRouter = require('../')

// GET /api/set-token-cookie
//Test User Auth Middlewares
//  const asyncHandler = require('express-async-handler');
//  const { setTokenCookie } = require('../../utils/auth.js');
//  const { User } = require('../../db/models');
// router.get('/set-token-cookie', asyncHandler(async (_req, res) => {
//   const user = await User.findOne({
//       where: {
//         username: 'Demo-lition'
//       }
//     });
//   setTokenCookie(res, user);
//   return res.json({ user });
// }));


// GET /api/restore-user
// test route to test the restoreUser middleware
 const { restoreUser } = require('../../utils/auth.js');
router.get(
  '/restore-user',
  restoreUser,
  (req, res) => {
    return res.json(req.user);
  }
);

//  test requireAuth middleware by adding a test route
// GET /api/require-auth
 const { requireAuth } = require('../../utils/auth.js');
router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);



router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/cafes',cafesRouter);

// router.post('/test', (req, res) => {
//     res.json({ requestBody: req.body });
// });

//Once you are satisfied with the test results,
//you can remove all code for testing the user auth middleware routes.


module.exports = router;
