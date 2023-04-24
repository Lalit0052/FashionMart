const mongoose = require("mongoose")

const MaincategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Maincategory Must Be Required"]
    }
})
const Maincategory = new mongoose.model("Maincategory", MaincategorySchema)
module.exports = Maincategory