const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expireAt: { type: Date, expires: 600 },
    }
});

async function sendVerificationMail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email", emailTemplate(otp));
        console.log("Mail Sent Sucessfully", mailResponse);
    } catch (err) {
        console.log("error occured while sending mail");
        console.log(err);
        throw err;
    }
}

OTPSchema.pre("save", async function(next) {
    console.log("New document saved to database");
    if (this.isNew)
        await sendVerificationMail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);
