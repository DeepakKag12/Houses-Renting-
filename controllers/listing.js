const Listing=require("../models/listing");

module.exports.index= async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
}


module.exports.renderNewform=(req, res) => {
  res.render("listings/new")
}

// create new listing
module.exports.createNewListing=async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;
  await listing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings/${listing._id}`);
}

// show listing
module.exports.ShowListing=async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show", { listing });
};

// edit 
module.exports.editListing=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit", { listing });
};
//update listing

module.exports.updatelisting=async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${updatedListing._id}`);
}

// delete listing
module.exports.deleteListing=async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}