
if(process.env.NODE_ENV!="production")
{
  require("dotenv").config();

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");





// Models
const Listing = require("../MAJORPROJECT/models/listing.js");
const Review = require("../MAJORPROJECT/models/review.js");
const User=require("./models/user.js")

// Utils
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
// require  express router
const listingsRouter=require("./routes/listing.js")
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")



// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log(" Connected to MongoDB");
}
main().catch(err => console.log(err));

const sessionOption = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now()+1000*60*60*24*3,
    maxAge:1000*60*60*24*3,
    httpOnly:true
  },

};
// // Root Route
// app.get("/", (req, res) => {
//   res.send("🌍 Wanderlust Home");
// });



// session
app.use(session(sessionOption));
app.use(flash());

// passport
app.use(passport.initialize());
 app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash message
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); 
  res.locals.currUser=req.user;
  next();
});



app.get("/demouser",async (req,res,next)=>{
  let fackUser=new User({
    email:"student@gmail.com",
    username:"DeltaStudent2"

  });
    let registeredUser=await User.register(fackUser,"helloworld");
    res.send(registeredUser);

})






// routes  using express routers
app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews",reviewsRouter)

app.use("/",userRouter);







// Central Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// Start Server
app.listen(8080, () => {
  console.log(" Server running at http://localhost:8080");
});
