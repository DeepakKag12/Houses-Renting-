const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require("../middleware");
const reviewController = require("../controllers/review"); // ✅ properly separated

// Validation middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) throw new ExpressError(400, error.details.map(e => e.message).join(", "));
  next();
};

// Create review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReviws));

// Delete review
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.deleteReviws));

module.exports = router;
