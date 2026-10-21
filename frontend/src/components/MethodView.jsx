import React from 'react';
import { Cpu, Scale, EyeOff, Layers, ShieldCheck, Database } from 'lucide-react';

export default function MethodView() {
  return (
    <div className="method-card">
      <h2>How NewsLens Operates</h2>
      <p>
        NewsLens is an AI-powered personalized news aggregator designed to reveal media bias, blindspots, and ownership concentration across modern journalism.
      </p>

      <div className="method-grid">
        <div className="method-feature">
          <h3>
            <Cpu size={18} color="#6366f1" />
            1. Unsupervised Clustering
          </h3>
          <p>
            Incoming RSS articles are converted into TF-IDF vector representations over headline tokens. Candidate pairs pass through an inverted index and are clustered via Average-Link Agglomerative Centroid merging.
          </p>
        </div>

        <div className="method-feature">
          <h3>
            <Scale size={18} color="#3b82f6" />
            2. Bias Spectrum Math
          </h3>
          <p>
            Outlets are rated on a 5-point scale from Left (-2) to Right (+2). Coverage bars show the proportional distribution of reporting outlets across Left, Center, and Right buckets.
          </p>
        </div>

        <div className="method-feature">
          <h3>
            <EyeOff size={18} color="#ef4444" />
            3. Differential Blindspot Detection
          </h3>
          <p>
            Blindspots are computed using <em>coverage rates</em> rather than raw counts. If one camp (e.g. Right) publishes at a high rate while the opposite camp (Left) remains below threshold, a Blindspot is flagged.
          </p>
        </div>

        <div className="method-feature">
          <h3>
            <Database size={18} color="#10b981" />
            4. Full MERN Stack Architecture
          </h3>
          <p>
            Built on MongoDB, Express.js, React.js, and Node.js with automated cron scheduling, in-memory recovery caching, and instant perspective synthesis.
          </p>
        </div>
      </div>
    </div>
  );
}
