var express = require('express');
var router = express.Router();
var Customer = require('../models/customer');
var Product = require('../models/product');
var moment = require('moment');
var mime = require('mime');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/customers/')
  },
  filename: function (req, file, cb) {
    var name = req.user._id;
    cb(null, name + '.' + mime.extension(file.mimetype));
  }
});

var upload = multer({ storage: storage });


router.get('/', isLoggedIn, function(req, res, next) {
  console.log(req.user);
  	res.render('customer/index', { customer: req.user, moment: moment });
});

router.get('/edit', isLoggedIn, function(req, res, next){
	res.render('customer/edit', { customer: req.user });
});


router.post('/edit', isLoggedIn, function(req, res){

	Customer.findOne({ _id: req.user._id }, function (err, customer) {
		if (err) {
			console.log(err);
      
		} else {

			customer.personalInformation.name = req.body.name;
			customer.personalInformation.phone = req.body.phone;
			customer.personalInformation.birthDate = req.body.birthDate;
			customer.personalInformation.email = req.body.email;
			customer.about = req.body.about;

			
			customer.save(function (err, customer) {
				if (err) {
					// Internal Error.
					
				} else {
					res.redirect('/customer');
				}
			});

		}
	});

});


router.post('/profileImage', upload.single('newImage'), function (req, res, next) {
    
    Customer.findOne({ _id: req.user._id }, function (err, customer){
        if(err){

        } else {
            customer.pictureUrl = req.file.filename;
            customer.save(function(err, customer){
                if(err){

                } else {
                    res.redirect('/customer');
                }
            });
            
        }
        
    });

});

// Get list of products for Buyer.

router.get('/products', isLoggedIn, function (req, res, next){

  Product.find({ }, function (err, products){
    if(err){
      res.redirect('/customer');
    } else {
      res.render('customer/products', { products: products, farmer: req.user});
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten');

});


// Search products

router.post('/products', isLoggedIn, function(req, res){
  
  var terms = req.body.term.split(' ');
  var query = [];

  terms.forEach(function(entry){
    query.push( {title: new RegExp(entry, 'i')} );
    query.push( {description: new RegExp(entry, 'i')} );
  });
  
  Product.find({ }, function (err, products){
    if(err){
      res.redirect('/customer');
    } else {
      res.render('customer/products', { products: products });
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten')
  .or(query);
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
  	return next();
  }
  res.redirect('/login');
}

module.exports = router;