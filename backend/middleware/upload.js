const path   = require('path');
const fs     = require('fs');
const multer = require('multer');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const stamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${stamp}_${safeBase}${ext}`);
  }
});

const allowedExt  = ['.pdf', '.doc', '.docx'];
const allowedMime = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only PDF / DOC / DOCX resumes are allowed.'));
}

const maxMB = parseInt(process.env.MAX_RESUME_MB, 10) || 5;

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMB * 1024 * 1024 }
});

module.exports = { uploadResume };
