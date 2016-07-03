var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema = new Schema({
	customer: { type: Schema.Types.ObjectId, ref: 'customer' },
	farmer: { type: Schema.Types.ObjectId, ref: 'farmer' },
	address: { type: String, uppercase: true },
	orderDate: { type: Date, default: Date.now },
	shippingDate: { type: Date, default: Date.now },
	toShip: { type: Boolean, default: true },
	total: { type: Number, default: 0.0 },
	shipped: { type: Boolean, dafault: false },
	products: [ {type: Schema.Types.ObjectId, ref: 'product'} ]
});