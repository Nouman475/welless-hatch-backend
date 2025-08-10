import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { AppError } from "../../middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  uploadsBasePath = path.join(__dirname, "../../../", "uploads");
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch (e) {
      if (e.code === "ENOENT") await fs.mkdir(dir, { recursive: true });
      else throw e;
    }
  }

  uniqueName(name) {
    const ext = path.extname(name);
    return `${path.basename(name, ext)}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
  }

  storage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          const folder = (req.body.folderName || "products").replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );
          const target = path.join(this.uploadsBasePath, folder);
          await this.ensureDir(target);
          cb(null, target);
        } catch (err) {
          cb(new AppError(`Dir creation failed: ${err.message}`, 500));
        }
      },
      filename: (req, file, cb) => cb(null, this.uniqueName(file.originalname)),
    });
  }

  fileFilter = (req, file, cb) =>
    cb(
      this.allowedMimeTypes.includes(file.mimetype)
        ? null
        : new AppError(`File type ${file.mimetype} not allowed`, 400),
      true
    );

  multerInstance = () =>
    multer({
      storage: this.storage(),
      limits: { fileSize: this.maxFileSize },
      fileFilter: this.fileFilter,
    });

  handleUpload =
    (method, field, maxFiles = 1) =>
    (req, res, next) => {
      const upload =
        method === "single"
          ? this.multerInstance().single(field)
          : this.multerInstance().array(field, maxFiles);

      upload(req, res, (err) => {
        if (err) return next(new AppError(err.message, 400));
        if (!req.file && !req.files?.length)
          return next(new AppError("No file uploaded", 400));

        const folder = (req.body.folderName || "products").replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );
        const files = (req.file ? [req.file] : req.files).map((f) => ({
          filename: f.filename,
          originalName: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          folder,
          fullPath: path.join("uploads", folder, f.filename),
          url: `/uploads/${folder}/${f.filename}`,
        }));

        res.status(200).json({
          status: "success",
          message: `${files.length} file(s) uploaded successfully`,
          data: method === "single" ? files[0] : { files, count: files.length },
        });
      });
    };

  uploadSingle = this.handleUpload("single", "file");
  uploadMultiple = this.handleUpload("multiple", "files", 10);

  deleteFile = async (req, res, next) => {
    try {
      const folder = req.params.folderName?.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filePath = path.join(
        this.uploadsBasePath,
        folder,
        req.params.filename
      );
      await fs.unlink(filePath);
      res.status(200).json({ status: "success", message: "File deleted" });
    } catch (e) {
      next(
        new AppError(
          e.code === "ENOENT" ? "File not found" : e.message,
          e.code === "ENOENT" ? 404 : 500
        )
      );
    }
  };

  listFiles = async (req, res, next) => {
    try {
      const folder = req.params.folderName?.replace(/[^a-zA-Z0-9_-]/g, "_");
      const folderPath = path.join(this.uploadsBasePath, folder);
      const files = await fs.readdir(folderPath);

      const details = await Promise.all(
        files.map(async (f) => {
          const stats = await fs.stat(path.join(folderPath, f));
          return {
            filename: f,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            fullPath: path.join("uploads", folder, f),
            url: `/uploads/${folder}/${f}`,
          };
        })
      );

      res
        .status(200)
        .json({
          status: "success",
          data: { folder, files: details, count: details.length },
        });
    } catch (e) {
      next(
        new AppError(
          e.code === "ENOENT" ? "Folder not found" : e.message,
          e.code === "ENOENT" ? 404 : 500
        )
      );
    }
  };
}

export default new UploadController();
