const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async(req, res) => {
    try {
        const { sectionId, title, description } = req.body;

        const video = req.files.video;
        if (!sectionId || !title || !description || !video) {
            return res.status(404).json({
                sucess: false,
                message: "Al fields are required",
                error: err.message,
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId }, {
            $push: {
                subSection: subSectionDetails._id,
            }
        }, { new: true }).populate("subSection").exec();

        return res.status(200).json({
            sucess: true,
            message: "Section updated Sucessfully",
            data: updatedSection,
        })

    } catch (err) {

        console.log(err.message)
        return res.status(500).json({
            sucess: false,
            message: "Internal Server error",
            error: err.message,
        })
    }
}

exports.updateSubSection = async(req, res) => {
    try {

        const { subSectionId, title, description } = req.body;

        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }
        //const video = req.files.videoFile;

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }

        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()
        const updatedSection = await Section.findById(sectionId).populate("subSection")
            //const subSection = await SubSection.findByIdAndUpdate(subSectionId, { title, timeDuration, description, viseo }, { new: true });
        return res.status(200).json({
            sucess: true,
            data: updatedSection,
            message: "SubSection Updated Sucessfully"
        });

    } catch (err) {
        return res.status(500).json({
            sucess: false,
            message: "SubSection cant be Updated",
            error: err.message,
        })
    }
}

exports.deleteSubSection = async(req, res) => {
    try {
        const { subSectionId, sectionId } = req.body

        await Section.findByIdAndUpdate({ _id: sectionId }, {
            $pull: {
                subSection: subSectionId,
            },
        })

        const subSec = await SubSection.findByIdAndDelete(subSectionId);

        if (!subSec) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate("subSection")

        return res.status(200).json({
            sucess: true,
            data: updatedSection,
            message: "SubSection deleted Sucessfully",
        });


    } catch (err) {
        return res.status(500).json({
            sucess: false,
            message: "SubSection cant be deleted",
            error: err.message,
        })
    }
};