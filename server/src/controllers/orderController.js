import Order from '../model/orderModel.js';
import Product from '../model/productModel.js';

export async function createOrder(req,res,next) { try {
  const { productId, quantity = 1, name, email, phone, address, paymentMode } = req.body;
  if (![productId,name,email,phone,address,paymentMode].every((value)=>String(value || '').trim())) return res.status(400).json({success:false,message:'Complete all checkout details.'});
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({success:false,message:'Enter a valid email.'});
  if (!/^[+\d][\d\s-]{7,14}$/.test(phone)) return res.status(400).json({success:false,message:'Enter a valid phone number.'});
  const product = await Product.findById(productId); if (!product || !product.status) return res.status(404).json({success:false,message:'Product is unavailable.'});
  const qty = Math.max(1,Math.min(Number(quantity)||1,product.stock)); if (!qty || product.stock < qty) return res.status(409).json({success:false,message:'Requested quantity is out of stock.'});
  const order = await Order.create({ orderNumber:`WN${Date.now().toString().slice(-9)}`, studentObjectId:req.student._id, productObjectId:product._id, productName:product.name, productImage:product.image, quantity:qty, unitPrice:product.finalPrice, totalAmount:Number((product.finalPrice*qty).toFixed(2)), customer:{name,email,phone}, address, paymentMode, paymentStatus:paymentMode==='COD'?'Pending':'Completed' });
  product.stock -= qty; await product.save(); return res.status(201).json({success:true,message:'Order completed successfully.',order});
} catch(error){ return next(error); } }
export async function listMyOrders(req,res,next) { try { const items=await Order.find({studentObjectId:req.student._id}).sort({createdAt:-1}); return res.json({success:true,items}); } catch(error){return next(error);} }
export async function getMyOrder(req,res,next) { try { const item=await Order.findOne({_id:req.params.id,studentObjectId:req.student._id}); if(!item)return res.status(404).json({success:false,message:'Order not found.'}); return res.json({success:true,item}); } catch(error){return next(error);} }

const orderStatuses = ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const paymentStatuses = ['Pending', 'Completed'];

export async function listAdminOrders(req, res, next) {
  try {
    const query = {};
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();
    if (status && orderStatuses.includes(status)) query.orderStatus = status;
    if (search) {
      const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { orderNumber: expression },
        { productName: expression },
        { 'customer.name': expression },
        { 'customer.email': expression },
        { 'customer.phone': expression },
        { address: expression }
      ];
    }
    const items = await Order.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, items });
  } catch (error) {
    return next(error);
  }
}

export async function updateAdminOrder(req, res, next) {
  try {
    const updates = {};
    if (req.body.orderStatus !== undefined) {
      if (!orderStatuses.includes(req.body.orderStatus)) return res.status(400).json({ success: false, message: 'Invalid tracking status.' });
      updates.orderStatus = req.body.orderStatus;
    }
    if (req.body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(req.body.paymentStatus)) return res.status(400).json({ success: false, message: 'Invalid payment status.' });
      updates.paymentStatus = req.body.paymentStatus;
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'Choose a status to update.' });
    const item = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, message: 'Order status updated.', item });
  } catch (error) {
    return next(error);
  }
}
