const axios = require("axios").default;

const FB_BASE_URL = "https://graph.facebook.com/v14.0/";
const MESSENGER_TOKEN = process.env.MESSENGER_TOKEN || "";

function receiveMessenger(req, res) {
  try {
    const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];

    entries.forEach((entry) => {
      const messaging = entry?.messaging?.[0];
      if (!messaging) return;

      const userId = messaging?.sender?.id;
      if (!userId) return;

      if (messaging.delivery) {
        console.log("Delivered notification received.");
        return;
      }

      if (messaging.read?.watermark) {
        const readTime = messaging.read.watermark;

        Object.values(database.messages || {}).forEach((message) => {
          if (
            message?.to === userId &&
            typeof message.timestamp === "number" &&
            message.timestamp <= readTime
          ) {
            message.status = "read";
          }
        });

        console.log("Message marked as read.");
        database.update();
        return;
      }

      if (messaging.message?.is_echo) {
        console.log("Received echo message (self).");
        return;
      }

      if (!MESSENGER_TOKEN) {
        console.warn("Missing MESSENGER_TOKEN");
        return;
      }

      // Fetch user profile (non-blocking)
      axios
        .get(`${FB_BASE_URL}${userId}`, {
          params: {
            access_token: MESSENGER_TOKEN,
            fields: "id,first_name,last_name,profile_pic",
          },
        })
        .then((response) => {
          const data = response?.data;
          if (data?.id) {
            const username = `${data.first_name || ""} ${data.last_name || ""}`.trim();

            database.users[userId] = {
              channel: "messenger",
              name: username || "Unknown",
              profile_pic: data.profile_pic,
            };
            database.update(); // async update
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch FB user profile:", err?.message || err);
        });

      const messageId = messaging.message?.mid;
      const timestamp = messaging.timestamp;

      if (!messageId || typeof timestamp !== "number") return;

      database.messages[messageId] = {
        from: userId,
        timestamp, // FB usually provides ms
        status: "delivered",
        text: { body: messaging.message?.text || "" },
      };
    });

    database.update();
    return res.sendStatus(200);
  } catch (error) {
    console.error("receiveMessenger error:", error);
    // Return 200 to avoid repeated webhook retries unless you want them
    return res.sendStatus(200);
