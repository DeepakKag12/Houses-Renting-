const User = require("../models/user");

// Show signup form
module.exports.signupForm = (req, res) => {
  res.render("users/signup");
};

// Handle signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password); 

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings");
    });
  } catch (e) {
    console.error("Signup Error:", e);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Show login form
module.exports.loginform = (req, res) => {
  res.render("users/login");
};

// Handle login logic
module.exports.login = async (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  res.redirect(res.locals.redirectUrl || "/listings");
};

// Logout logic
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
};
