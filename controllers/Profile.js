const Profile = require("../models/Profile");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

exports.updateProfile = async(req, res) => {
    try {
        const { firstName = "", lastName = "", dateOfBirth = "", about = "", contactNumber = "", gender = "N/A" } = req.body;
        const id = req.user.id;
        if (!id) {
            return res.status(400).json({
                sucess: false,
                message: "Id not found"
            });
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
          })
          await user.save()
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

        return res.status(200).json({
            sucess: true,
            message: "Profile Updated Sucessfully",
            updatedUserDetails,
        });
    } catch (error) {
        return res.status(500).json({
            sucess: false,
            message: error.message,
        });
    }
}

exports.deleteAccount = async(req, res) => {
    try {

        const id = req.user.id;
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                sucess: false,
                message: "User not found",
            });
        }

        //Multiple Deletions
        await Profile.findByIdAndUpdate({ _id: userDetails.additionalDetails });
        // if (userDetails.accountType == "Student") {
        //     await Course.find({ active: true }, {
        //         $pull: {
        //             studentsEnrolled: {}
        //         }
        //     })
        // } else {

        // }

        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
              courseId,
              { $pull: { studentsEnroled: id } },
              { new: true }
            )
          }

        await User.findByIdAndDelete({ _id: id });
        return res.status(200).json({
            sucess: true,
            message: "User Deleted Sucessfully"
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            sucess: false,
            message: "User cannot be Deleted"
        })
    }
}

exports.getAllUserDetails = async(req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            sucess: true,
            message: "UserData fetched Sucessfully",
            data: userDetails,
        });
    } catch (err) {
        return res.status(500).json({
            sucess: false,
            message: err.message,
        });
    }
}

exports.updateDisplayPicture = async(req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image);
        const updatedProfile = await User.findByIdAndUpdate({ _id: userId }, { image: image.secure_url }, { new: true }).populate("additionalDetails").exec();
        res.send({
            sucess: true,
            message: `Image Updated Sucessfully`,
            data: updatedProfile,
        })
    } catch (err) {
        return res.status(500).json({
            sucess: false,
            message: err.message
        })
    }
}

exports.getEnrolledCourses = async(req, res) => {
    console.log("yes");
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
                _id: userId,
            })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()

        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            console.log(courseProgressCount);
            if (courseProgressCount == null) {
                courseProgressCount = 0
            } else {
                courseProgressCount = courseProgressCount.completedVideos.length
            }
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        console.log("yes");
        return res.status(200).json({
            sucess: true,
            data: userDetails.courses,
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.instructorDashboard = async(req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id });

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            //create an new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            }
            return courseDataWithStats
        })

        res.status(200).json({ courses: courseData });

    } catch (error) {
        console.error("Yeh hai error: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
