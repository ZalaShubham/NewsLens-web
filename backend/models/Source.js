import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  urls: [String],
  url: String,
  lean: { type: Number, required: true },
  lean_slug: String,
  lean_label: String,
  factuality: String,
  owner: String,
  country: String,
  article_count: { type: Number, default: 0 },
  feeds_ok: { type: Number, default: 0 },
  feeds: { type: Number, default: 0 },
  error: { type: String, default: null }
}, {
  timestamps: true
});

export const Source = mongoose.model('Source', SourceSchema);
