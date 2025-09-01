const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); // ⬅️ Make sure this path is correct

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
       type: Schema.Types.ObjectId,
      ref: "User",
  },
  views: {
    type: Number,
    default: 0
  },
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: "Booking"
  }],
  earnings: {
    type: Number,
    default: 0
  },
  geometry: {
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}

});

// ✅ Middleware to delete all related reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
    console.log(`Deleted ${doc.reviews.length} associated review(s)`);
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
