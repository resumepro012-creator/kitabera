import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per PDF
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('Only PDF files are allowed.'));
      return;
    }
    callback(null, true);
  }
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Writer avatars must be image files.'));
      return;
    }
    callback(null, true);
  }
});
