import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  id: String,
  source_id: String,
  source: String,
  lean: Number,
  lean_slug: String,
  lean_label: String,
  factuality: String,
  owner: String,
  country: String,
  title: String,
  summary: String,
  url: String,
  published: String,
  published_ts: Number
}, { _id: false });

const FramingItemSchema = new mongoose.Schema({
  lean_slug: String,
  lean_label: String,
  count: Number,
  article: {
    title: String,
    source: String,
    url: String,
    factuality: String
  }
}, { _id: false });

const StorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, index: 'text' },
  summary: { type: String },
  rank: { type: Number, default: 0, index: true },
  outlet_count: { type: Number, default: 0, index: true },
  rated_count: { type: Number, default: 0 },
  skew: { type: Number, default: 0 },
  bias_breakdown: {
    left: { type: Number, default: 0 },
    center: { type: Number, default: 0 },
    right: { type: Number, default: 0 }
  },
  blindspot: { type: String, default: null, index: true }, // 'left' | 'right' | null
  framing: [FramingItemSchema],
  owners: [[mongoose.Schema.Types.Mixed]], // [["Owner Name", count]]
  countries: [String],
  last_published: { type: String, index: true },
  articles: [ArticleSchema],
  llm_summary: { type: String, default: null }
}, {
  timestamps: true
});

StorySchema.index({ rank: -1 });
StorySchema.index({ outlet_count: -1 });
StorySchema.index({ last_published: -1 });

export const Story = mongoose.model('Story', StorySchema);
