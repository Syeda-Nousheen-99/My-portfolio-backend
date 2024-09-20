import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name Required"],
    },
    email: {
        type: String,
        required: [true, "Email Required"],
    },
    phone: {
        type: Number,
        required: [true, "Phone Number Required"],
    },
    aboutMe: {
        type: String,
        required: [true, "About me Field is Required"],
    },
    password: {
        type: String,
        required: [true, "Password is Required"],
        minLengtg: [8, "Password must conain at least 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true
        },
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    portfolioURL: {
        type: String,
        required:[true, "Portfolio URL is Required"],
    },
    gitHubURL: String,
    instagramURL: String,
    facebookURL: String,
    linkdinURL: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});
 
//  for hash password
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// For compare password wuth hash password

userSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

// Generae json web Toke

userSchema.methods.generateJsonWebToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRE
    });
};

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}



export const User = mongoose.model("User", userSchema)
