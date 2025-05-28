// config.js
module.exports = {
    db: {
      host:     'cybershop.ch8wy06qw6yz.eu-north-1.rds.amazonaws.com',
      user:     'cybershop',    // MySQL user
      password: 'cs288',        // MySQL password
      database: 'cybershop',    // database name
      port:     3306            // optional, defaults to 3306
    },
    session: {
      secret: 'replace-with-a-very-secure-string',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // secure: true,       // enable if using HTTPS
        maxAge: 1000 * 60 * 60 * 2  // 2 hours
      }
    }
  };
  