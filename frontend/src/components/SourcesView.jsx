import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SourcesView() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLean, setFilterLean] = useState('all');

  useEffect(() => {
    axios.get('/api/sources')
      .then(res => setSources(res.data.sources || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterLean === 'all'
    ? sources
    : sources.filter(s => s.lean_slug === filterLean);

  return (
    <div>
      <div className="method-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
          Media Outlets Registry ({sources.length} Sources)
        </h2>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>
          Groundish pulls directly from verified public RSS feeds. Each outlet's political lean and factuality ratings are cross-referenced from published third-party media audits (AllSides, Ad Fontes, MBFC).
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${filterLean === 'all' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('all')}
        >
          All Outlets ({sources.length})
        </button>
        <button
          className={`btn ${filterLean === 'left' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('left')}
        >
          Left
        </button>
        <button
          className={`btn ${filterLean === 'lean_left' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('lean_left')}
        >
          Lean Left
        </button>
        <button
          className={`btn ${filterLean === 'center' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('center')}
        >
          Center
        </button>
        <button
          className={`btn ${filterLean === 'lean_right' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('lean_right')}
        >
          Lean Right
        </button>
        <button
          className={`btn ${filterLean === 'right' ? '' : 'ghost'}`}
          onClick={() => setFilterLean('right')}
        >
          Right
        </button>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading source directory...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Outlet</th>
                <th>Political Lean</th>
                <th>Factuality</th>
                <th>Parent Company</th>
                <th>Origin</th>
                <th>Articles Polled</th>
                <th>Feed Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>
                    <span className={`badge-lean ${s.lean_slug}`}>
                      {s.lean_label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-factuality ${s.factuality}`}>
                      {s.factuality}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.owner}</td>
                  <td>{s.country}</td>
                  <td>{s.article_count || 0}</td>
                  <td>
                    {s.feeds_ok > 0 ? (
                      <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                        <CheckCircle2 size={13} /> Active ({s.feeds_ok}/{s.feeds})
                      </span>
                    ) : (
                      <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                        <AlertCircle size={13} /> Timeout
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
