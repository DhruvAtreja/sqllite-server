const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Function to delete old files
const deleteOldFiles = () => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const currentTime = Date.now();
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats for ${file}:`, err);
          return;
        }
        const fileAge = currentTime - stats.mtime.getTime();
        if (fileAge > 14400000) {
          // 4 hours in milliseconds
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${file}:`, err);
            } else {
              console.log(`Deleted old file: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Set up interval to run deleteOldFiles every hour
setInterval(deleteOldFiles, 3600000);

// Endpoint for uploading .sqlite files
app.post("/upload-sqlite", upload.single("sqliteFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUuid = uuidv4();
  const newFilePath = `uploads/${fileUuid}.sqlite`;
  console.log(newFilePath);

  fs.rename(req.file.path, newFilePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving file" });
    }
    res.json({ uuid: fileUuid });
  });
});

// Endpoint for executing SQL queries on uploaded databases
app.post("/execute-query", (req, res) => {
  const { uuid, query } = req.body;

  if (!uuid || !query) {
    return res.status(400).json({ error: "Missing uuid or query" });
  }

  const dbPath = `uploads/${uuid}.sqlite`;

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "Database not found" });
  }

  const db = new sqlite3.Database(dbPath);

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ results: rows });
  });

  db.close();
});

// Endpoint for retrieving database schema
app.get("/get-schema/:uuid", (req, res) => {
  const uuid = req.params.uuid;

  if (!uuid) {
    return res.status(400).json({ error: "Missing uuid" });
  }

  const dbPath = `uploads/${uuid}.sqlite`;

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "Database not found" });
  }

  const db = new sqlite3.Database(dbPath);

  db.all(
    "SELECT name, sql FROM sqlite_master WHERE type='table';",
    [],
    (err, tables) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      const schema = [];

      const processTable = (index) => {
        if (index >= tables.length) {
          db.close();
          return res.json({ schema: schema.join("\n") });
        }

        const { name: tableName, sql: createStatement } = tables[index];
        schema.push(`Table: ${tableName}`);
        schema.push(`CREATE statement: ${createStatement}\n`);

        db.all(`SELECT * FROM '${tableName}' LIMIT 3;`, [], (err, rows) => {
          if (err) {
            console.error(`Error fetching rows for table ${tableName}:`, err);
          } else if (rows.length > 0) {
            schema.push("Example rows:");
            rows.forEach((row) => schema.push(JSON.stringify(row)));
          }
          schema.push(""); // Add a blank line between tables
          processTable(index + 1);
        });
      };

      processTable(0);
    }
  );
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3001, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
