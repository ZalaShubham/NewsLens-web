import React from 'react';
import BiasBar from './BiasBar';
import { UserCheck, BookOpen, Trash2 } from 'lucide-react';

export default function MyBiasView({ readHistory, onClearHistory, onSelectStory }) {
  const total = readHistory.length;

  let leftSum = 0;
  let centerSum = 0;
  let rightSum = 0;

  for (const item of readHistory) {
    leftSum += item.bias_breakdown?.left || 0;
    centerSum += item.bias_breakdown?.center || 0;
    rightSum += item.bias_breakdown?.right || 0;
  }

  const breakdown = total > 0 ? {
    left: Math.round(leftSum / total),
    center: Math.round(centerSum / total),
    right: Math.round(rightSum / total)
  } : { left: 33, center: 34, right: 33 };

  return (
    <div>
      <div className="method-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <UserCheck size={22} color="#6366f1" />
            Your Reading Bias Profile
          </h2>
          {total > 0 && (
            <button className="btn ghost" onClick={onClearHistory}>
              <Trash2 size={13} /> Reset Profile
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
          NewsLens measures your personal media diet. As you read stories on this site, we compute the aggregated bias distribution of the stories you explore, helping you stay balanced.
        </p>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Personal Diet ({total} stories analyzed)</span>
            <span>
              {breakdown.left > breakdown.right + 10 ? 'Leaning Left' :
               breakdown.right > breakdown.left + 10 ? 'Leaning Right' : 'Balanced Diet'}
            </span>
          </div>
          <BiasBar breakdown={breakdown} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Recently Explored Stories ({total})
      </h3>

      {total === 0 ? (
        <div className="loading-center">
          <BookOpen size={32} color="var(--text-dim)" />
          <p>You haven't clicked any stories yet. Open stories to track your bias distribution!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {readHistory.map((s, idx) => (
            <div
              key={idx}
              className="story-card"
              onClick={() => onSelectStory(s)}
              style={{ cursor: 'pointer', padding: '1rem' }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>{s.title}</h4>
              <BiasBar breakdown={s.bias_breakdown} showLegend={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
