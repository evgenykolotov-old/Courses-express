const multer = require('multer');

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, 'images');
  },
  filename(request, file, callback) {
    callback(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (request, file, callback) => {
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
}

module.exports = multer({ storage, fileFilter });