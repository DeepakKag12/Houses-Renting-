const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// mapbox geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const baseClient = mbxGeocoding({ accessToken: mapToken });

// Show all listings
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
};

// Render form to create new listing
module.exports.renderNewform = (req, res) => {
  res.render("listings/new");
};

// Create new listing
module.exports.createNewListing = async (req, res) => {
  let response = await baseClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  // ✅ Add geometry from geocoding response
  listing.geometry = response.body.features[0].geometry;

  // ✅ Attach image if uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings/${listing._id}`);
};

// Show a specific listing and add geometry if missing
module.exports.ShowListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) throw new ExpressError(404, "Listing not found");

  // ✅ If geometry is missing, fetch using geocoding
  if (!listing.geometry || !listing.geometry.coordinates?.length) {
    try {
      const geoResponse = await baseClient.forwardGeocode({
        query: listing.location,
        limit: 1
      }).send();

      if (geoResponse.body.features.length > 0) {
        listing.geometry = geoResponse.body.features[0].geometry;
        await listing.save();
      }
    } catch (err) {
      console.error("🌐 Geocoding error:", err);
    }
  }

  console.log("📍 Listing geometry:", listing.geometry);
  res.render("listings/show", { listing });
};

// Render edit form
module.exports.editListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const originalImageUrl = listing.image.url;
  const transformedImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/h_300,w_250"
  );

  res.render("listings/edit", { listing, transformedImageUrl });
};

module.exports.updatelisting = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body.listing;

  // Update listing fields
  const listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

  // If geometry is missing or location changed, geocode the new location
  if (updatedData.location) {
    try {
      const geoResponse = await baseClient.forwardGeocode({
        query: updatedData.location,
        limit: 1
      }).send();

      if (geoResponse.body.features.length > 0) {
        listing.geometry = geoResponse.body.features[0].geometry;
        await listing.save(); // ✅ Save updated geometry
      }
    } catch (err) {
      console.error("🌐 Geocoding error during update:", err);
    }
  }

  req.flash("success", "Listing updated successfully");
  res.redirect(`/listings/${listing._id}`);
};


// Delete listing
module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
