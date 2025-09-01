const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// Add to favorites
router.post('/:listingId', isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: listingId } });
  res.redirect(`/listings/${listingId}`);
});

// Remove from favorites
router.delete('/:listingId', isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: listingId } });
  res.redirect('/favorites');
});

// View favorites
router.get('/', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.render('favorites/index', { favorites: user.favorites });
});

module.exports = router;
