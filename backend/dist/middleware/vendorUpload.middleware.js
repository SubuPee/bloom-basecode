"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVendorDocUpload = exports.uploadDir = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
// Ensure upload directory exists
exports.uploadDir = path_1.default.join(__dirname, "../../uploads/vendors");
if (!fs_1.default.existsSync(exports.uploadDir)) {
    fs_1.default.mkdirSync(exports.uploadDir, { recursive: true });
}
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, exports.uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const sanitizedBase = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_");
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
        cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
    },
});
// Allowed file types filter
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file format: ${file.mimetype}. Only PDF, PNG, JPG, JPEG, and WEBP files are allowed.`));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB maximum
    },
});
// Express middleware wrapper with error handling
const handleVendorDocUpload = (req, res, next) => {
    const uploadSingle = upload.single("file");
    uploadSingle(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: "File is too large. Maximum file size allowed is 10 MB.",
                });
                return;
            }
            res.status(httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Upload error: ${err.message}`,
            });
            return;
        }
        else if (err) {
            res.status(httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: err.message || "Failed to upload document",
            });
            return;
        }
        next();
    });
};
exports.handleVendorDocUpload = handleVendorDocUpload;
exports.default = {
    handleVendorDocUpload: exports.handleVendorDocUpload,
    uploadDir: exports.uploadDir,
};
//# sourceMappingURL=vendorUpload.middleware.js.map