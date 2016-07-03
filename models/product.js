var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSchema = new Schema({
	title: { type: String, uppercase: true },
	description: String,
	pictureUrl: { type: String, default: null },
	quantity: { type: Number, min: 1, default: 1 },
	price: Number,
	rotten: { type: Boolean, default: false },
	farmer: { type: Schema.Types.ObjectId, ref: 'farmer' },
	posted: { type: Date, default: Date.now }
},{
  toObject: {
  virtuals: true
  },
  toJSON: {
  virtuals: true
  }
});


module.exports = mongoose.model('product', productSchema);
