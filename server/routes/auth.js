const router = require("express").Router();
const ctrls = require("../controllers/auth");
const passport = require("passport");
require("dotenv").config();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (req.user) {
      res.redirect(`${process.env.CLIENT_URL}/login-success/${req.user?.id}`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/login-failure`);
    }
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    if (req.user) {
      res.redirect(`${process.env.CLIENT_URL}/login-success/${req.user?.id}`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/login-failure`);
    }
  }
);

router.post("/login-success", ctrls.loginGoogle);

module.exports = router;
