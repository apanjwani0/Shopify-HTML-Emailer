const shopModel = require("../models/shopModel");
const templateModel = require("../models/templateModel");
const sample = require("../assets/sample.json");

// exports.getAllTemplates = async(shop_name) => {
//     try {
//         console.log(shop_name);
//         const shopInstance = await shopModel.findOne({ shop_name });
//         return shopInstance.templates;
//     } catch (err) {
//         throw err;
//     }
// };

exports.addShop = async(shop_name) => {
    try {
        var shopInstance = shopModel({
            shop_name,
        });
        var templateInstance = templateModel({
            name: "Sample-" + shop_name.replace(".myshopify.com", ""),
            design: sample,
        });
        templateInstance = await templateInstance.save({});
        shopInstance.templates = [templateInstance._id];
        shopInstance = await shopInstance.save({});
        return shopInstance;
    } catch (err) {
        throw err;
    }
};

exports.checkForShop = async(shop_name) => {
    var shopInstance = await shopModel.findOne({ shop_name });
    //console.log(shopInstance)
    if (!shopInstance) {
        return false;
    } else {
        return true;
    }
};