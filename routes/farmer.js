var express = require('express');
var router = express.Router();
var Farmer = require('../models/farmer');
var Product = require('../models/product');
var Customer = require('../models/customer');
var config = require('../configuration/config')
var crypto = require('crypto');
var mime = require('mime');
var multer = require('multer');

// Storage for farmers image profile

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/farmers/')
  },
  filename: function (req, file, cb) {
    var name = req.user._id;
    cb(null, name + '.' + mime.extension(file.mimetype));    
  }
});

var upload = multer({ storage: storage });

// Storage for product image

var productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/products/')
  },
  filename: function (req, file, cb) {    

    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});

var uploadProductImage = multer({ storage: productStorage });

// Farmer Index
router.get('/', isLoggedIn, function (req, res, next){

	Farmer.findOne({ _id: req.user._id }, function (err, farmer){
		res.render('farmer/index', {farmer: farmer});
	});
});

// Edit farmer profile.
router.get('/edit', isLoggedIn, function(req, res, next){

    Farmer.findOne({ _id: req.user._id}, function (err, farmer){
        res.render('farmer/edit', {farmer: farmer})
    });

});

// Update farmer profile.

router.post('/edit', isLoggedIn, function(req, res){
    Farmer.findOne({ _id: req.user._id}, function (err, farmer){
        if(err){
            // TODO: Log error
            res.redirect('/i');
        } else {
            farmer.name = req.body.name;
            farmer.phone = req.body.phone;
            farmer.website = req.body.website;
            farmer.description = req.body.description;
            farmer.address = req.body.address;
            farmer.save(function (err, farmer){
                if(err){
                    // TODO: Log error
                    res.redirect('/farmer');
                } else {
                    // TODO: Send confirmation message.
                    res.redirect('/farmer');
                }
            });
        }
    });
});

// Products Methods.

// Get list of products

router.get('/products', isLoggedIn, function (req, res, next){

	Product.find({ farmer: req.user._id }, function (err, products){
		if(err){
			res.redirect('/farmer');
		} else {
            console.log(products);
			res.render('farmer/products', { products: products, farmer: req.user});
		}
	})
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price farmer posted rotten pictureUrl');

});

// Render view for inserting or updating
router.get('/products/new', isLoggedIn, function (req, res, next){

  res.render('farmer/newProduct', { farmer: req.user });
	
});

// Delete a product by _Id

router.post('/products/:id/delete', isLoggedIn, function (req, res){

    Product.findOne({ _id: req.params.id}, function (err, product){
        if(err){            
            res.redirect('/farmer/products');
        } else {
            product.remove(function (err, product){
                if(err){
                    console.log(err);
                } else {
                    res.redirect('/farmer/products');
                }
            });

        }
    });
});


// Add product with image

router.post('/products/new', uploadProductImage.single('productImage'), function (req, res, next) {

    if(req.body.id){
        // Update
        Product.findOne( { _id: req.body.id }, function (err, product){

            if(err){
                res.json({ type: false, data: 'Error occured: ' + err });
            } else {
                product.title = req.body.title;
                product.description = req.body.description;
                product.quantity = req.body.quantity;
                product.price = req.body.price;

                product.pictureUrl = req.file.filename;

                if(req.body.rotten)
                    product.rotten = req.body.rotten;

                product.farmer = req.user._id;

                product.save(function (err, product){

                    if(err){
                        res.redirect('/farmer');
                    } else {
                        res.redirect('/farmer/products');
                    }

                });
            }
        });

    } else {
        // Insert
        var product = new Product();
        product.title = req.body.title;
        product.description = req.body.description;
        product.quantity = req.body.quantity;
        product.price = req.body.price;

        product.pictureUrl = req.file.filename;

        if(req.body.rotten)
          product.rotten = req.body.rotten;

        product.farmer = req.user._id;

        product.save(function (err, product){
            if(err){
                res.redirect('/farmer');
            } else {
                res.redirect('/farmer/products');
            }

        });
    }

});


// Sets new image for farmer

router.post('/profileImage', upload.single('newImage'), function (req, res, next) {
    
    Farmer.findOne({ _id: req.user._id }, function (err, farmer){
        if(err){

        } else {
            farmer.pictureUrl = req.file.filename;
            farmer.save(function(err, farmer){
                if(err){

                } else {
                    res.redirect('/farmer');
                }
            });

        }

    });

});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
  	return next();
  }
  res.redirect('/login');
}

module.exports = router;
