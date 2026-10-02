const express = require("express");
const multer = require("multer");

const cloudinary = require("../config/cloudinary");
const { analyzeCreative } = require("../services/aiService");

const {
  saveCreative,
  getAllCreatives,
} = require("../services/creativeStore");

const router = express.Router();

// ==========================================
// FILE UPLOAD CONFIGURATION
// ==========================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// ==========================================
// UPLOAD + ANALYZE CREATIVE
// ==========================================

router.post(
  "/upload",
  upload.single("creative"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      console.log("=================================");
      console.log("CREATIVE UPLOAD STARTED");
      console.log("=================================");

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Size:",
        req.file.size,
        "bytes"
      );

      console.log(
        "MIME:",
        req.file.mimetype
      );

      // ==========================================
      // 1. UPLOAD IMAGE TO CLOUDINARY
      // ==========================================

      console.log(
        "Uploading image to Cloudinary..."
      );

      const cloudinaryResult =
        await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "insightforge/creatives",
                  resource_type: "image",
                },
                (error, result) => {
                  if (error) {
                    console.error(
                      "Cloudinary upload error:",
                      error
                    );

                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.on(
              "error",
              (error) => {
                console.error(
                  "Cloudinary stream error:",
                  error
                );

                reject(error);
              }
            );

            stream.end(req.file.buffer);
          }
        );

      console.log(
        "Cloudinary upload successful!"
      );

      console.log(
        "Cloudinary URL:",
        cloudinaryResult.secure_url
      );

      // ==========================================
      // 2. ANALYZE IMAGE WITH GROQ
      // ==========================================

      console.log(
        "Sending image to Groq..."
      );

      const analysis =
        await analyzeCreative(
          cloudinaryResult.secure_url
        );

      console.log(
        "AI analysis successful!"
      );

      // ==========================================
      // 3. SAVE CREATIVE
      // ==========================================

      saveCreative(
        req.file.originalname,
        {
          url:
            cloudinaryResult.secure_url,

          publicId:
            cloudinaryResult.public_id,

          width:
            cloudinaryResult.width,

          height:
            cloudinaryResult.height,

          analysis,
        }
      );

      console.log(
        "Creative analysis saved!"
      );

      // ==========================================
      // 4. SEND RESPONSE TO FRONTEND
      // ==========================================

      return res.status(201).json({
        message:
          "Creative analyzed successfully",

        url:
          cloudinaryResult.secure_url,

        publicId:
          cloudinaryResult.public_id,

        width:
          cloudinaryResult.width,

        height:
          cloudinaryResult.height,

        analysis,
      });
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "CREATIVE ANALYSIS ERROR"
      );

      console.error(
        "================================="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Full Error:",
        error
      );

      console.error(
        "================================="
      );

      return res.status(500).json({
        message:
          "Creative analysis failed",

        error:
          error?.message ||
          "Unknown error",
      });
    }
  }
);

// ==========================================
// GET STORED CREATIVES
// ==========================================

router.get(
  "/stored",
  (req, res) => {
    try {
      const creatives =
        getAllCreatives();

      return res.json({
        count: creatives.length,
        creatives,
      });
    } catch (error) {
      console.error(
        "Failed to get stored creatives:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to retrieve stored creatives",

        error:
          error?.message ||
          "Unknown error",
      });
    }
  }
);

module.exports = router;