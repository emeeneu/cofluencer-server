const mongoose = require('mongoose');
/* eslint-disable */
const Schema = mongoose.Schema;
/* eslint-enable */

const msgSchema = new Schema({
  to: Schema.Types.ObjectId,
  from: Schema.Types.ObjectId,
  msg: String,
  read: Boolean,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Msg = mongoose.model('Msg', msgSchema);

module.exports = Msg;
