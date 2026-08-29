const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    const extension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));

    const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(extension);

    // Accept normally valid MIME types,
    // or generic octet-stream when the extension is allowed.
    if (
        isMimeTypeAllowed ||
        (file.mimetype === "application/octet-stream" && isExtensionAllowed)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PDF, JPEG, PNG and WebP files are allowed"
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});

module.exports = upload;