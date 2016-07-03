var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy  =  require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bodyParser = require('body-parser');
var config = require('../configuration/config')
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var Farmer = require('../models/farmer');
var Product = require('../models/product');
var Customer = require('../models/customer');
var isFarmer = true;

// Home page
router.get('/', function (req, res, next) {
  res.render('home', { title: 'Uni-Hack' });
});

// Login page
router.get('/login', function (req, res, next){
  var err = req.flash();
  res.render('login', { title: 'Login', error: err });
});

// Logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Login
router.post('/login', passport.authenticate('local-login',{
  successRedirect : '/farmer',
  failureRedirect : '/login',
  failureFlash : true
}));




// Get list of products for Buyer.

router.get('/products', function (req, res, next){

  Product.find({ }, function (err, products){
    if(err){
      res.redirect('/');
    } else {
      res.render('products', { products: products });
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten');

});


// Search products

router.post('/products', function(req, res){
  
  var terms = req.body.term.split(' ');
  var query = [];

  terms.forEach(function(entry){
    query.push( {title: new RegExp(entry, 'i')} );
    query.push( {description: new RegExp(entry, 'i')} );
  });
  
  Product.find({ }, function (err, products){
    if(err){
      res.redirect('/');
    } else {
      res.render('products', { products: products });
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten')
  .or(query);
});



// PassportJS Config.
passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
  },
  function (req, email, password, done){

    Farmer.findOne({ email: email }, function(err, farmer) {
        if (err) {
            return done(err);
        } else {

            if (farmer) {
                
                if(passwordHash.verify(password, farmer.password)) {
                    
                    farmer.token = "";
                    farmer.save(function (err, farmer){
                       isFarmer = true;
                        if(err){
                            return done(null, false, { message: err });
                        } else {
                            return done(null, farmer);
                        }
                        
                    });

                } else {
                    // Password is incorrect
                    return done(null, false, { message: 'La contraseña es incorrecta.' });
                }

                
            } else {
                // Email is incorrect
                return done(null, false, { message: 'No encontramos este Email.' });
            }
        }
    });

  }
));



// PassportJS Facebook configuration.

passport.use(new FacebookStrategy({
    clientID: config.FACEBOOK_CLIENT_ID,
    clientSecret: config.FACEBOOK_CLIENT_SECRET,
    callbackURL: config.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    

    Customer.findOne({ 'auth.email': profile._json.email, 'auth.facebookId': profile._json.id }, function (err, customer){
      if (err) {
             
          } else {

            if (customer){

              var token = jwt.sign(customer.personalInformation, config.SECRET, {
                    expiresIn: 2592000
                });

                  customer.auth.token = token;

                  customer.save(function (err, customer){
                    if (err){
                      console.log(err);
                    } else {
                      isFarmer = false;                   
                      return done(err, customer);
                    }
                  });
              

            } else {
              
              // Insert a new customer
              var customer = new Customer();

              customer.auth.facebookId = profile._json.id;
              customer.auth.email = profile._json.email;
              customer.personalInformation.name = profile._json.name;
              customer.pictureUrl = '0.png';

              // Generates the token for customer.
              var token = jwt.sign(customer.personalInformation, config.SECRET, {
                    expiresIn: 2592000 // expires in 30 days
                });

              customer.auth.token = token;

              customer.save(function (err, customer){
                    if (err){
                      console.log(err);
                    } else {
                      isFarmer = false;
                      return done(err, customer);
                    }
                  });

            }
          }
    });

  }
));

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/customer');
  });



passport.serializeUser(function(farmer, done) {

  done(null, farmer._id);

});



passport.deserializeUser(function(id, done) {

  if (isFarmer) {
    Farmer.findOne({ _id: id }, function(err, farmer) {
      done(err, farmer);
    });

  } else {
    Customer.findOne({ _id: id}, function(err, customer){
      done(err, customer);
    });

  }
 
});


// PassportJS Google Configuration.

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL
  },
  function(token, refreshToken, profile, done) {
    
    Customer.findOne({ 'auth.email': profile.emails[0].value, 'auth.googleId': profile.id }, function (err, customer){
          if (err) {
             console.log(err);
          } else {

            if (customer){

                  var token = jwt.sign(customer.personalInformation, config.SECRET, {
                        expiresIn: 2592000
                  });

                  customer.auth.token = token;

                  customer.save(function (err, customer){
                    if (err){
                      console.log(err);
                      
                    } else {
                      isFarmer = false;
                      return done(err, customer);
                    }
                  });
              

            } else {
              
              var customer = new Customer();

              customer.auth.googleId = profile.id;
              customer.auth.email = profile.emails[0].value;
              customer.personalInformation.name = profile.displayName;
              customer.pictureUrl = '0.png';

              var token = jwt.sign(customer.personalInformation, config.SECRET, {
                    expiresIn: 2592000
                });

              customer.auth.token = token;
              
              customer.save(function (err, customer){
                    if (err){
                      console.log(err);
                    } else {
                      isFarmer = false;
                      return done(err, customer);
                    }
              });

            }
          }
    });


  }
));

router.get('/auth/google',passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : '/customer',
    failureRedirect : '/login'
  })
);



// Sign up

router.get('/signup', function(req, res, next){
  res.render('signup', { title: 'Yobs- Registrate' });
});

router.post('/signup', function(req, res){
  Farmer.findOne({ email: req.body.email }, function(err, farmer) {
    if (err){
      console.log(err);
    } else {
      if (farmer){
        console.log('farmer email exists');
      } else {
        
        
        var c = new Farmer();
        c.email = req.body.email;
        c.password = passwordHash.generate(req.body.password);
        c.name = req.body.name;
        c.phone = req.body.phone;
        c.description = req.body.description;
        c.address = req.body.address;
        c.pictureUrl = '0.png';

        c.save(function(err, farmer){
          if(err){
            console.log(err);
          } else {
            res.redirect('/login');
          }
        });


      }
    }
  })

});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}


module.exports = router;