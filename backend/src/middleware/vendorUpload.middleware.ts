import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { HTTP_STATUS } from "../constants/httpStatusCodes";

// Ensure upload directory exists
export const uploadDir = path.join(__dirname, "../../uploads/vendors");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

// Allowed file types filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format: ${file.mimetype}. Only PDF, PNG, JPG, JPEG, and WEBP files are allowed.`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
});

// Express middleware wrapper with error handling
export const handleVendorDocUpload = (req: Request, res: Response, next: NextFunction): void => {
  const uploadSingle = upload.single("file");

  uploadSingle(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "File is too large. Maximum file size allowed is 10 MB.",
        });
        return;
      }
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
      return;
    } else if (err) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message || "Failed to upload document",
      });
      return;
    }
    next();
  });
};

export default {
  handleVendorDocUpload,
  uploadDir,
};
