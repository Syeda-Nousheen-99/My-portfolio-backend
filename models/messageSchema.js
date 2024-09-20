import mongoose  from "mongoose";

const messageSchema = new mongoose.Schema({
    senderName: {
        type: String,
        minLength: [2, "Name must contain at least 2 character"]
    },
    subject: {
        type: String,
        minLength: [2, "Subject must contain at least 2 character"]
    },
    message: {
        type: String,
        minLength: [2, "Message must contain at least 2 character"]
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
});

export const Message = mongoose.model("Messages", messageSchema)