const mongoose = require("mongoose")

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name Must Be Required"]
    },
    gmail: {
        type: String,
        required: [true, "Email Must Be Required"]
    },
    phone: {
        type: Number,
        required: [true, "Phone No Must Be Required"]
    },
    subject: {
        type: String,
        required: [true, "Subject Area Must Be Required"]
    },
    message: {
        type: String,
        required: [true, "Message Must Be Required"]
    },
    status:{
        type:String,
        default:"Active"
    },
    date:{
        type:String,
        default:""
    }
})
const Contact = new mongoose.model("Contact", ContactSchema)
module.exports = Contact