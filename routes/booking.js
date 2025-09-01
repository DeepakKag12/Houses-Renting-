const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// Accept booking
router.post('/:id/accept', async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    ).populate('user listing');
    if (!booking) throw new Error('Booking not found');
    req.flash('success', `Booking for ${booking.listing.title} accepted. User ${booking.user.username} will be notified.`);
    res.redirect('/host/bookings');
  } catch (err) {
    next(err);
  }
});

// Reject booking
router.post('/:id/reject', async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('user listing');
    if (!booking) throw new Error('Booking not found');
    req.flash('success', `Booking for ${booking.listing.title} rejected. User ${booking.user.username} will be notified.`);
    res.redirect('/host/bookings');
  } catch (err) {
    next(err);
  }
});

// Create a booking
// Create a booking (POST /bookings)
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
  const { checkin, checkout, listing, guests } = req.body;
    // Prevent double-booking
    const overlapping = await Booking.findOne({
      listing,
      $or: [
        { checkin: { $lt: new Date(checkout) }, checkout: { $gt: new Date(checkin) } }
      ]
    });
    if (overlapping) {
      req.flash('error', 'Selected dates are already booked.');
      return res.redirect(`/listings/${listing}`);
    }
    const booking = new Booking({
      listing,
      user: req.user._id,
      checkin,
      checkout,
      guests,
      status: 'pending'
    });
    await booking.save();
    req.flash('success', 'Booking request sent!');
    res.redirect(`/listings/${listing}`);
  } catch (err) {
    next(err);
  }
});

// User's bookings
router.get('/my', isLoggedIn, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('listing');
    res.render('bookings/my', { bookings });
  } catch (err) {
    next(err);
  }
});

// Host's bookings for their listings
router.get('/host', isLoggedIn, async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const bookings = await Booking.find({ listing: { $in: listings.map(l => l._id) } }).populate('listing user');
    res.render('bookings/host', { bookings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
