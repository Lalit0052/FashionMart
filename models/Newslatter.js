const mongoose = require("mongoose")

const NewslatterSchema = new mongoose.Schema({
    gmail: {
        type: String,
        unique:true,
        required: [true, "Newslatter Must Be Required"]
    },
    date:{
        type:String,
        default:""
    }
})
const Newslatter = new mongoose.model("Newslatter", NewslatterSchema)
module.exports = Newslatter