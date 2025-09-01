if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

// Routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("✅ Connected to MongoDB");
}
main().catch(err => console.log(err));

// Session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});
store.on("error", err => {
  console.log("❌ Error in Mongo session store:", err);
});

// Session config
const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // Add ownsListing property for navbar logic
  if (req.user) {
    const Listing = require("./models/listing");
    Listing.countDocuments({ owner: req.user._id }).then(count => {
      res.locals.currUser.ownsListing = count > 0;
      next();
    }).catch(() => {
      res.locals.currUser.ownsListing = false;
      next();
    });
  } else {
    next();
  }
});

// 👇 Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.redirect("/listings");
  // or res.render("home"); if you have home.ejs
});

// Dummy user route
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "DeltaStudent2",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// Routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/bookings", bookingRouter);
app.use("/message", require("./routes/message"));
app.use("/favorites", require("./routes/favorites"));
app.use("/dashboard", require("./routes/dashboard"));
// User dashboard: view own bookings
const { isLoggedIn } = require("./middleware");
const Booking = require("./models/booking");
app.get("/user/bookings", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("users/bookings", { bookings });
});

// Host dashboard: view bookings for listings owned by user
app.get("/host/bookings", isLoggedIn, async (req, res) => {
  const Listing = require("./models/listing");
  const listings = await Listing.find({ owner: req.user._id });
  const bookings = await Booking.find({ listing: { $in: listings.map(l => l._id) } }).populate("listing").populate("user");
  res.render("bookings/host", { bookings });
});

// Central error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// Start server
app.listen(8080, () => {
  console.log("🚀 Server running at http://localhost:8080");
});
