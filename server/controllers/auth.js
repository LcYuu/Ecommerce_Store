const User = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");

const loginGoogle = async (req, res) => {
  const { _id } = req?.body;
  console.log("Received _id:", _id);
  if (!_id) {
    return res.status(400).json({
      success: false,
      message: "Missing inputs",
    });
  }
  try {
    const user = await User.findById(_id);
    console.log("User found: ", user);
    if (user) {
      const { password, role, refreshToken, ...userData } = user.toObject();
      const accessToken = generateAccessToken(user._id, role);
      const newRefreshToken = generateRefreshToken(user._id);
      await User.findByIdAndUpdate(
        user._id,
        { refreshToken: newRefreshToken },
        { new: true }
      );
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        accessToken,
        userData,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in loginSuccess controller: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  loginGoogle,
};
