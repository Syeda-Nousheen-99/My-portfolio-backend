import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { User } from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

// Register

export const register = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Avatar And Resume Are Required", 400));
    };
    const { avatar, resume } = req.files;

    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        { filder: "AVATAR" }
    );
    if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForAvatar.error || "Unknown cloudinary error"
        );
    }
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        { filder: "My RESUME" }
    );
    if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponseForResume.error || "Unknown cloudinary error"
        );
    }

    const {
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        gitHubURL,
        instagramURL,
        facebookURL,
        linkdinURL, } = req.body;

    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        gitHubURL,
        instagramURL,
        facebookURL,
        linkdinURL,
        avatar: {
            public_id: cloudinaryResponseForAvatar.public_id,
            url: cloudinaryResponseForAvatar.secure_url,
        },
        resume: {
            public_id: cloudinaryResponseForResume.public_id,
            url: cloudinaryResponseForResume.secure_url,
        },
    });
    generateToken(user, "User Registered", 201, res)
});

// Login

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Email And Password Are Required"));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password"));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password"));

    }
    generateToken(user, "Logged In", 200, res);
});

// Logout

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logout User"
    })
})

// get user

export const getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    })
})

// Update profile

export const updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        portfolioURL: req.body.portfolioURL,
        gitHubURL: req.body.gitHubURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
        linkdinURL: req.body.linkdinURL,
    };
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        const profileImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            { folder: "AVATAR" }
        );
        newUserData.avatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    }

    if (req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "My RESUME" }
        );
        newUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        };
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidator: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Profile Updated",
        user,
    })
})

// Update Password

export const updatePassword = catchAsyncError(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please Fill All Fields.", 400))
    }
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect Current Password.", 400))
    }
    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New Password And Confirm password do not match.", 400))
    };
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password Updated",
    })
});

export const GetUserForPortfolio = catchAsyncError(async (req, res, next) => {
    const id = "66d05a615b79ed131c9d525c";
    const user = await User.findById(id);
    res.status(200).json({
        success: true,
        user,
    })
})

// Forgot Password

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    
    // Save user with token and expiration
    await user.save({ validateBeforeSave: false });
    
    // Create the reset URL
    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    
    const message = `Your reset password token is: \n\n ${resetPasswordUrl} \n\n If you did not request this, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Recovery`,
            message,
        });
        
        res.status(201).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined; // Ensure the correct field name
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        return next(new ErrorHandler(error.message, 500));
    }
});


export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;

    // Hash the token received in the URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user by reset token and check if it has expired
    const user = await User.findOne({
      resetPasswordToken, // Ensure correct field name
      resetPasswordExpire: { $gt: Date.now() }, // Token should still be valid
    });

    if (!user) {
      return next(new ErrorHandler("Reset password token is invalid or has expired.", 400));
    }

    // Check if password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password and Confirm Password do not match", 400));
    }

    // Set new password and clear reset token fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpire = undefined; // Clear the expiration time

    // Save updated user data
    await user.save();

    // Generate new JWT token after password reset
    generateToken(user, "Password reset successfully!", 200, res);
});
