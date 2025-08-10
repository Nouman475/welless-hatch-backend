// routes/uploadRoutes.js
import express from "express";
import uploadController from "../../controllers/mics/uploadController.js";
import checkAuth from "../../middlewares/authMiddleware.js";
const router = express.Router();

// Single file upload
router.post("/single", checkAuth, uploadController.uploadSingle);

// Multiple file upload
router.post("/multiple", checkAuth, uploadController.uploadMultiple);

// Delete a file
router.delete("/:folderName/:filename", checkAuth, uploadController.deleteFile);

// List files in a folder
router.get("/:folderName", checkAuth, uploadController.listFiles);

export default router;
