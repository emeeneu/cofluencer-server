const mongoose = require('mongoose');
/* eslint-disable */
const Schema = mongoose.Schema;
/* eslint-enable */

const msgSchema = new Schema({
  roleTo: String,
  to: { type: Schema.Types.ObjectId, ref: this.roleTo },
  roleFrom: String,
  from: { type: Schema.Types.ObjectId, ref: this.roleFrom },
  msg: String,
  read: Boolean,
  type: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Msg = mongoose.model('Msg', msgSchema);

module.exports = Msg;
