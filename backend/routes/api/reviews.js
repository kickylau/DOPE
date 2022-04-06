const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

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
        .isLength({ min: 5 })
        .withMessage('Please provide the review with at least 5 characters.'),
    handleValidationErrors
];

//Review Routes

router.get(
    '/comments',
    asyncHandler(async (req, res) => {
        const answers = await Review.findAll({
            order: [["createdAt", "DESC"]]
        });
        //res.send("HELLO")
        return res.json({ answer });
    })
);


router.post(
    '/comments/new',
    validateCafe,
    validateReview,
    asyncHandler(async (req, res) => {
        //const { img,title,ownerId,description,address,city,zipCode} = req.body;
        const answer = await Review.create(req.body);
        return res.json(answer);
    })
);



router.get(
    '/comments/:id(\\d+)',
    asyncHandler(async (req, res, next) => {
        const answer = await Review.findByPk(req.params.id);
        if (answer) {
            return res.json({ answer });
        } else {
            next(reviewNotFoundError(req.params.id));
        }
    })
);



router.delete(
    '/comments/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const answer = await Review.findByPk(req.params.id);
    if (answer) {
        await answer.destroy();
        res.status(204).json({ message: "succeed" });
    } else {
        next(reviewNotFoundError(req.params.id));
    }
}));

module.exports = router;
