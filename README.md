# CyberShop

A demo e-commerce web application built with **Node.js**, **Express**, and **EJS**, showcasing both **vulnerable** and **patched** implementations for educational penetration testing and security hardening.

---

## 🏷️ Branches

* **nonVulnerable**: Contains patched verson from intentional security flaws:

  * SQL Injection on Sign-Up & Sign-In
  * Reflected Cross-Site Scripting (XSS)
  * Cross-Site Request Forgery (CSRF)
  * Plain-text password storage, missing rate limits, and no security headers

* **Main**: All vulnerabilities have been fixed:

  * Parameterized SQL queries (`?` placeholders)
  * Escaped template output (`<%= … %>`)
  * CSRF tokens via `csurf` middleware
  * Password hashing (bcrypt), rate limiting, session regeneration, and security headers via Helmet

---

## 📥 Getting Started

### Prerequisites

* Node.js v16+ & npm
* MySQL 8.0 (local or Docker)

### Installation

1. **Clone** this repo:

   ```bash
   git clone https://github.com/HazemBelal/CS_VulnerableSiteProject.git
   cd CS_VulnerableSiteProject
   ```

2. **Checkout** the branch you want:

   ```bash
   # For vulnerable version
   git checkout main

   # Or for patched version
   git checkout nonVulenrable
   ```

3. **Install** dependencies:

   ```bash
   npm install
   ```

4. **Configure** your database in `config.js` (default: MySQL at `localhost:3306`, user `cybershop`, password `cs288`).

5. **Set up DB** (using Docker or native) and create the schema for example in docker:
   ```bash
   docker exec cyber-mysql mysql -ucybershop -pcs288 -D cybershop -e "
   CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(50) UNIQUE,
   password VARCHAR(64),
   email VARCHAR(100),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   CREATE TABLE products (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(100),
   description TEXT,
   price DECIMAL(10,2),
   image_path VARCHAR(255)
   );
   CREATE TABLE carts (
   id INT AUTO_INCREMENT PRIMARY KEY,
   user_id INT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES users(id)
   );
   CREATE TABLE cart_items (
   id INT AUTO_INCREMENT PRIMARY KEY,
   cart_id INT,
   product_id INT,
   quantity INT,
   FOREIGN KEY (cart_id) REFERENCES carts(id),
   FOREIGN KEY (product_id) REFERENCES products(id)
   );
   "

   ```

6. **Start** the server:

   ```bash
   npm start
   ```

7. **Browse** to `http://localhost:3000`.

---

## 🔍 Testing Vulnerabilities

### Vulnerable Branch

* **SQLi**: Attempt `admin' OR '1'='1` in Sign-In
* **XSS**: Use `<script>alert(1)</script>` in username field
* **CSRF**: Submit forms without tokens to see 403 bypass or silent state change

### Patched Branch

* Confirm the above attempts fail:

  ```bash
  curl -X POST http://localhost:3000/signin \
       -d "username=admin' OR '1'='1&password=foo"
  # Should return "Invalid credentials", not login
  ```
* Ensure no script execution and 403 on missing CSRF.

---

## 🛡️ Security Enhancements (Patched)

* **SQL**: Parameterized queries using `mysql2`
* **Templates**: Escaped output `<%= … %>`
* **CSRF**: `csurf` middleware + hidden `_csrf` fields + `X-CSRF-Token` header
* **Passwords**: Hashed with `bcrypt`
* **Rate Limiting**: `express-rate-limit` on auth endpoints
* **Sessions**: Regenerate session IDs on login
* **Headers**: `helmet` for CSP, HSTS, X-Frame-Options, etc.

---

## 📚 License

MIT © Hazem Belal and Youssef Alaadin
