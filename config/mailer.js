const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kriyonainfotech@gmail.com",
    pass: "rgqw iyuz gmmc vvxl", // You can use App Password if using 2-step verification.
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: "kriyonainfotech@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully!");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

module.exports = sendOTP;
