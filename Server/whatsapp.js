const fs = require("fs");
const path = require("path");
const axios = require("axios").default;

const FB_BASE_URL = "https://graph.facebook.com/v14.0/";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

function ensureMediaDir() {
  const dir = path.resolve(process.cwd(), "media");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function safeFilenameFromHeader(headerValue, fallback) {
  if (!headerValue) return fallback;
  // Example: attachment; filename="file.jpg"
  const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(headerValue);
  if (!match?.[1]) return fallback;

  return match[1].replace(/["']/g, "").trim() || fallback;
}

async function downloadMedia(mediaId) {
  if (!WHATSAPP_TOKEN) {
    console.warn("Missing WHATSAPP_TOKEN; cannot download media");
    return;
  }
  if (!mediaId) return;

  try {
    const metaRes = await axios.get(`${FB_BASE_URL}${mediaId}`, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    });

    const retrievalUrl = metaRes?.data?.url;
    if (!retrievalUrl) return;

    const mediaRes = await axios.get(retrievalUrl, {
      responseType: "stream",
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    });

    const mediaDir = ensureMediaDir();
    const header = mediaRes?.headers?.["content-disposition"];
    const filename = safeFilenameFromHeader(header, `${mediaId}.bin`);
    const filePath = path.join(mediaDir, `${mediaId}_${filename}`);

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      mediaRes.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`${filename} downloaded.`);
    database.media[mediaId] = { path: filePath };
    database.update();
  } catch (error) {
    console.warn("Media download failed:", error?.message || error);
  }
}

function receiveWhatsApp(req, res) {
  try {
    const value =
      req.body?.entry?.[0]?.changes?.[0]?.value;

    if (!value) return res.sendStatus(200);

    // Status updates
    if (Array.isArray(value.statuses) && value.statuses[0]) {
      const messageId = value.statuses[0].id;
      const status = value.statuses[0].status;

      if (messageId && database.messages?.[messageId]) {
        database.messages[messageId].status = status;
        database.update();
      }

      return res.sendStatus(200);
    }

    // Incoming messages
    if (Array.isArray(value.messages) && value.messages[0]) {
      const message = value.messages[0];
      const from = message.from;

      const username =
        value?.contacts?.[0]?.profile?.name || "Unknown";

      if (from) {
        database.users[from] = { channel: "whatsapp", name: username };
      }

      const messageId = message.id;
      const timestampMs = Number(message.timestamp) * 1000; // WA timestamp is seconds

      if (!messageId) return res.sendStatus(200);

      database.messages[messageId] = {
        from,
        timestamp: Number.isFinite(timestampMs) ? timestampMs : Date.now(),
        status: "delivered",
      };

      if (message.context?.id) {
        console.log("Received reply-to message " + message.context.id);
        const replyTo = database.messages?.[message.context.id];
        if (replyTo) {
          const otherUserId = replyTo.from || replyTo.to;
          database.messages[messageId].reply_to = {
            username: database.users?.[otherUserId]?.name || "Unknown",
            body: replyTo.caption || replyTo?.template?.name || "",
          };
        }
      }

      if (message.referral?.body) {
        console.log("Received referral: " + message.referral.body);
      }

      // Message content handling
      switch (message.type) {
        case "text": {
          database.messages[messageId].caption = message?.text?.body || "";
          break;
        }
        case "image": {
          const imageId = message?.image?.id;
          const caption = message?.image?.caption;
          if (imageId) downloadMedia(imageId);
          database.messages[messageId].image = { caption, media_id: imageId };
          break;
        }
        case "audio": {
          const audioId = message?.audio?.id;
          if (audioId) downloadMedia(audioId);
          database.messages[messageId].audio = { media_id: audioId };
          break;
        }
        case "video": {
          const videoId
