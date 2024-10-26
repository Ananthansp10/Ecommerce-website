const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});



//Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // folder in Cloudinary where the images will be stored
    format: async (req, file) => 'jpg', // supports promises, you can adjust format as needed
    public_id: (req, file) => `${file.originalname.split('.')[0]}-${Date.now()}`, // filename without extension
},
});

const upload = multer({ storage: storage });

module.exports = upload;
