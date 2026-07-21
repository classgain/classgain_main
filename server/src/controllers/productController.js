import Product from '../model/productModel.js';

const slugify = (value) => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productData = (body, files = [], current = {}) => {
  const price = Number(body.price ?? current.price ?? 0);
  const discount = Number(body.discount ?? current.discount ?? 0);
  // Data URLs remain available after restarts on hosts with ephemeral filesystems.
  const uploadedImages = files.map((file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
  const currentImages = Array.isArray(current.images) && current.images.length
    ? current.images
    : current.image ? [current.image] : [];
  const images = uploadedImages.length ? uploadedImages : currentImages;
  return {
    image: images[0],
    images,
    name: String(body.name ?? current.name ?? '').trim(),
    slug: `${slugify(body.name ?? current.name)}-${current._id || Date.now()}`,
    category: body.category ?? current.category,
    description: String(body.description ?? current.description ?? '').trim(),
    price, discount, finalPrice: Number((price * (1 - discount / 100)).toFixed(2)),
    fastDelivery: String(body.fastDelivery ?? current.fastDelivery) === 'true',
    smoothDelivery: String(body.smoothDelivery ?? current.smoothDelivery) === 'true',
    stock: Number(body.stock ?? current.stock ?? 0), brand: String(body.brand ?? current.brand ?? '').trim(),
    rating: Number(body.rating ?? current.rating ?? 0), status: String(body.status ?? current.status ?? true) === 'true'
  };
};

export async function createProduct(req, res, next) { try { const product = await Product.create(productData(req.body, req.files || [])); res.status(201).json({ success: true, message: 'Product added.', product }); } catch (e) { next(e); } }
export async function updateProduct(req, res, next) { try { const current = await Product.findById(req.params.id); if (!current) return res.status(404).json({ success: false, message: 'Product not found.' }); Object.assign(current, productData(req.body, req.files || [], current)); await current.save(); res.json({ success: true, message: 'Product updated.', product: current }); } catch (e) { next(e); } }
export async function deleteProduct(req, res, next) { try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ success: false, message: 'Product not found.' }); res.json({ success: true, message: 'Product deleted.' }); } catch (e) { next(e); } }
export async function getProduct(req, res, next) { try { const product = await Product.findById(req.params.id); if (!product) return res.status(404).json({ success: false, message: 'Product not found.' }); res.json({ success: true, product }); } catch (e) { next(e); } }
export async function listProducts(req, res, next) { try { const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12)); const filter = {}; if (req.query.category) filter.category = req.query.category; if (req.query.brand) filter.brand = req.query.brand; if (req.query.status !== 'all') filter.status = req.query.status === 'false' ? false : true; if (req.query.search) filter.$or = ['name','category'].map((key) => ({ [key]: { $regex: req.query.search, $options: 'i' } })); if (req.query.minPrice || req.query.maxPrice) filter.finalPrice = { ...(req.query.minPrice && { $gte: Number(req.query.minPrice) }), ...(req.query.maxPrice && { $lte: Number(req.query.maxPrice) }) }; const sorts = { newest: { createdAt: -1 }, priceAsc: { finalPrice: 1 }, priceDesc: { finalPrice: -1 }, discount: { discount: -1 } }; const [items,total] = await Promise.all([Product.find(filter).sort(sorts[req.query.sort] || sorts.newest).skip((page-1)*limit).limit(limit), Product.countDocuments(filter)]); res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total/limit) } }); } catch (e) { next(e); } }
export function listCategoryProducts(req, res, next) { req.query.category = req.params.category; return listProducts(req, res, next); }
