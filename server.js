const fetch = require("node-fetch");
const express = require("express");
require("dotenv").config();
const app = express();

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 1337;

app.use(express.json());

const test_customers = {
  flutter: {
    id: "6CoCFjzeXJ",
    external_id: "flutter_sdk_test_customer",
    access_token:
      "6CoCFjzeXJ_secret_f4bf0b8e2bf8a3f8495ed17ac74cef7ee76229a8c794009f41dd3a01bc901f94",
  },
  ios: {
    id: "o7z5cdgS1y",
    external_id: "ios_sdk_test_customer",
    access_token:
      "o7z5cdgS1y_secret_ce29b4fc608a63e4b069e26037c231c0e1afa2fce577fec99653c45bdbbdc2bb",
  },
  android: {
    id: "AWBqRMOwka",
    external_id: "android_sdk_test_customer",
    access_token:
      "AWBqRMOwka_secret_692f44484a490c3bbab0ce741798212518ed50d9afdfb733a4927547dcc81a0c",
  },
};

app.get("/", async (req, res) => {
  res.json({ status: "ok" });
});

app.post("/checkout", async (req, res) => {
  const price = req.body.price;
  var platform = req.query.platform;

  if (!platform) {
    res.status(400);
    res.json({ error: "platform must be present!" });
    return;
  }

  if (!price) {
    res.status(400);
    res.json({ error: "price must be present!" });
    return;
  }

  var platform = platform.toLowerCase();

  if (platform !== "ios" && platform !== "android" && platform !== "flutter") {
    res.status(400);
    res.json({ error: "platform must be either ios, android or flutter!" });
    return;
  }

  const customer = test_customers[platform];

  try {
    const order_access_token = await create_order(price);
    const customer_access_token = await get_customer_by_id(customer.id);
    res.status(200);
    res.json({ order_access_token, customer_access_token });
  } catch (error) {
    res.status(502);
    res.json({ error: error.message });
  }
});

app.get("/profile", async (req, res) => {
  var platform = req.query.platform;

  if (!platform) {
    res.status(400);
    res.json({ error: "platform must be present!" });
    return;
  }

  platform = platform.toLowerCase();

  if (platform !== "ios" && platform !== "android" && platform !== "flutter") {
    res.status(400);
    res.json({ error: "platform must be either ios, android or flutter!" });
    return;
  }

  const customer = test_customers[platform];
  const customer_access_token = await get_customer_by_id(customer.id);
  res.status(200);
  res.json({ customer_access_token });
});

const create_order = async (price) => {
  const result = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    body: JSON.stringify({ amount: price }),
    headers: { "Content-Type": "application/json", "API-KEY": API_KEY },
  });
  const response = await result.json();
  return response.order.access_token;
};

const get_customer_by_id = async (customer_id) => {
  const result = await fetch(`${BASE_URL}/customers/${customer_id}`, {
    method: "GET",
  });
  const response = await result.json();
  return response.access_token;
};


app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
