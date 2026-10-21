import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import StoryCard from './components/StoryCard';
import StoryModal from './components/StoryModal';
import BlindspotsView from './components/BlindspotsView';
import SourcesView from './components/SourcesView';
import MyBiasView from './components/MyBiasView';
import MethodView from './components/MethodView';
import AddStoryModal from './components/AddStoryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('stories');
  const [stories, setStories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rank');
  const [minOutlets, setMinOutlets] = useState('3');

  // Reading history state for "My Bias"
  const [readHistory, setReadHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('groundish_reading_history') || '[]');
    } catch {
      return [];
    }
  });

  const fetchStories = async () => {
    try {
      const res = await axios.get('/api/stories', {
        params: {
          q: search,
          sort,
          min_outlets: minOutlets,
          limit: 100
        }
      });
      setStories(res.data.stories || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [search, sort, minOutlets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post('/api/refresh');
      // Poll until finished
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get('/api/status');
          if (!statusRes.data.refreshing) {
            clearInterval(interval);
            setRefreshing(false);
            fetchStories();
          }
        } catch {
          clearInterval(interval);
          setRefreshing(false);
        }
      }, 3000);
    } catch {
      setRefreshing(false);
    }
  };

  const handleTrackBias = (story) => {
    if (!story) return;
    setReadHistory(prev => {
      const filtered = prev.filter(s => s.id !== story.id);
      const updated = [story, ...filtered].slice(0, 50);
      localStorage.setItem('groundish_reading_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setReadHistory([]);
    localStorage.removeItem('groundish_reading_history');
  };

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blindspotCount={(meta?.blindspots?.left || 0) + (meta?.blindspots?.right || 0)}
        refreshing={refreshing}
        lastUpdated={meta?.updated_at}
        onRefresh={handleRefresh}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <main className="wrap" style={{ minHeight: '80vh' }}>
        {activeTab === 'stories' && (
          <>
            <FilterBar
              search={search}
              setSearch={setSearch}
              sort={sort}
              setSort={setSort}
              minOutlets={minOutlets}
              setMinOutlets={setMinOutlets}
              resultCount={stories.length}
            />

            {loading ? (
              <div className="loading-center">
                <div className="spinner"></div>
                <p>Loading multi-source news clusters...</p>
              </div>
            ) : stories.length === 0 ? (
              <div className="loading-center">
                <p>No stories found matching your filter.</p>
              </div>
            ) : (
              <div className="stories-grid">
                {stories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onSelect={(s) => setSelectedStoryId(s.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'blindspots' && (
          <BlindspotsView
            stories={stories}
            onSelectStory={(s) => setSelectedStoryId(s.id)}
          />
        )}

        {activeTab === 'sources' && <SourcesView />}

        {activeTab === 'bias' && (
          <MyBiasView
            readHistory={readHistory}
            onClearHistory={handleClearHistory}
            onSelectStory={(s) => setSelectedStoryId(s.id)}
          />
        )}

        {activeTab === 'method' && <MethodView />}
      </main>

      {/* Story Detail Modal */}
      {selectedStoryId && (
        <StoryModal
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
          onTrackBias={handleTrackBias}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <footer className="footer wrap">
        <p>
          NewsLens — AI Powered Personalized News Aggregator. Bias, blindspots, and factuality metrics are derived from transparent, algorithmic calculations.
        </p>
      </footer>
    </div>
  );
}
