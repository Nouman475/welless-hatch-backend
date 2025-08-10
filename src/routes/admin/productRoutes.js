import express from "express";
import productController from "../../controllers/admin/productController.js";
import checkAdmin from "../../middlewares/AdminAuth.js";

const router = express.Router();

// add product
router.post("/addProduct", checkAdmin, productController.createProduct);

// get Products
router.get("/products", checkAdmin, productController.getAllProducts);

// update product
router.put("/updateProduct/:id", checkAdmin, productController.updateProduct);

// update product
router.delete("/deleteProduct/:id", checkAdmin, productController.deleteProduct);

export default router;
