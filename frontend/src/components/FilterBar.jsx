import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  sort,
  setSort,
  minOutlets,
  setMinOutlets,
  resultCount
}) {
  return (
    <section className="filters-bar">
      <div className="search-wrap">
        <Search size={15} className="search-icon" />
        <input
          type="search"
          className="search-input"
          placeholder="Search headlines, keywords, and media outlets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="sort-select">Sort</label>
        <select
          id="sort-select"
          className="select-input"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="rank">Top Stories (Balanced)</option>
          <option value="outlets">Most Outlets</option>
          <option value="newest">Newest First</option>
          <option value="left">Most Left-Covered</option>
          <option value="right">Most Right-Covered</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="min-outlets-select">Min Outlets</label>
        <select
          id="min-outlets-select"
          className="select-input"
          value={minOutlets}
          onChange={e => setMinOutlets(e.target.value)}
        >
          <option value="2">2+ outlets</option>
          <option value="3">3+ outlets</option>
          <option value="5">5+ outlets</option>
          <option value="8">8+ outlets</option>
        </select>
      </div>

      <span className="result-count">
        {resultCount} {resultCount === 1 ? 'story' : 'stories'} found
      </span>
    </section>
  );
}
