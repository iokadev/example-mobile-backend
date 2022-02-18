const fetch = require("node-fetch");
const express = require("express");
require("dotenv").config();
const app = express();

const PORT = 1337;
const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

app.use(express.json());

const user = {
  customer_id: "9PzJbto7sc",
  external_id: "3"
};

app.post("/checkout", async (req, res) => {
  const price = req.body.price;

  if (!price) {
    res.status(400);
    res.json({ error: "price must be present!" });
    return;
  }

  try {
    const order_access_token = await createOrder(price);
    const customer_access_token = await getCustomerById(user.customer_id);
    res.status(200);
    res.json({ order_access_token, customer_access_token });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/profile", async (req, res) => {
  const token = await getCustomerById(user.customer_id);
  res.json({ token: token });
});

const createOrder = async (price) => {
  const result = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    body: JSON.stringify({ amount: price }),
    headers: { "Content-Type": "application/json", "API-KEY": API_KEY },
  });
  const response = await result.json();
  return response.order.access_token;
};

const createCustomer = async (external_id) => {
  const result = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    body: JSON.stringify({ external_id }),
    headers: { "API-KEY": API_KEY },
  });
  const response = await result.json();
  return response.customer.access_token;
};

const getCustomerById = async (customer_id) => {
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
