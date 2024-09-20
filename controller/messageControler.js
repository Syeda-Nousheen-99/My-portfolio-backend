import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import{Message} from '../models/messageSchema.js';

// send Message

export const sendMessage = catchAsyncError(async (req, res, next) => {
    const { senderName, subject, message } = req.body;
    if (!senderName || !subject || !message) {
      return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    const data = await Message.create({ senderName, subject, message });
    res.status(201).json({
      success: true,
      message: "Message Sent",
      data,
    });
  });


//   Get all Mesaages

export const getAllMessages = catchAsyncError(async (req, res, next) =>{
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    })
})

// Delete messages 

export const deleteMessages = catchAsyncError(async (req, res, next) =>{
    const {id} = req.params;
    const message = await Message.findById(id);
    if(!message) {
        return next(new ErrorHandler("Message Already deleted", 400))
    }
    await message.deleteOne();
    res.status(200).json({
        success: true,
        message: "Message Deleted",
    })
})
