import mongoose from 'mongoose';

const MetaSchema = new mongoose.Schema({
  key: { type: String, default: 'global_meta', unique: true },
  article_count: { type: Number, default: 0 },
  story_count: { type: Number, default: 0 },
  source_count: { type: Number, default: 0 },
  sources_ok: { type: Number, default: 0 },
  blindspots: {
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 }
  },
  seconds: { type: Number, default: 0 },
  updated_at: { type: String }
}, {
  timestamps: true
});

export const Meta = mongoose.model('Meta', MetaSchema);
