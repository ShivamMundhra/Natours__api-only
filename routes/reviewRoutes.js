const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReviewById
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReviewById
  );

module.exports = router;
