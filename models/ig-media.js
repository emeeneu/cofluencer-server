const mongoose = require('mongoose');
/* eslint-disable */
const Schema = mongoose.Schema;
/* eslint-enable */

const IgMediaSchema = new Schema({
  caption: String,
  comments_count: Number,
  like_count: Number,
  media_url: String,
  media_type: String,
  id: Number,
});

const IgMedia = mongoose.model('IgMedia', IgMediaSchema);

module.exports = IgMedia;
