var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
	auth:{
		facebookId: {type: String, default: null },
		googleId: {type: String, default: null },
		twitterId: {type: String, default: null },
		email: String,
		token: String
	},
	personalInformation: {
		name: { type: String, uppercase: true },
		phone: {type: String, default: null },
		birthDate: Date,		
		email: {type: String, default: null }
	},
	pictureUrl: {type: String, default: null },
	about: {type: String, default: null },		
	products: [{ type: Schema.Types.ObjectId, ref: 'product' }],
	registrationDate: { type: Date, default: Date.now },
	rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('customer', customerSchema);