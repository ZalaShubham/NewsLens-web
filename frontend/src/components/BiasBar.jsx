import React from 'react';

export default function BiasBar({ breakdown, showLegend = true }) {
  const { left = 0, center = 0, right = 0 } = breakdown || {};

  return (
    <div className="bias-container">
      {showLegend && (
        <div className="bias-legend">
          <span className="bias-legend-item">
            <span className="dot-indicator left"></span>
            <span>{left}% Left</span>
          </span>
          <span className="bias-legend-item">
            <span className="dot-indicator center"></span>
            <span>{center}% Center</span>
          </span>
          <span className="bias-legend-item">
            <span className="dot-indicator right"></span>
            <span>{right}% Right</span>
          </span>
        </div>
      )}
      <div className="bias-bar-track" title={`Left: ${left}%, Center: ${center}%, Right: ${right}%`}>
        {left > 0 && <div className="bias-bar-segment left" style={{ width: `${left}%` }}></div>}
        {center > 0 && <div className="bias-bar-segment center" style={{ width: `${center}%` }}></div>}
        {right > 0 && <div className="bias-bar-segment right" style={{ width: `${right}%` }}></div>}
      </div>
    </div>
  );
}
