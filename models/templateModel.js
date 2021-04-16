const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    design: {
        type: Object,
    },
    prevDesign: {
        type: Object,
    },
}, { timestamps: true });

module.exports = mongoose.model("templates", schema);