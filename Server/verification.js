const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

function serverUp() {
  console.log("✅ Webhook server is listening...");
}

function verifyEndpoint(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (!VERIFY_TOKEN) {
    console.error("VERIFY_TOKEN is not set in environment variables.");
    return res.sendStatus(500);
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return res.status(200).send(challenge);
  }

  console.error("❌ Webhook verification failed. Tokens do not match.");
  return res.sendStatus(403);
}

module.exports = { serverUp, verifyEndpoint };
