import React from 'react';
import BiasBar from './BiasBar';
import BlindspotBadge from './BlindspotBadge';
import { Newspaper, Building2 } from 'lucide-react';

export default function StoryCard({ story, onSelect }) {
  const {
    title,
    summary,
    outlet_count,
    blindspot,
    bias_breakdown,
    framing = [],
    owners = []
  } = story;

  const topOwner = owners[0]?.[0];

  return (
    <article className="story-card" onClick={() => onSelect(story)}>
      <div className="card-header">
        <div className="meta-badges">
          <span className="outlet-chip">
            <Newspaper size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            {outlet_count} outlets
          </span>
          {blindspot && <BlindspotBadge blindspot={blindspot} />}
          {topOwner && (
            <span className="outlet-chip" title={`Major coverage owner: ${topOwner}`}>
              <Building2 size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
              {topOwner.length > 22 ? topOwner.slice(0, 20) + '…' : topOwner}
            </span>
          )}
        </div>
      </div>

      <h2 className="card-title">{title}</h2>
      {summary && <p className="card-summary">{summary}</p>}

      {/* Framing previews from contrasting media */}
      {framing.length > 0 && (
        <div className="framing-previews">
          {framing.slice(0, 2).map((f, i) => (
            <div key={i} className={`framing-row ${f.lean_slug}`}>
              <span className="framing-source">{f.article.source}:</span>
              <span className="framing-headline">{f.article.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3-way bias bar */}
      <BiasBar breakdown={bias_breakdown} />
    </article>
  );
}
