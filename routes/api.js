var express = require('express');
var router = express.Router();

var Product = require('../models/product');

router.get('/products', function(req, res){
	
	Product.find({ }, function (err, products){
    if(err){
      res.json({ error: err.message })
    } else {
      res.json(products);
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten');

});


router.get('/farmer/:farmerId/products', function(req, res){

  Product.find({ farmer: req.params.farmerId }, function(err, products){
    if (err){
      res.json({ error: err.message });
    } else {
      res.json(products);
    }
  })
  .populate('farmer', 'name  description pictureUrl')
  .sort('-posted')
  .select('title description quantity price pictureUrl farmer posted rotten');

})

module.exports = router;