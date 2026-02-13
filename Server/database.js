const fs = require("fs");
const path = require("path");

function initDatabase() {
  const dbFilename = path.resolve(__dirname, "database.json");

  // Default structure
  const defaultDB = {
    users: {},
    messages: {},
    media: {},
  };

  // Initialize global database
  global.database = { ...defaultDB };

  if (fs.existsSync(dbFilename)) {
    try {
      const rawData = fs.readFileSync(dbFilename, "utf8");
      global.database = JSON.parse(rawData);
    } catch (error) {
      console.error("Failed to read or parse database.json. Using default DB.", error);
      global.database = { ...defaultDB };
    }
  } else {
    // Create file if it doesn't exist
    fs.writeFileSync(dbFilename, JSON.stringify(defaultDB, null, 2));
  }

  // Attach update method
  global.database.update = () => {
    try {
      fs.writeFileSync(
        dbFilename,
        JSON.stringify(global.database, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Failed to write database file:", error);
    }
  };
}

module.exports = { initDatabase };
