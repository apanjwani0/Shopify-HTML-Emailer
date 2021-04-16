const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    shop_name: {
        type: String,
        unique: true,
    },
    templates: [{
        type: mongoose.Schema.Types.ObjectId,
        //required: true,
        ref: "templates",
    }, ],
    emails: [{
        type: String,
        trim: true,
    }, ],
    defaultEmail: {
        type: String,
    },
}, { timestamps: true });

//console.log("mongoose models-", mongoose.models);

module.exports = mongoose.model("shops", schema);