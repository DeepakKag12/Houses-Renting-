
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// Host: view all messages for their listings
router.get('/host', isLoggedIn, async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  const messages = await Message.find({ listing: { $in: listings.map(l => l._id) } }).populate('sender receiver listing');
  res.render('messages/host', { messages, currUser: req.user });
});

// Send a message
router.post('/:listingId', isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const { receiver, content } = req.body;
  const message = new Message({
    sender: req.user._id,
    receiver,
    listing: listingId,
    content
  });
  await message.save();
  res.redirect(`/listings/${listingId}`);
});

// Get messages for a listing
// Get messages for a listing and receiver
router.get('/:listingId', isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const { receiver } = req.query;
  const messages = await Message.find({ listing: listingId, $or: [
    { sender: req.user._id, receiver },
    { sender: receiver, receiver: req.user._id }
  ] }).populate('sender receiver');
  res.render('messages/index', {
    messages,
    listingId,
    listingOwnerId: receiver,
    currUser: req.user
  });
});

module.exports = router;
