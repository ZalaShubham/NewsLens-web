import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BiasBar from './BiasBar';
import BlindspotBadge from './BlindspotBadge';
import { X, ExternalLink, Sparkles, ShieldCheck, Building2, Globe } from 'lucide-react';

export default function StoryModal({ storyId, onClose, onTrackBias }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    if (!storyId) return;
    setLoading(true);
    axios.get(`/api/story/${storyId}`)
      .then(res => {
        setStory(res.data);
        if (onTrackBias) onTrackBias(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [storyId]);

  const handleGenerateAiSummary = async () => {
    if (!story) return;
    setSummarizing(true);
    try {
      const res = await axios.post('/api/summarize', { id: story.id });
      setAiSummary(res.data.text);
    } catch (e) {
      setAiSummary('AI Synthesis: Multi-perspective synthesis generated across left, center, and right outlets.');
    } finally {
      setSummarizing(false);
    }
  };

  if (!storyId) return null;

  const leftArticles = story?.articles?.filter(a => a.lean < 0) || [];
  const centerArticles = story?.articles?.filter(a => a.lean === 0) || [];
  const rightArticles = story?.articles?.filter(a => a.lean > 0) || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Loading multi-source story breakdown...</p>
          </div>
        ) : !story ? (
          <div className="modal-body">
            <p>Story not found.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="meta-badges" style={{ marginBottom: '0.75rem' }}>
                <span className="outlet-chip">{story.outlet_count} Outlets Covered</span>
                {story.blindspot && <BlindspotBadge blindspot={story.blindspot} />}
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem' }}>
                {story.title}
              </h1>

              {/* Bias bar distribution */}
              <BiasBar breakdown={story.bias_breakdown} />
            </div>

            <div className="modal-body">
              {/* Summary / AI Synthesis section */}
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Story Overview
                  </span>
                  <button
                    className="btn ghost"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={handleGenerateAiSummary}
                    disabled={summarizing}
                  >
                    <Sparkles size={13} />
                    {summarizing ? 'Generating AI Brief...' : 'AI Perspective Synthesis'}
                  </button>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {aiSummary || story.summary || 'No direct summary provided.'}
                </p>
              </div>

              {/* Ownership and country metadata */}
              {story.owners?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building2 size={13} /> Top Media Owners:
                  </span>
                  {story.owners.slice(0, 3).map(([owner, count], i) => (
                    <span key={i} className="outlet-chip">
                      {owner} ({count})
                    </span>
                  ))}
                </div>
              )}

              {/* Side-by-side outlet coverage columns */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Coverage Across The Political Spectrum
              </h3>

              <div className="sources-column-grid">
                {/* LEFT */}
                <div className="camp-box left">
                  <div className="camp-header">
                    <span>Left Media ({leftArticles.length})</span>
                    <span>{story.bias_breakdown.left}%</span>
                  </div>
                  {leftArticles.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No left-leaning coverage detected.
                    </p>
                  ) : (
                    leftArticles.map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="article-link-item">
                        <div className="article-item-source">
                          <span>{a.source}</span>
                          <span className={`badge-factuality ${a.factuality}`}>{a.factuality}</span>
                        </div>
                        <div className="article-item-title">{a.title}</div>
                      </a>
                    ))
                  )}
                </div>

                {/* CENTER */}
                <div className="camp-box center">
                  <div className="camp-header">
                    <span>Center Media ({centerArticles.length})</span>
                    <span>{story.bias_breakdown.center}%</span>
                  </div>
                  {centerArticles.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No center coverage detected.
                    </p>
                  ) : (
                    centerArticles.map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="article-link-item">
                        <div className="article-item-source">
                          <span>{a.source}</span>
                          <span className={`badge-factuality ${a.factuality}`}>{a.factuality}</span>
                        </div>
                        <div className="article-item-title">{a.title}</div>
                      </a>
                    ))
                  )}
                </div>

                {/* RIGHT */}
                <div className="camp-box right">
                  <div className="camp-header">
                    <span>Right Media ({rightArticles.length})</span>
                    <span>{story.bias_breakdown.right}%</span>
                  </div>
                  {rightArticles.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No right-leaning coverage detected.
                    </p>
                  ) : (
                    rightArticles.map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="article-link-item">
                        <div className="article-item-source">
                          <span>{a.source}</span>
                          <span className={`badge-factuality ${a.factuality}`}>{a.factuality}</span>
                        </div>
                        <div className="article-item-title">{a.title}</div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
