const Router = require("koa-router");
const shopModel = require("../models/shopModel");
const router = new Router({ prefix: "/shop" });

router.get("/:shop_name", async(ctx) => {
    const shop_name = ctx.params.shop_name;
    console.log("here", shop_name);
    try {
        console.log(shop_name);
        const shopInstance = await shopModel
            .findOne({ shop_name })
            .populate("templates", "name createdAt updatedAt");
        ctx.body = {};
        //console.log(shopInstance);
        ctx.body.success = true;
        ctx.body.templates = shopInstance.templates;
        return ctx.send;
    } catch (err) {
        ctx.body = {};
        ctx.body.success = false;
        ctx.body.error = err;
        ctx.send.status = 400;
    }
});

module.exports = router;