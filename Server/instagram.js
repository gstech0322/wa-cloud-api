const axios = require("axios").default;

const FB_BASE_URL = "https://graph.facebook.com/v14.0/";

function receiveInstagram(req, res) {
  try {
    const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];

    entries.forEach((entry) => {
      const messaging = entry?.messaging?.[0];
      if (!messaging) return;

      const userId = messaging?.sender?.id;
      if (!userId) return;

      // Delivery receipt
      if (messaging.delivery) {
        console.log("Delivered notification received.");
        return;
      }

      // Read receipt
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

      // Ignore echo messages
      if (messaging.message?.is_echo) {
        console.log("Received echo message (self).");
        return;
      }

      const instagramToken = database?.instagram?.token;
      if (!instagramToken) {
        console.warn("Missing Instagram token in database.instagram.token");
        return;
      }

      // Fetch user profile (non-blocking)
      axios
        .get(`${FB_BASE_URL}${userId}`, {
          params: {
            access_token: instagramToken,
            // request fields explicitly (Graph API best practice)
            fields: "id,name,profile_pic",
          },
        })
        .then((response) => {
          const data = response?.data;
          if (data?.id) {
            const username = data.name;
            const profilePic = data.profile_pic;

            database.users[userId] = {
              channel: "instagram",
              name: username,
              profile_pic: profilePic,
            };
            database.update(); // async update
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch IG user profile:", err?.message || err);
        });

      const messageId = messaging.message?.mid;
      const timestamp = messaging.timestamp; // FB usually provides ms. keep as-is consistently.

      if (!messageId || typeof timestamp !== "number") return;

      database.messages[messageId] = {
        from: userId,
        timestamp,
        status: "delivered",
        text: {
          body: messaging.message?.text || "",
        },
      };
    });

    database.update();
    return res.sendStatus(200);
  } catch (error) {
    console.error("receiveInstagram error:", error);
    // Still return 200 to avoid webhook retries storms, unless you WANT retries
    return res.sendStatus(200);
  }
}

async function sendTextIG(userId, textMsg) {
  const instagramToken = database?.instagram?.token;
  if (!instagramToken) throw new Error("Missing Instagram token");
  if (!userId) throw new Error("Missing userId");
  if (typeof textMsg !== "string" || !textMsg.trim()) throw new Error("Message is empty");

  try {
    const response = await axios.post(
      `${FB_BASE_URL}me/messages`,
      {
        recipient: { id: userId },
        message: { text: textMsg },
      },
      {
        params: { access_token: instagramToken },
        headers: { "Content-Type": "application/json" },
      }
    );

    const messageId = response?.data?.message_id;
    if (!messageId) {
      throw new Error("Instagram API did not return message_id");
    }

    database.messages[messageId] = {
      to: userId,
      timestamp: Date.now(), // keep timestamps consistent with receiveInstagram (ms)
      status: "sent",
      text: { body: textMsg },
    };

    database.update();
    return messageId;
  } catch (error) {
    throw error;
  }
}

module.exports = { receiveInstagram, sendTextIG };
