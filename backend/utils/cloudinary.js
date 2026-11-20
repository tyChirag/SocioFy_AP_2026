import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads", "avatars");

// Ensure local uploads directory exists for safe local fallback
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary if environment variables are provided
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Check if Cloudinary credentials are fully configured
 */
export const isCloudinaryConfigured = () => {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

/**
 * Upload an image buffer to Cloudinary (or local fallback storage)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - e.g. "image/jpeg"
 * @param {number|string} userId - ID of the user uploading
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadAvatarBuffer = async (buffer, mimeType, userId) => {
    if (isCloudinaryConfigured()) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "sociofy/profile-images",
                    resource_type: "image",
                    transformation: [
                        { width: 400, height: 400, crop: "fill", gravity: "face" },
                        { quality: "auto", fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        return reject(new Error("Cloudinary upload failed: " + error.message));
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            );
            uploadStream.end(buffer);
        });
    }

    // Local file fallback (when Cloudinary environment variables have not been configured yet)
    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    if (mimeType.includes("webp")) ext = "webp";

    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}/uploads/avatars/${filename}`;

    return {
        url,
        publicId: `local:${filename}`
    };
};

/**
 * Safely remove an avatar from storage
 * @param {string} publicId - Cloudinary public_id or local filename
 */
export const deleteAvatar = async (publicId) => {
    if (!publicId) return;

    try {
        if (publicId.startsWith("local:")) {
            const filename = publicId.replace("local:", "");
            const filePath = path.join(uploadsDir, filename);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } else if (isCloudinaryConfigured()) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
    } catch (err) {
        console.warn("Failed to clean up avatar:", err.message);
    }
};

export default cloudinary;
