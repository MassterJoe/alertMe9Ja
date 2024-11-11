const multer = require('multer');

// Setup multer storage configuration to use memory
const storage = multer.memoryStorage(); // Store images in memory as a buffer

const upload = multer({ storage: storage });

module.exports = upload;
