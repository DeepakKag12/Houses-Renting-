const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const ownerId = "685fd886c15434f21f016be0"; // Make sure this is a valid User _id

const main = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: ownerId,
    }));

    await Listing.insertMany(initData.data);
    console.log("✅ DATA WAS INITIALIZED");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
};

main();
