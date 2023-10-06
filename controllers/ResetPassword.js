const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require("crypto");

exports.resetPasswordToken = async(req, res) => {

    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                sucess: false,
                message: "Email not registered"
            });
        }

        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        }, { new: true });

        console.log("DETAILS", updatedDetails);

        const url = `http://localhost:3000/update-password/${token}`;
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )
        return res.json({
            sucess: true,
            message: "Email sent sucessfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            sucess: false,
            message: "Can't reset password",
        });
    }
}

exports.resetPassword = async(req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.status(500).json({
                sucess: false,
                message: "Passwords do not match",
            });
        }

        const userDetails = await User.findOne({ token: token });
        if (!userDetails) {
            return res.json({
                sucess: false,
                message: "Token is Invalid",
            });
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                sucess: false,
                message: "Token expired please retry",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({
            token: token
        }, { password: hashedPassword }, { new: true }, );

        return res.status(200).json({
            sucess: true,
            message: "Password reset sucessfull"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            sucess: false,
            message: "Password reset failed",
        });
    }
}