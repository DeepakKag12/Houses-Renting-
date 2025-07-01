// middleware.js

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log(" Not Authenticated. Saving URL:", req.originalUrl);
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // ✅ clear after using it
  } else {
    res.locals.redirectUrl = "/listings"; 
  }
  next();
};

// Owner of Listing
const Listing = require("./models/listing.js");

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

