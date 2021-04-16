require("isomorphic-fetch");
const dotenv = require("dotenv");
const Koa = require("koa");
//var bodyParser = require("koa-bodyparser");
const koaBody = require("koa-body");
const mongo = require("mongoose");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const { default: Shopify, ApiVersion } = require("@shopify/shopify-api");
const Router = require("koa-router");
const session = require("koa-session");
const { addShop, checkForShop } = require("./functions/shopFuntions");
const shopRouter = require("./routes/shopRoutes");
const templateRouter = require("./routes/templateRoutes");

dotenv.config();

Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
    HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
    API_VERSION: ApiVersion.October20,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = new Koa();
    const router = new Router();
    server.keys = [Shopify.Context.API_SECRET_KEY];
    mongo.connect(
        process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
        },
        (err) => {
            if (!err) {
                console.log("DB Connected");
            } else {
                console.log("Can't connect to DB - ", err.message);
            }
        }
    );
    //server.use(bodyParser());
    server.use(koaBody());
    server.use(session(server));
    server.use(
        createShopifyAuth({
            afterAuth(ctx) {
                const { shop, scope } = ctx.state.shopify;
                console.log(scope);
                checkForShop(shop).then((shopVerified) => {
                    if (shopVerified) {
                        ctx.redirect(`/?shop=${shop}`);
                    } else {
                        addShop(shop)
                            .then(() => {
                                ctx.redirect(`/?shop=${shop}`);
                            })
                            .catch((err) => {
                                throw err;
                            });
                    }
                });
            },
        })
    );

    const handleRequest = async(ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    };

    router.get("/", async(ctx) => {
        const shop = ctx.query.shop;
        console.log("shop - ", shop);
        try {
            var shopVerfied = await checkForShop(shop);
            //console.log(shopInstance)
            if (!shopVerfied) {
                ctx.redirect(`/auth?shop=${shop}`);
            } else {
                await handleRequest(ctx);
            }
        } catch (err) {
            ctx.redirect(`/auth?shop=${shop}`);
        }
        // if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        //     ctx.redirect(`/auth?shop=${shop}`);
        // } else {
        //     await handleRequest(ctx);
        // }
    });

    router.get("(/_next/static/.*)", handleRequest);
    router.get("/_next/webpack-hmr", handleRequest);
    //router.get("(.*)", verifyRequest(), handleRequest);

    server.use(router.allowedMethods());
    server.use(router.routes());
    server.use(shopRouter.routes());
    server.use(templateRouter.routes());

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});