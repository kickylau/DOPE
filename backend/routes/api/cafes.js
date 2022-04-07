const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Cafe, Review } = require('../../db/models');

const router = express.Router();


const cafeNotFoundError = (id) => {
  const err = Error('Cafe not found');
  err.errors = [`Cafe with id of ${id} could not be found.`];
  err.title = 'Cafe not found.';
  err.status = 404;
  return err;
};



const validateCafe = [
  check('img')
    .notEmpty()
    .isURL({ require_protocol: false, require_host: false }),
  check('title')
    .not().isEmpty()
    .isLength({ min: 4 })
    .withMessage('Please provide a title with at least 4 characters.'),
  check('description')
    .not().isEmpty()
    .isLength({ min: 10 })
    .withMessage('Please provide a title with at least 10 characters.'),
  check('address')
    .not().isEmpty()
    .isLength({ min: 10 })
    .withMessage('Please provide a title with at least 10 characters.'),
  check('city').not()
    .not().isEmpty()
    .isLength({ min: 4 })
    .withMessage('Please provide a title with at least 4 characters.'),
  check('zipCode')
    .not().isEmpty()
    .isLength({ min: 5 })
    .withMessage('Please provide a title with at least 5 characters.'),
  handleValidationErrors
];
//Cafe Routes

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cafe = await Cafe.findAll({
      order: [["createdAt", "DESC"]]
    });
    //res.send("HELLO")
    return res.json({ cafe });
  })
);


router.post(
  '/new',
  validateCafe,
  asyncHandler(async (req, res) => {
    //const { img,title,ownerId,description,address,city,zipCode} = req.body;
    const cafe = await Cafe.create(req.body);
    return res.json(cafe);
  })
);



router.get(
  '/:id(\\d+)',
  asyncHandler(async (req, res, next) => {
    const cafe = await Cafe.findByPk(req.params.id);
    if (cafe) {
      return res.json({ cafe });
    } else {
      next(cafeNotFoundError(req.params.id));
    }
  })
);


router.put(
  '/:id(\\d+)',
  validateCafe,
  asyncHandler(async (req, res, next) => {
    const cafe = await Cafe.findByPk(req.params.id);

    if (cafe) {
      cafe.img = req.body.img || cafe.img;
      cafe.title = req.body.title || cafe.title;
      cafe.description = req.body.description || cafe.description;
      cafe.address = req.body.address || cafe.address;
      cafe.city = req.body.city || cafe.city;
      cafe.zipCode = req.body.zipCode || cafe.zipCode;


      await cafe.save();
      res.json({ cafe });
    } else {
      next(cafeNotFoundError(req.params.id));
    }
  })
);

router.delete('/:id(\\d+)', asyncHandler(async (req, res, next) => {
  const cafe = await Cafe.findByPk(req.params.id);
  if (cafe) {
    await cafe.destroy();
    res.status(204).json({ message: "succeed" });
  } else {
    next(cafeNotFoundError(req.params.id));
  }
}));


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
      .isLength({ min: 5 })
      .withMessage('Please provide the review with at least 5 characters.'),
  handleValidationErrors
];

//Review Routes

router.get(
  '/:id(\\d+)/comments',
  asyncHandler(async (req, res) => {
      const answers = await Review.findAll({
          order: [["createdAt", "DESC"]]
      });
      //res.send("HELLO")
      return res.json({ answers });
  })
);


// router.post(
//   '/:id(\\d+)/comments/new',
//   validateCafe,
//   validateReview,
//   asyncHandler(async (req, res) => {
//       //const { img,title,ownerId,description,address,city,zipCode} = req.body;
//       const answer = await Review.create(req.body);
//       return res.json(answer);
//   })
// );



// router.get(
//   '/:id(\\d+)/comments/:id(\\d+)',
//   asyncHandler(async (req, res, next) => {
//       const answer = await Review.findByPk(req.params.id);
//       if (answer) {
//           return res.json({ answer });
//       } else {
//           next(reviewNotFoundError(req.params.id));
//       }
//   })
// );



router.delete(
  '/:id(\\d+)/comments/:id(\\d+)', asyncHandler(async (req, res, next) => {
  const answer = await Review.findByPk(req.params.id);
  if (answer) {
      await answer.destroy();
      res.status(204).json({ message: "succeed" });
  } else {
      next(reviewNotFoundError(req.params.id));
  }
}));

module.exports = router;
