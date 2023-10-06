const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require('../models/Profile');
require("dotenv").config();

exports.sendOTP = async(req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                sucess: false,
                message: "User already registered"
            })
        }
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        //console.log("otp generated: ", otp);

        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        //console.log(otpBody);

        res.status(200).json({
            sucess: true,
            message: 'OTP Sent Sucessfully',
            otp,
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            sucess: false,
            message: err.message,
        })
    }
};

//SignUp

exports.signUp = async(req, res) => {

    try {
        console.log("cv");
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            //contactNumber,
            otp
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(403).json({
                sucess: false,
                message: "All fields are required"
            })
        }

        if (password !== confirmPassword) {
            return res.status(403).json({
                sucess: false,
                message: "Passwords do not match"
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({
                sucess: false,
                message: "User already registered"
            })
        }

        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        if (recentOtp.length == 0) {
            return res.status(400).json({
                sucess: false,
                message: "OTP Not Found"
            })
        } else if (otp !== recentOtp[0].otp) {
            console.log("Abhi");
            console.log("OTP", otp);
            console.log(recentOtp);
            return res.status(400).json({
                sucess: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 9);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            //contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        return res.status(200).json({
            sucess: true,
            message: "User registered Sucessfully",
            user
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            sucess: false,
            message: "User canot be registerd please try again"
        })
    }
}

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                sucess: false,
                message: "Please enter all the deatils"
            });
        }

        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                sucess: false,
                message: "User is not registered"
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "72h"
            });
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                sucess: true,
                token,
                user,
                message: "Logged in Sucessfully"
            })
        } else {
            return res.status(401).json({
                sucess: false,
                message: "Password is Incorrect",
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(401).json({
            sucess: false,
            message: "Login Failure, please try again",
        });
    }
};

exports.changePassword = async(req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);

        const { oldPassword, newPassword, /*confirmNewPassword*/ } = req.body;

        const isPasswordMatch = await bcrypt.compare(oldPassword,
            userDetails.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                sucess: false,
                message: "The password is incorrect"
            });
        }

        // if (newPassword !== confirmNewPassword) {
        //     return res.status(400).json({
        //         sucess: false,
        //         message: "The password and confirm password does not match",
        //     });
        // }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id, { password: encryptedPassword }, { new: true }
        );

        try {
            const emailRespose = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(updatedUserDetails.email,
                    `Password updated sucessfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent Sucessfully: ", emailRespose.response);
        } catch (err) {
            console.error("Error occured while sending email: ", err);
            return res.status(500).json({
                sucess: false,
                message: "Error occured while sending mail",
                error: err.message,
            });
        }

        return res.status(200).json({
            sucess: true,
            message: "Password changed sucessfully"
        });
    } catch (err) {
        console.error("Error occured while updatig password: ", err);
        return res.status(500).json({
            sucess: false,
            message: "Error occurred while updating password",
            error: err.message,
        });
    }
};