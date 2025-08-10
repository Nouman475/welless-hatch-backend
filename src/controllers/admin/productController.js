import cleanReqBody from "../../helpers/sanitize.js";
import Product from "../../Models/Product.js";
import { AppError } from "../../middlewares/errorMiddleware.js";

export default class ProductController {
  static async createProduct(req, res, next) {
    try {
      const sanitizedBody = cleanReqBody(req.body);

      const product = await Product.create(sanitizedBody);

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async getAllProducts(req, res, next) {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(
        id,
        cleanReqBody(req.body),
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) return next(new AppError("Product not found", 404));

      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) return next(new AppError("Product not found", 404));

      res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err) {
      next(err);
    }
  }
}
