const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads/backups folder ከሌለ ፍጠር
const backupDir = path.join(__dirname, "../uploads/backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, backupDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `restore_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) !== ".sql") {
    return cb(new Error("Only SQL files are allowed."));
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
});