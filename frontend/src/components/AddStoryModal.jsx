import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

export default function AddStoryModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus('Searching live news feeds...');
    setTimeout(() => {
      setStatus(`Pinned query "${query}" registered for clustering.`);
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Pinned News Query</h2>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Search global news coverage for a story the main feeds missed and pin it to your news aggregator view.
          </p>

          <form onSubmit={handleSearch}>
            <div className="search-wrap" style={{ marginBottom: '1rem' }}>
              <Search size={15} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="e.g. AI copyright Supreme Court ruling"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Search & Pin Story
              </button>
            </div>
          </form>

          {status && (
            <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '1rem' }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
