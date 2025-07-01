const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReviws = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");

  // Check if user already reviewed this listing
  const hasReviewed = listing.reviews.some((review) =>
    review.author.equals(req.user._id)
  );

  if (hasReviewed) {
    req.flash("error", "You have already submitted a review for this listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;
  await review.save();
  listing.reviews.push(review);
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReviws = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  // Allow only the author to delete
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
