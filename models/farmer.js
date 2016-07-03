var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var farmerSchema = new Schema({
	email : String,
	password : String,
	token: String,
	name: { type: String, uppercase: true },
	description: String,
	address: String,
	phone: String,
	website: { type: String, default: "" },
	pictureUrl: { type: String, default: null },
	expirationDate: { type: Date, default: null },
	registrationDate: { type: Date, default: Date.now },
	confirmationDate: { type: Date, default: null },
	rating: { type: Number, default: 0 }
});


module.exports = mongoose.model('farmer', farmerSchema);