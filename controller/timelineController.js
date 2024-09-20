import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js";
import {Timeline} from "../models/timelineSchema.js"


export const postTimeline = catchAsyncError (async(req, res, next) =>{
    const {title, description, from , to} = req.body;
    const newTimeline = await Timeline.create({title, description, timeline: { from , to}
    });
    res.status(200).json({
        success: true,
        message: "Timeline Added",
        newTimeline,
    });

})
export const deleteTimeline = catchAsyncError (async(req, res, next) =>{
    const {id} = req.params;
    const timeline = await Timeline.findById(id);
    if(!timeline){
        return next(new ErrorHandler("TImeline not found", 400))
    }
    await timeline.deleteOne();
    res.status(200).json({
        success: true,
        message: "Timeline Deleted"
    })
})
export const getAllTimeline = catchAsyncError (async(req, res, next) =>{
    const timeline = await Timeline.find();
    res.status(200).json({
        success: true,
        timeline,
    });
});