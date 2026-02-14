const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const { initDatabase } = require("./database.js");
const { serverUp, verifyEndpoint } = require("./verification.js");
const { receiveWhatsApp, sendTextWA, sendTemplateWA } = require("./whatsapp.js");
const { receiveMessenger, sendTextFB } = require("./messenger.js");
const { receiveInstagram, sendTextIG } = require("./instagram.js");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const FB_BASE_URL = "https://graph.facebook.com/v14.0/";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Response Error:", error?.message);
    if (error?.response?.data) console.log(error.response.data);
    return Promise.reject(error);
  }
);

// basic CORS (simple + consistent)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function getConversations(req, res) {
  const users = database.users || {};
  const messages = database.messages || {};

  const conversations = Object.entries(users).map(([userId, user]) => {
    const userMessages = Object.values(messages).filter(
      (m) => m?.from === userId || m?.to === userId
    );

    const unreadCount = userMessages.filter(
      (m) => m?.from === userId && m?.status !== "read"
    ).length;

    const lastMessage =
      userMessages.sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0))[0] || null;

    const enrichedLastMessage = lastMessage
      ? { ...lastMessage, incoming: !lastMessage.to }
      : null;

    return {
      user_id: userId,
      username: user?.name || "Unknown",
      channel: user?.channel,
      profile_pic: user?.profile_pic,
      unread_count: unreadCount,
      message: enrichedLastMessage,
    };
  });

  res.json(conversations);
}

function getMessages(req, res) {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "Missing user_id" });

  const messages = database.messages || {};

  const result = Object.entries(messages)
    .map(([messageId, m]) => ({
      ...m,
      message_id: messageId,
      incoming: !m?.to,
    }))
    .filter((m) => m?.from === userId || m?.to === userId)
    .sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));

  res.json(result);
}

async function sendMessage(req, res) {
  const { channel, user_id: userId, text: messageText } = req.body || {};

  if (!channel || !userId || typeof messageText !== "string") {
    return res.status(400).json({ error: "Missing channel, user_id, or text" });
  }

  console.log(`Sending message to ${channel}: ${messageText}`);

  try {
    let messageId;

    if (channel === "whatsapp") {
      messageId = await sendTextWA(userId, messageText);
    } else if (channel === "messenger") {
      messageId = await sendTextFB(userId, messageText);
    } else if (channel === "instagram") {
      messageId = await sendTextIG(userId, messageText);
    } else {
      return res.status(400).json({ error: "Invalid channel" });
    }

    return res.send(messageId);
  } catch (error) {
    const status = error?.response?.status || 500;
    return res.status(status).json({ error: error?.message || "Send failed" });
  }
}

async function addIgAccount(req, res) {
  const userToken = req.body?.user_token;
  if (!userToken) return res.status(400).json({ error: "Missing user_token" });

  try {
    const accountsRes = await axios.get(`${FB_BASE_URL}me/accounts`, {
      params: { access_token: userToken },
    });

    const pageToken = accountsRes?.data?.data?.[0]?.access_token;
    if (!pageToken) return res.status(400).json({ error: "No page token found" });

    const igAccountRes = await axios.get(`${FB_BASE_URL}me`, {
      params: { fields: "instagram_business_account", access_token: pageToken },
    });

    const igId = igAccountRes?.data?.instagram_business_account?.id;
    if (!igId) return res.status(400).json({ error: "No IG business account found" });

    const usernameRes = await axios.get(`${FB_BASE_URL}${igId}`, {
      params: { fields: "username", access_token: pageToken },
    });

    const igUsername = usernameRes?.data?.username;
    database.instagram = { id: igId, name: igUsername, token: pageToken };
    database.update();

    return res.sendStatus(200);
  } catch (error) {
    const status = error?.response?.status || 500;
    return res.status(status).json({ error: error?.message || "IG setup failed" });
  }
}

function getIgUsername(req, res) {
  if (database.instagram?.name) return res.send(database.instagram.name);
  return res.send("Not logged in");
}

function addPhoneNumber(req, res) {
  const phoneNumber = req.body?.number;
  if (!phoneNumber) return res.status(400).json({ error: "Missing number" });

  const name = "Numero Desconocido";
  database.users[phoneNumber] = { channel: "whatsapp", name };
  database.update();

  res.send(name);
}

async function sendTemplate(req, res) {
  const { phone_number: phoneNumber, template_name: templateName, vars } = req.body || {};

  if (!phoneNumber || !templateName) {
    return res.status(400).json({ error: "Missing phone_number or template_name" });
  }

  try {
    const messageId = await sendTemplateWA(phoneNumber, templateName, vars);
    return res.send(messageId);
  } catch (error) {
    const status = error?.response?.status || 500;
    return res.status(status).json({ error: error?.message || "Template send failed" });
  }
}

// init + routes
initDatabase();
app.listen(PORT, serverUp);

app.get("/whatsapp", verifyEndpoint);
app.post("/whatsapp", receiveWhatsApp);

// Enable when you’re ready
// app.get("/messenger", verifyEndpoint);
// app.post("/messenger", receiveMessenger);
// app.get("/instagram", verifyEndpoint);
// app.post("/instagram", receiveInstagram);

app.get("/conversations", getConversations);
app.get("/messages", getMessages);
app.post("/message", sendMessage);

app.post("/template", sendTemplate);

// app.get("/ig_username", getIgUsername);
// app.put("/add_ig_account", addIgAccount);

app.put("/add_contact", addPhoneNumber); // TODO: add channel param
