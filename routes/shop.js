const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Middleware: require login
router.use((req, res, next) => {
  if (!req.session.userId && req.path !== '/catalog') {
    return res.redirect('/signin');
  }
  next();
});

// Public catalog
router.get('/catalog', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    // Convert price strings to numbers
    const processedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price)
    }));
    res.render('catalog', { 
      products: processedProducts, 
      user: req.session.userId 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error loading catalog');
  }
});

// Cart routes
router.get('/cart', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/signin');
  }
  
  try {
    // Get user's cart
    const [cart] = await db.query(
      'SELECT * FROM carts WHERE user_id = ?', 
      [req.session.userId]
    );
    
    if (cart.length === 0) {
      return res.render('cart', { 
        cartItems: [], 
        subtotal: 0,
        user: req.session.userId
      });
    }
    
    // Get cart items with product details
    const [cartItems] = await db.query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.description, p.price, p.image_path
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cart[0].id]);
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    res.render('cart', { 
      cartItems, 
      subtotal,
      user: req.session.userId
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).send('Error loading cart');
  }
});

router.post('/cart/add', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { productId, quantity } = req.body;
  
  try {
    // Find or create cart for user
    const [cart] = await db.query(
      'SELECT id FROM carts WHERE user_id = ?', 
      [req.session.userId]
    );
    
    let cartId;
    if (cart.length === 0) {
      const [result] = await db.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [req.session.userId]
      );
      cartId = result.insertId;
    } else {
      cartId = cart[0].id;
    }
    
    // Check if product already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    
    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      // Add new item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }
    
    // Get updated cart count
    const [[{ count }]] = await db.query(
      'SELECT SUM(quantity) as count FROM cart_items WHERE cart_id = ?',
      [cartId]
    );
    
    res.json({ success: true, cartCount: count || 0 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Checkout stub
router.get('/checkout', (req, res) => {
  res.send('Checkout complete!');
});

module.exports = router;