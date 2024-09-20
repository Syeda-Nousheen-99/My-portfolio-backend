import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { SoftwareApplication } from "../models/softwareApplicationSchema.js"; // Corrected import
import { v2 as cloudinary } from 'cloudinary';

export const addNewApplication = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Software Application Icon/Svg Required!", 400));
    }

    const { svg } = req.files;
    const { name } = req.body;

    if (!name) {
        return next(new ErrorHandler("Software's Name is Required", 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        { folder: "PORTFOLIO_SOFTWARE_APPLICATION" }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown cloudinary error"
        );
    }

    const newSoftwareApplication = await SoftwareApplication.create({ // Capitalized SoftwareApplication
        name,
        svg: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    res.status(200).json({
        success: true,
        message: "New Software Application Added",
        newSoftwareApplication,
    });
});

export const deleteApplication = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    
    const softwareApplication = await SoftwareApplication.findById(id);
    
    if (!softwareApplication) {
        return next(new ErrorHandler("Software Application Not Found!", 400));
    }
    
    const softwareApplicationSvgId = softwareApplication.svg.public_id;
    
    await cloudinary.uploader.destroy(softwareApplicationSvgId);
    
    await softwareApplication.deleteOne();
    
    res.status(200).json({
        success: true,
        message: "Software Application Deleted!"
    });
});

export const getAllApplication = catchAsyncError(async (req, res, next) => {
    const softwareApplication = await SoftwareApplication.find();
    res.status(200).json({
        success: true,
        softwareApplication,
    });
});
