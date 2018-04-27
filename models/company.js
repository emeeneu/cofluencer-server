const mongoose = require('mongoose');
/* eslint-disable */
const Schema = mongoose.Schema;
/* eslint-enable */

const companySchema = new Schema({
  username: String,
  brandName: String,
  role: { type: String, default: 'company' },
  email: String,
  password: String,
  city: String,
  bio: String,
  profileImage: String,
  socialLinks: [{}],
  tags: [],
  influencersFavs: [Schema.Types.ObjectId],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
