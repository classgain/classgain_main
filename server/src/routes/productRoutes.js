import { Router } from 'express';
import multer from 'multer';
import { createProduct, deleteProduct, getProduct, listCategoryProducts, listProducts, updateProduct } from '../controllers/productController.js';
import { isSupportedImageFile, unsupportedImageError } from '../utils/imageFiles.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const supported = isSupportedImageFile(file);
    cb(supported ? null : unsupportedImageError(), supported);
  }
});
const router = Router();
router.get('/products', listProducts); router.get('/products/category/:category', listCategoryProducts); router.get('/products/:id', getProduct);
router.get('/admin/products', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, listProducts);
router.post('/admin/products', upload.array('images', 5), createProduct); router.put('/admin/products/:id', upload.array('images', 5), updateProduct); router.delete('/admin/products/:id', deleteProduct);
export default router;
