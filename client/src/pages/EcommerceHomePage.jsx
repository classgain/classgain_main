import { useEffect, useMemo, useState } from 'react';
import { Container, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API, fetchProducts, fetchProductsByCategory } from '../services/api';

const categories = ['Writing Things', 'Books & Notes', 'Electronics', 'Toys', 'Story Books', 'School Bags'];
const apiOrigin = API.replace(/\/api$/, '');

function resolveImage(path) {
  if (!path) return '';
  return /^https?:\/\//i.test(path) || path.startsWith('data:') ? path : `${apiOrigin}${path}`;
}

function productImages(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  return [...new Set([...images, product?.image].filter(Boolean))].map(resolveImage);
}

function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`product-image-placeholder ${className}`} aria-label={`${alt} image unavailable`}>Image unavailable</div>;
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}

function ProductDetailsModal({ product, onClose, onAddToCart }) {
  const images = product ? productImages(product) : [];
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => setSelectedImage(images[0] || ''), [product?._id]);
  if (!product) return null;

  return (
    <Modal show onHide={onClose} size="xl" centered dialogClassName="product-detail-modal">
      <Modal.Header closeButton><Modal.Title>{product.name}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="product-detail-layout">
          <div className="product-gallery">
            {images.length > 1 ? (
              <div className="product-gallery__thumbs">
                {images.map((image, index) => (
                  <button key={image} type="button" className={selectedImage === image ? 'active' : ''} onClick={() => setSelectedImage(image)}>
                    <ProductImage src={image} alt={`${product.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="product-gallery__main"><ProductImage src={selectedImage} alt={product.name} /></div>
          </div>
          <div className="product-detail-info">
            <span className="shop-product-card__type">{product.category}</span>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-detail-rating"><strong>{Number(product.rating || 0).toFixed(1)} ★</strong><span>{product.brand || 'Student Store'}</span></div>
            <div className="product-prices"><del>Rs. {product.price}</del><span>{product.discount}% off</span><strong>Rs. {product.finalPrice}</strong></div>
            <p className="product-stock">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
            <div className="delivery-badges">{product.fastDelivery && <span>Fast Delivery</span>}{product.smoothDelivery && <span>Smooth Delivery</span>}</div>
            <div className="product-detail-actions">
              <button type="button" disabled={product.stock < 1} onClick={() => onAddToCart(product)}>Add to Cart</button>
              <Link to="/ecommerce-orders" state={{ product }}>Buy Now</Link>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default function EcommerceHomePage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [brand, setBrand] = useState('');
  const [delivery, setDelivery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = { search, sort, brand, minPrice, maxPrice, limit: 100 };
    (category ? fetchProductsByCategory(category, params) : fetchProducts(params))
      .then((data) => active && setProducts(data.items || []))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [category, search, sort, brand, minPrice, maxPrice]);

  const visible = useMemo(() => products.filter((product) => !delivery || (delivery === 'fast' ? product.fastDelivery : product.smoothDelivery)), [products, delivery]);
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))];
  const addToCart = (product) => setCart((items) => [...items, product]);
  const removeFromCart = (indexToRemove) => setCart((items) => items.filter((_, index) => index !== indexToRemove));

  return (
    <div className="shop-page">
      <section className="shop-hero"><Container fluid="xl"><div className="shop-hero__content"><span className="home-hero__label">Student Store</span><h1>Everything students need, in one place.</h1><p>Click a product to view every photo and complete a secure checkout.</p></div><aside className="shop-cart-summary"><span>Cart Items</span><strong>{cart.length}</strong><p>Rs. {cart.reduce((sum, product) => sum + product.finalPrice, 0).toFixed(2)}</p></aside></Container></section>
      <section className="shop-products"><Container fluid="xl">
        {cart.length > 0 && <aside className="shop-cart-items" aria-label="Shopping cart"><h2>Your Cart</h2><div>{cart.map((product, index) => <article key={`${product._id}-${index}`}><ProductImage src={productImages(product)[0]} alt={product.name} /><span><strong>{product.name}</strong><small>Rs. {Number(product.finalPrice).toFixed(2)}</small></span><button type="button" onClick={() => setSelectedProduct(product)}>View Photos</button><button type="button" className="cart-remove" onClick={() => removeFromCart(index)} aria-label={`Remove ${product.name} from cart`}>Remove</button></article>)}</div></aside>}
        <nav className="shop-category-nav"><button className={!category ? 'active' : ''} onClick={() => setCategory('')}>All</button>{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</nav>
        <div className="shop-filters"><input type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="priceAsc">Price Low to High</option><option value="priceDesc">Price High to Low</option><option value="discount">Highest Discount</option></select><select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="">All Brands</option>{brands.map((item) => <option key={item}>{item}</option>)}</select><select value={delivery} onChange={(event) => setDelivery(event.target.value)}><option value="">All Delivery</option><option value="fast">Fast Delivery</option><option value="smooth">Smooth Delivery</option></select><input type="number" placeholder="Min price" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /><input type="number" placeholder="Max price" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></div>
        {loading ? <div className="shop-state"><Spinner animation="border" /> Loading products...</div> : error ? <div className="alert alert-danger">{error}</div> : !visible.length ? <div className="shop-state">No products match these filters.</div> : (
          <div className="shop-product-grid">{visible.map((product) => {
            const mainImage = productImages(product)[0];
            return <article className="shop-product-card" key={product._id} role="button" tabIndex="0" onClick={() => setSelectedProduct(product)} onKeyDown={(event) => event.key === 'Enter' && setSelectedProduct(product)}><ProductImage className="shop-product-image" src={mainImage} alt={product.name} /><div className="shop-product-card__body"><span className="shop-product-card__type">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="delivery-badges">{product.fastDelivery && <span>Fast Delivery</span>}{product.smoothDelivery && <span>Smooth Delivery</span>}</div><div className="product-prices"><del>Rs. {product.price}</del><span>{product.discount}% off</span><strong>Rs. {product.finalPrice}</strong></div><div className="product-actions" onClick={(event) => event.stopPropagation()}><button onClick={() => addToCart(product)}>Add to Cart</button><button onClick={() => setSelectedProduct(product)}>View Photos</button><Link to="/ecommerce-orders" state={{ product }}>Buy Now</Link></div></div></article>;
          })}</div>
        )}
      </Container></section>
      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
    </div>
  );
}
