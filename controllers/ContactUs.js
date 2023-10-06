const mailsender = require("../utils/mailSender");
const User = require("../models/User")

exports.contactUs = async(req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, message } = req.body;
        if (!firstName || !lastName || !phoneNumber || !message) {
            return res.status(500).json({
                sucess: false,
                message: "All fields are required"
            })
        }

        await mailsender(email, "Response received sucessfully",
            "Thanks for cotacting Us!"
        )

        await mailsender("abhijeetgupta989@gmail.com", "Response from an user",
            `As recorded :- 
        Name: ${firstName} ${lastName}, 
        Email: ${email}, 
        No. ${phoneNumber}, 
        Message: ${message}
        `);

        return res.status(200).json({
            sucess: true,
            message: "response recorded sucessfully"
        })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            sucess: false,
            message: err.message,
            data: "Could not record user response"
        })
    }
};