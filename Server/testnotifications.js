const Expo = require("expo-server-sdk").default;

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notifications and optionally fetch receipts.
 * @param {string[]} pushTokens
 */
async function sendPushNotifications(pushTokens = []) {
  const tokens = pushTokens.length
    ? pushTokens
    : (process.env.EXPO_PUSH_TOKENS || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  if (!tokens.length) {
    console.warn("No Expo push tokens provided. Set EXPO_PUSH_TOKENS or pass tokens in.");
    return;
  }

  // Build messages
  const messages = [];
  for (const pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Invalid Expo push token: ${pushToken}`);
      continue;
    }

    messages.push({
      to: pushToken,
      subtitle: "Nuevo mensaje Sailbot WOW",
      title: "💬 Mensaje de Juan Perez",
      body: '¿Cuándo me van a responder?,\nquiero cancelar el "servicio".',
      data: {
        user_id: "2",
        username: "Juan Perez",
        channel: "whatsapp",
        unread_count: 1,
        message: {
          message_id: "123",
          incoming: true,
          status: "received",
          timestamp: Date.now(), // ms
          caption: '¿Cuándo me van a responder?,\nquiero cancelar el "servicio".',
        },
      },
    });
  }

  if (!messages.length) {
    console.warn("No valid messages to send (all tokens invalid?).");
    return;
  }

  // Send notification chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Ticket chunk:", ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Failed sending push chunk:", error?.message || error);
    }
  }

  // Collect receipt IDs
  const receiptIds = tickets
    .map((t) => t?.id)
    .filter(Boolean);

  if (!receiptIds.length) {
    console.log("No receipt IDs returned (some pushes may have failed to enqueue).");
    return;
  }

  // Optional delay (receipts may take a moment)
  const waitMs = Number(process.env.EXPO_RECEIPT_WAIT_MS || 5000);
  if (waitMs > 0) {
    console.log(`Waiting ${waitMs}ms before fetching receipts...`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  // Fetch receipts
  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (const chunk of receiptIdChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log("Receipts:", receipts);

      for (const receiptId in receipts) {
        const { status, message, details } = receipts[receiptId];

        if (status === "ok") continue;

        if (status === "error") {
          console.error(`Receipt error: ${message}`);
          if (details?.error) {
            console.error(`Error code: ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed fetching receipts:", error?.message || error);
    }
  }
}

async function main() {
  await sendPushNotifications();
  console.log("Done!");
}

// Run only when executed directly (not when imported)
if (require.main === module) {
  main().catch((e) => {
    console.error("Push script failed:", e);
    process.exit(1);
  });
}

module.exports = { sendPushNotifications };
