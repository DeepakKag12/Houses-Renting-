const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const { isLoggedIn } = require('../middleware');

// Host dashboard: show analytics for all listings owned by host
router.get('/', isLoggedIn, async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  const analytics = await Promise.all(listings.map(async (listing) => {
    const bookings = await Booking.find({ listing: listing._id, status: 'confirmed' });
    const earnings = bookings.reduce((sum, b) => sum + (listing.price * ((b.checkout - b.checkin) / (1000*60*60*24))), 0);
    return {
      title: listing.title,
      views: listing.views || 0,
      bookings: bookings.length,
      earnings: earnings
    };
  }));
  res.render('dashboard/index', { analytics });
});

module.exports = router;
