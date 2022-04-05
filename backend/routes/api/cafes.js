const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Cafe, Review} = require('../../db/models');

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
    check('title').not().isEmpty(),
    check('description').not().isEmpty(),
    check('address').not().isEmpty(),
    check('city').not().isEmpty(),
    check('zipCode').not().isEmpty(),
    handleValidationErrors
  ];
//Cafe Routes

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const cafe = await Cafe.findAll();
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
      res.status(204).json({message:"succeed"});
    } else {
      next(cafeNotFoundError(req.params.id));
    }
  }));

module.exports = router;
