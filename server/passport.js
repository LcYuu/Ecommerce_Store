const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();
const passport = require("passport");
const User = require("./models/user");
const crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },

    async function (accessToken, refreshToken, profile, cb) {
      try {
        const email = profile.emails[0]?.value;
        console.log("Profile", profile);

        if (email) {
          let user = await User.findOne({ email: email });

          if (!user) {
            user = await User.create({
              email: email,
              firstname: profile.name?.givenName,
              lastname: profile.name?.familyName,
              avatar: profile.photos[0]?.value,
              mobile: null,
              password: crypto.randomBytes(16).toString("hex"),
            });
          }

          console.log("Thông tin người dùng:", user);
          return cb(null, user);
        } else {
          return cb(new Error("Không tìm thấy email trong profile"));
        }
      } catch (error) {
        console.error("Lỗi trong quá trình xác thực Google:", error);
        return cb(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "photos", "email", "name"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const email = profile.emails[0]?.value;
        console.log("Profile: ", profile);
        if (email) {
          const lastname = [profile.name?.familyName, profile.name?.middleName]
            .filter(Boolean)
            .join(" ");
          let user = await User.findOne({ email: email });

          if (!user) {
            user = await User.create({
              email: email,
              firstname: profile.name?.givenName,
              lastname: lastname,
              avatar: profile.photos[0]?.value,
              mobile: null,
              password: crypto.randomBytes(16).toString("hex"),
            });
          }

          console.log("Thông tin người dùng:", user);
          return cb(null, user);
        } else {
          return cb(new Error("Không tìm thấy email trong profile"));
        }
      } catch (error) {
        console.error("Lỗi trong quá trình xác thực Facebook:", error);
        return cb(error, null);
      }
    }
  )
);
