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
    const userId = req.session.userId;
    if (!userId) return res.redirect('/signin');
  
    // 1) Fetch all cart items + product data in one go
    const [rows] = await db.query(`
      SELECT
        ci.id             AS id,
        ci.quantity       AS quantity,
        p.id              AS productId,
        p.name            AS name,
        p.description     AS description,
        p.price           AS price,
        p.image_path      AS image_path
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      JOIN products p   ON ci.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
  
    // 2) Nest product fields under item.product
    const cartItems = rows.map(r => ({
      id:        r.id,
      quantity:  r.quantity,
      product: {
        id:           r.productId,
        name:         r.name,
        description:  r.description,
        price:        r.price,
        image_path:   r.image_path
      }
    }));
  
    // 3) Compute subtotal
    const subtotal = cartItems.reduce((sum, { product: p, quantity }) => 
      sum + p.price * quantity, 0
    );
  
    return res.render('cart', { cartItems, subtotal });
  });
  

// POST /cart/add
router.post('/cart/add', async (req, res) => {
    try {
      // Verify CSRF token automatically handled by middleware
      
      const { productId, quantity } = req.body;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // Rest of your cart logic...
      const [[ cartRow ]] = await db.query(
        'SELECT id FROM carts WHERE user_id = ?', [userId]
      );
      
      let cartId;
      if (cartRow) {
        cartId = cartRow.id;
      } else {
        const [ result ] = await db.query(
          'INSERT INTO carts (user_id) VALUES (?)', [userId]
        );
        cartId = result.insertId;
      }
  
      await db.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           quantity = quantity + VALUES(quantity)`,
        [cartId, productId, quantity]
      );
  
      const [[{ count }]] = await db.query(
        'SELECT SUM(quantity) AS count FROM cart_items WHERE cart_id = ?',
        [cartId]
      );
  
      return res.json({ 
        success: true,
        cartCount: count || 0
      });
      
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  

// Checkout stub
router.get('/checkout', (req, res) => {
  res.send('Checkout complete!');
});

module.exports = router;