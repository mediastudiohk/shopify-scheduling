// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from "cors";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
// const PORT = parseInt("10", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(cors());

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// initial call
// app.get(
//   "/api/create-session",
//   shopify.validateAuthenticatedSession(),
//   async (_req, res) => {
//     // console.log(res.locals);
//     writeSessionData(res.locals.shopify.session);
//     res.status(200);
//   }
// );

app.get(
  "/api/products/create",
  shopify.validateAuthenticatedSession(),
  async (_req, res) => {
    let status = 200;
    let error = null;

    try {
      await productCreator(res.locals.shopify.session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
  }
);

app.get(
  "/api/products/count",
  shopify.validateAuthenticatedSession(),
  async (_req, res) => {
    console.log(res.locals);
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
    // res.status(200).send({
    //   count: 33
    // });
  }
);

app.use(serveStatic(STATIC_PATH, { index: false }));

// All back-end code must be above must above this call
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
