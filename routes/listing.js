const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listing");

// Middleware to validate listing data
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) throw new ExpressError(400, error.details.map(e => e.message).join(", "));
  next();
};

// ✅ INDEX + CREATE
router.route("/")
  .get(wrapAsync(listingController.index)) // Show all listings
  .post(isLoggedIn, validateListing, wrapAsync(listingController.createNewListing)); // Create new listing

// ✅ NEW FORM
router.get("/new", isLoggedIn, listingController.renderNewform);

// ✅ SHOW + UPDATE + DELETE
router.route("/:id")
  .get(wrapAsync(listingController.ShowListing)) // Show a specific listing
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updatelisting)) // Update listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); // Delete listing

// ✅ EDIT FORM
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
