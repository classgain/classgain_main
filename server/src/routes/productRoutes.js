import { Router } from 'express';
import multer from 'multer';
import { createProduct, deleteProduct, getProduct, listCategoryProducts, listProducts, updateProduct } from '../controllers/productController.js';

const supportedImageTypes = new Set(['image/jpeg', 'image/png']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const supported = supportedImageTypes.has(file.mimetype);
    cb(supported ? null : new Error('Only JPG, JPEG, and PNG product photos are allowed.'), supported);
  }
});
const router = Router();
router.get('/products', listProducts); router.get('/products/category/:category', listCategoryProducts); router.get('/products/:id', getProduct);
router.post('/admin/products', upload.array('images', 5), createProduct); router.put('/admin/products/:id', upload.array('images', 5), updateProduct); router.delete('/admin/products/:id', deleteProduct);
export default router;
