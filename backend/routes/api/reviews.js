const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
//const {requireAuth} = require("../../utils/auth");
const express = require('express');
const asyncHandler = require('express-async-handler');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Cafe, Review } = require('../../db/models');

const router = express.Router();


const reviewNotFoundError = (id) => {
  const err = Error('Review not found');
  err.errors = [`Review with id of ${id} could not be found.`];
  err.title = 'Review not found.';
  err.status = 404;
  return err;
};



const validateReview = [
  check('answer')
    .not().isEmpty()
    .isLength({ min: 1 })
    .withMessage('Please provide the review with at least 1 character.'),
  handleValidationErrors
];


const validateCafe = [
  check('img')
    .notEmpty()
    .isURL({ require_protocol: false, require_host: false }),
  check('title')
    .not().isEmpty()
    .isLength({ min: 1 })
    .withMessage('Please provide a title with at least 1 character.'),
  check('description')
    .not().isEmpty()
    .isLength({ min: 1 })
    .withMessage('Please provide a description with at least 1 character.'),
  check('address')
    .not().isEmpty()
    .isLength({ min: 1 })
    .withMessage('Please provide an address with at least 1 character.'),
  check('city').not()
    .not().isEmpty()
    .isLength({ min: 1 })
    .withMessage('Please provide a city name with at least 1 character.'),
  check('zipCode')
    .not().isEmpty()
    .isNumeric({ min: 1 })
    .withMessage('Please provide a valid zipcode.'),
  handleValidationErrors
];


// //Review Routes
//good to go
router.get(
  "/", asyncHandler(async (req, res) => {
    const answer = await Review.findAll(req.params.id);
    if (answer) {
      return res.json({ answer });
    }
  })
)



//goodtogo
//api/reviews/cafes/:id
router.get(
  '/cafes/:businessId',
  asyncHandler(async (req, res) => {
    const businessId = +req.params.businessId;
    //OR const businessId = parseInt(req.params.businessId, 10)
    const answers = await Review.findAll({
      where: { businessId }
    });
    //res.send("HELLO")
    return res.json({ answers });
  })
);


//good to go
router.delete(
  '/:id(\\d+)',
  asyncHandler(async (req, res, next) => {
    const answer = await Review.findByPk(req.params.id);
    //console.log(answer.id,"ANSWER")
    if (answer) {
      await answer.destroy();
      res.status(204).json({ message: "succeed" });
    } else {
      next(reviewNotFoundError(req.params.id));
    }
  }));




//goodtogo
router.post(
  '/new',
  validateReview,
  asyncHandler(async (req, res) => {
    const { userId, businessId, answer} = req.body;
    //console.log(userId, businessId,answer)

    //console.log(req.body)
    const response = await Review.create({ userId, businessId, answer});
    return res.json(response);
  })
);







router.get(
  '/:id(\\d+)',
  asyncHandler(async (req, res, next) => {
    const answer = await Review.findByPk(req.params.id);
    if (answer) {
      return res.json({ answer });
    } else {
      next(reviewNotFoundError(req.params.id));
    }
  })
);






module.exports = router;
