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
