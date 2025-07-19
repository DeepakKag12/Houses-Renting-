const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listing");

const multer = require("multer");
const { storage } = require("../cloudConfig"); 
const upload = multer({ storage });

// Middleware to validate listing data
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details.map(e => e.message).join(", "));
  }
  next();
};

// INDEX + SEARCH
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const { location } = req.query;
    const query = {};
    if (location) {
      query.location = new RegExp(location, "i");
    }
    const listings = await Listing.find(query);
    res.render("listings/index", { listings, location });
  })
);

// NEW & CREATE
router
  .route("/")
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createNewListing)
  );
router.get("/new", isLoggedIn, listingController.renderNewform);

// SHOW, UPDATE, DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.ShowListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updatelisting)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
