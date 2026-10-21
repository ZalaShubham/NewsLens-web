import React, { useState } from 'react';
import StoryCard from './StoryCard';
import { EyeOff } from 'lucide-react';

export default function BlindspotsView({ stories, onSelectStory }) {
  const [activeSide, setActiveSide] = useState('all');

  const rightBlindspots = stories.filter(s => s.blindspot === 'right');
  const leftBlindspots = stories.filter(s => s.blindspot === 'left');

  const filtered = activeSide === 'right'
    ? rightBlindspots
    : activeSide === 'left'
    ? leftBlindspots
    : stories.filter(s => s.blindspot);

  return (
    <div>
      <div className="method-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.4rem' }}>
          <EyeOff size={20} color="#f87171" />
          Media Blindspots Explained
        </h2>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>
          A <strong>Blindspot</strong> occurs when an important news story is widely covered by one side of the media spectrum (e.g. Left or Right) while being virtually ignored by the other.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeSide === 'all' ? '' : 'ghost'}`}
          onClick={() => setActiveSide('all')}
        >
          All Blindspots ({rightBlindspots.length + leftBlindspots.length})
        </button>
        <button
          className={`btn ${activeSide === 'right' ? '' : 'ghost'}`}
          onClick={() => setActiveSide('right')}
          style={{ borderColor: 'var(--right-border)', color: activeSide === 'right' ? '#fff' : '#f87171' }}
        >
          Right Blindspots ({rightBlindspots.length})
        </button>
        <button
          className={`btn ${activeSide === 'left' ? '' : 'ghost'}`}
          onClick={() => setActiveSide('left')}
          style={{ borderColor: 'var(--left-border)', color: activeSide === 'left' ? '#fff' : '#60a5fa' }}
        >
          Left Blindspots ({leftBlindspots.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="loading-center">
          <p>No blindspot stories found matching the current criteria.</p>
        </div>
      ) : (
        <div className="stories-grid">
          {filtered.map(story => (
            <StoryCard key={story.id} story={story} onSelect={onSelectStory} />
          ))}
        </div>
      )}
    </div>
  );
}
