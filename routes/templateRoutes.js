const Router = require("koa-router");
const templateModel = require("../models/templateModel");
const shopModel = require("../models/shopModel");
const router = new Router({ prefix: "/templates" });
const sample = require("../assets/sample.json");

router.get("/checkForName/:template_name", async(ctx) => {
    const name = ctx.params.template_name;
    console.log(name);
    try {
        const templateInstance = await templateModel.findOne({ name });
        var alreadyPresent = false;
        if (templateInstance) {
            alreadyPresent = true;
        }
        ctx.body = {};
        ctx.body.success = true;
        ctx.body.alreadyPresent = alreadyPresent;
        return ctx.send;
    } catch (err) {
        ctx.body = {};
        ctx.body.success = false;
        ctx.body.error = err;
        ctx.send.status = 400;
    }
});

router.get("/:templateID", async(ctx) => {
    const templateID = ctx.params.templateID;
    console.log(templateID);
    try {
        const templateInstance = await templateModel.findOne({ _id: templateID });
        if (!templateInstance) {
            ctx.body = {};
            ctx.body.success = false;
            ctx.body.error = Error("No such template present");
            return (ctx.send.status = 400);
        }
        ctx.body = {};
        ctx.body.template = templateInstance;
        ctx.send;
    } catch (err) {
        ctx.body = {};
        ctx.body.success = false;
        ctx.body.error = err;
        ctx.send.status = 400;
    }
});

router.post("/add/:shop_name", async(ctx) => {
    try {
        var shop_name = ctx.params.shop_name;
        console.log("Request to add template to ", shop_name);
        var shopInstance = await shopModel.findOne({ shop_name: shop_name });
        console.log(shopInstance);
        if (!shopInstance) {
            throw Error("Can't find store");
        }
        var templateData = {};
        ctx.request.body = JSON.parse(ctx.request.body);
        console.log("ctx.request.body- ", ctx.request.body);
        templateData.name = ctx.request.body.name;
        console.log(templateData);
        templateData.design = sample;
        var templateInstance = new templateModel({
            ...templateData,
        });
        templateInstance = await templateInstance.save();
        shopInstance.templates.push(templateInstance._id);
        await shopInstance.save({});
        //console.log(templateInstance);
        ctx.body = {};
        ctx.body.success = true;
        ctx.body.message = "Template Added Successfully";
        ctx.body.template = templateInstance;
        return ctx.send;
    } catch (err) {
        ctx.body = {};
        ctx.body.success = false;
        ctx.body.error = err.message;
        ctx.body.message = "Template not Added !";
        ctx.status = 400;
        ctx.send;
    }
});

router.patch("/update/:templateID", async(ctx) => {
    try {
        const templateID = ctx.params.templateID;
        ctx.request.body = JSON.parse(ctx.request.body);
        var templateInstance = await templateModel.findById(templateID);
        if (!templateInstance) {
            ctx.body = {};
            ctx.body.success = false;
            ctx.body.error = err;
            ctx.status = 400;
            return ctx.send;
        }
        const updates = Object.keys(ctx.request.body);
        const validUpdates = ["design"];
        const isValidUpdate = updates.every((update) => {
            return validUpdates.includes(update);
        });
        if (!isValidUpdate) {
            ctx.body = {};
            ctx.body.success = false;
            ctx.body.error = err;
            ctx.body.message = "Not a valid Update";
            ctx.status = 400;
            return ctx.send;
        }
        templateInstance.prevDesign = templateInstance.design;
        templateInstance.design = ctx.request.body.design;
        templateInstance = await templateInstance.save({});
        ctx.body = {};
        ctx.body.success = true;
        ctx.body.message = "Template Updated Successfully";
        ctx.body.template = templateInstance;
        return ctx.send;
    } catch (err) {
        ctx.body = {};
        ctx.body.success = false;
        ctx.body.message = "Template not Updated";
        ctx.body.error = err;
        ctx.status = 400;
        ctx.send;
    }
});

module.exports = router;