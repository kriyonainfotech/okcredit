const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Otp = require("../models/Otp");
const sendOTP = require("../config/mailer"); // Mailer function

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

// Register User via Password
router.post("/register", async (req, res) => {
  const { email, password, mobile, name } = req.body;

  console.log("🚀 Registering user with email:", email, password, mobile, name);
  if (!email || !password || !mobile) {
    return res
      .status(400)
      .json({ success: false, message: "🔴 Missing required fields" });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });

    // If user exists, send error
    if (user) {
      console.log(`👤 User with email ${email} already exists. Please login.`);
      return res
        .status(400)
        .json({
          success: false,
          message: "👤 User already exists. Please login. 🔑",
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      email,
      password: hashedPassword,
      mobile,
      name,
    });

    await user.save();

    console.log("🚀 New user registered successfully!");
    return res
      .status(201)
      .json({ success: true, message: "🚀 User registered successfully. 🎉" });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return res.status(500).json({
      success: false,
      message:
        "🛠 Server error while processing your request. Please try again later. 😕",
    });
  }
});

// Login User via Password
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    // If user does not exist, send error
    if (!user) {
      console.log(`👤 User with email ${email} not found for login.`);
      return res
        .status(400)
        .json({
          success: false,
          message: "👤 User not found. Please register first. 📝",
        });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Invalid password entered for user: ${email}`);
      return res
        .status(400)
        .json({
          success: false,
          message: "❌ Invalid password. Please try again. 🔄",
        });
    }

    console.log(`✅ User ${email} logged in successfully! 🎉`);
    return res
      .status(200)
      .json({ success: true, message: "✅ Logged in successfully! 🎉", user });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return res.status(500).json({
      success: false,
      message:
        "🛠 Server error while processing your request. Please try again later. 😕",
    });
  }
});

// Get User by ID
router.post("/getUserById", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`🔴 User with ID ${userId} not found`);
      return res
        .status(404)
        .json({
          success: false,
          message: `🔴 User not found with ID ${userId}`,
        });
    }

    console.log(`✅ User fetched with ID: ${userId}`);
    res.json({
      success: true,
      message: "User details fetched successfully 📝",
      user,
    });
  } catch (error) {
    console.error(`❌ Error fetching user with ID ${userId}:`, error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "⚠️ Error fetching user, please try again later",
      });
  }
});

// Delete User
router.delete("/deleteUser", async (req, res) => {
  const userId = req.body.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      console.log(`🔴 User with ID ${userId} not found for deletion`);
      return res
        .status(404)
        .json({
          success: false,
          message: `🔴 User not found with ID ${userId}`,
        });
    }

    console.log(`✅ User deleted with ID: ${userId}`);
    res.json({
      success: true,
      message: "User deleted successfully 🗑️",
      userId,
    });
  } catch (error) {
    console.error(`❌ Error deleting user with ID ${userId}:`, error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "⚠️ Error deleting user, please try again later",
      });
  }
});

router.post("/forgot-password", async (req, res) => {
  console.log(req.body, "req.body");

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "👤 User not found. Please register first. 📝",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(otp);

    // Save OTP to separate collection
    await Otp.create({ email, otp });

    // Send OTP to user's email
    await sendOTP(email, otp);

    console.log("🚀 OTP sent! Check your email. 📩");
    res.status(200).json({
      success: true,
      message: "📩 OTP sent successfully! Check your email. 📩",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error sending email, please try again later",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });

    // Check if OTP record exists
    if (!otpRecord) {
      console.log(`❌ OTP not valid for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "❌ Invalid OTP. Please try again. 🔄",
      });
    }

    // OTP is valid, update otpVerified field
    await Otp.updateOne({ email }, { otpVerified: true });

    console.log(`✅ OTP verified successfully for ${email}.`);
    return res.status(200).json({
      success: true,
      message: "✅ OTP verified successfully! 🎉",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error sending email, please try again later",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {

    const isVerified = await Otp.findOne({ email, otpVerified: true });

    // Check if OTP record exists
    if (!isVerified) {
      console.log(`❌ OTP not valid for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "❌ Invalid OTP. Please try again. 🔄",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.updateOne({ email }, { password: passwordHash });

    console.log(`✅ Password reset successfully for ${email}.`);
    await Otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "✅ Password reset successfully! 🎉",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password, please try again later",
    });
  }
});

// Register User via OTP
// router.post("/register", async (req, res) => {
//   const { email, mobile } = req.body;

//   try {
//     // Check if the user already exists
//     let user = await User.findOne({ email });

//     // If user exists, send OTP for login
//     if (user) {
//       console.log(`👤 User with email ${email} already exists. Please login.`);
//       return res
//         .status(400)
//         .json({ message: "👤 User already exists. Please login. 🔑" });
//     }

//     // Generate OTP
//       const otp = generateOTP();
//       console.log(otp);

//     // Create new user
//     user = new User({
//       email,
//       mobile,
//       otp,
//       otpExpiration: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
//     });

//     await user.save();

//     // Send OTP to user's email
//     await sendOTP(email, otp);

//     console.log("🚀 New user registration OTP sent! Check your email. 📩");

//     return res
//       .status(201)
//       .json({
//         message: "🚀 OTP sent for registration. Check your email. 📩",
//       });
//   } catch (error) {
//     console.error("❌ Error during registration:", error);
//     return res
//       .status(500)
//       .json({
//         message:
//           "🛠 Server error while processing your request. Please try again later. 😕",
//       });
//   }
// });

// // Login User via OTP
// router.post("/login", async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Check if the user already exists
//     let user = await User.findOne({ email });

//     // If user does not exist, send error
//     if (!user) {
//       console.log(`👤 User with email ${email} not found for login.`);
//       return res
//         .status(400)
//         .json({ message: "👤 User not found. Please register first. 📝" });
//     }

//     // Generate OTP
//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

//     await user.save();

//     // Send OTP to user's email
//     await sendOTP(email, otp);

//     console.log("📧 OTP sent for login! Check your email. 🔑");

//     return res
//       .status(200)
//       .json({success:true, message: "🔑 OTP sent for login. Check your email. 📩" });
//   } catch (error) {
//     console.error("❌ Error during login:", error);
//     return res
//       .status(500)
//         .json({
//           success:false,
//         message:
//           "🛠 Server error while processing your request. Please try again later. 😕",
//       });
//   }
// });

// // Verify OTP and Login/Register user
// router.post("/verify-otp", async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     // Check if user exists and OTP is valid
//     if (!user) {
//       console.log(
//         `❌ User with email ${email} not found for OTP verification.`
//       );
//       return res
//         .status(400)
//         .json({ message: "👤 User not found. Please register first. 📝" });
//     }

//     if (user.otp !== otp) {
//       console.log(`❌ Invalid OTP entered for user: ${email}`);
//       return res
//         .status(400)
//         .json({ message: "❌ Invalid OTP. Please try again. 🔄" });
//     }

//     if (user.otpExpiration < Date.now()) {
//       console.log(`❌ OTP expired for user: ${email}`);
//       return res
//         .status(400)
//         .json({ message: "⏳ OTP has expired. Please request a new OTP. 📩" });
//     }

//     // OTP is valid, proceed with login or registration
//     user.otp = undefined; // Clear OTP after successful verification
//     user.isVerified = true; // Mark the user as verified

//     // You can also hash and save password here during registration

//     await user.save();

//     console.log(
//       `✅ OTP verified successfully for ${email}. User is now logged in! 🎉`
//     );

//     return res
//       .status(200)
//       .json({ success:true,message: "✅ OTP verified! You are now logged in. 🎉" });
//   } catch (error) {
//     console.error(`❌ Error while verifying OTP for ${email}:`, error);
//     return res
//       .status(500)
//       .json({success:false,
//         message:
//           "🛠 Server error while verifying OTP. Please try again later. 😕",
//       });
//   }
// });

module.exports = router;
