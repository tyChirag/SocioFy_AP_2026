import multer from "multer";
import path from "path";

// Supported image MIME types and extensions
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// 1. Multer memory storage configuration (keeps file in memory buffer for validation and upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mime)) {
        return cb(
            new Error("Unsupported file format. Please upload a JPG, PNG, or WebP image."),
            false
        );
    }

    cb(null, true);
};

export const avatarUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB maximum
    },
    fileFilter
});

/**
 * Validates actual binary content (magic bytes) to ensure file is genuinely a JPG, PNG, or WebP
 */
export const validateImageBuffer = (req, res, next) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({
            success: false,
            message: "No image file provided."
        });
    }

    const buffer = req.file.buffer;

    // Check minimum length for magic bytes
    if (buffer.length < 12) {
        return res.status(400).json({
            success: false,
            message: "Invalid image file format."
        });
    }

    // 1. JPEG signature: 0xFF 0xD8 0xFF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // 2. PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a;

    // 3. WebP signature: RIFF at 0..3 and WEBP at 8..11
    const isRiff =
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp =
        isRiff &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
        return res.status(400).json({
            success: false,
            message: "Invalid file content. The file is not a valid JPG, PNG, or WebP image."
        });
    }

    next();
};

/**
 * Middleware to handle Multer errors (e.g. file size limit exceeded)
 */
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Image size exceeds the 5 MB limit. Please select a smaller photo."
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Failed to process image file."
        });
    }
    next();
};
