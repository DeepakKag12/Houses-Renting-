const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js"); // ✅ keep this only
const userController=require("../controllers/user");

// GET signup form
router.get("/signup",userController.signupForm);

// POST signup
router.post("/signup",userController.signup );

// GET login form
router.get("/login", userController.loginform);

// POST login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true, 
  }),
 userController.login
);

// logout
router.get("/logout", userController.logout);

module.exports = router;
