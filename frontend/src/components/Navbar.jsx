import React from 'react';
import { RotateCw, Plus, Search } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  blindspotCount = 0,
  refreshing,
  lastUpdated,
  onRefresh,
  onOpenAddModal
}) {
  const getRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMin = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMin <= 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    return `${diffHours}h ago`;
  };

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <div className="brand" onClick={() => setActiveTab('stories')} style={{ cursor: 'pointer' }}>
          <div className="logo" aria-hidden="true">
            <Search size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1>
              NewsLens
            </h1>
            <p className="tagline">AI Powered Personalized News Aggregator</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="freshness-tag">
            <span className={`pulse-dot ${refreshing ? 'refreshing' : ''}`}></span>
            <span>{refreshing ? 'Refreshing feeds…' : `Updated ${getRelativeTime(lastUpdated)}`}</span>
          </div>
          <button className="btn ghost" onClick={onOpenAddModal}>
            <Plus size={14} /> Add Story
          </button>
          <button className="btn" onClick={onRefresh} disabled={refreshing}>
            <RotateCw size={14} className={refreshing ? 'spinner' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh feeds'}
          </button>
        </div>
      </div>

      <nav className="wrap tabs">
        <button
          className={`tab ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          Top Stories
        </button>
        <button
          className={`tab ${activeTab === 'blindspots' ? 'active' : ''}`}
          onClick={() => setActiveTab('blindspots')}
        >
          Blindspots
          {blindspotCount > 0 && <span className="tab-badge">{blindspotCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          Sources Directory
        </button>
        <button
          className={`tab ${activeTab === 'bias' ? 'active' : ''}`}
          onClick={() => setActiveTab('bias')}
        >
          My Reading Bias
        </button>
        <button
          className={`tab ${activeTab === 'method' ? 'active' : ''}`}
          onClick={() => setActiveTab('method')}
        >
          Methodology
        </button>
      </nav>
    </header>
  );
}
