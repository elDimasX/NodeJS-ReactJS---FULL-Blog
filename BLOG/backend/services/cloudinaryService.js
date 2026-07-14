
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.diskStorage({});
const upload = multer({
  
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens JPG, PNG ou WEBP são permitidas"));
    }
  }


});

// export const uploadProfile = async (req, res) =>
// {
//   try
//   {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "profile_images",
//       transformation: 
//       [
//         { width: 300, height: 300, crop: "fill" }
//       ]
//     });

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       {
//         profileImage: {
//           url: result.secure_url,
//           public_id: result.public_id
//         }
//       },
//       { new: true }
//     );

//     res.json(user);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

module.exports = { cloudinary, upload };
