const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapper = require('../utils/wrapper');
const reviewController = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middlewares');

router.post('/', isLoggedIn, validateReview, wrapper(reviewController.newReview));   

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapper(reviewController.deleteReview));     //Author of the review can delete it.


module.exports = router;