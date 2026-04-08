import React, { useState, useEffect } from 'react';
import { getTerritories, getMarkets } from '../api';

function SearchPanel({ onSearch }) {
  const [territories, setTerritories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTerritories().then(res => setTerritories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedTerritory) {
      getMarkets(selectedTerritory).then(res => {
        setMarkets(res.data);
        setSelectedMarkets([]);
      }).catch(console.error);
    } else {
      setMarkets([]);
      setSelectedMarkets([]);
    }
  }, [selectedTerritory]);

  const handleSearch = () => {
    if (!selectedTerritory || !selectedDate) return;
    setLoading(true);
    onSearch({
      territoryId: selectedTerritory,
      marketIds: selectedMarkets.length > 0 ? selectedMarkets : null,
      date: selectedDate,
    });
    setTimeout(() => setLoading(false), 500);
  };

  const handleMarketChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedMarkets(selected);
  };

  return (
    <div className="search-panel">
      <div className="search-field">
        <label>Territory</label>
        <select
          value={selectedTerritory}
          onChange={(e) => setSelectedTerritory(e.target.value)}
        >
          <option value="">Select Territory</option>
          {territories.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <label>Markets (optional, multi-select)</label>
        <select
          multiple
          value={selectedMarkets}
          onChange={handleMarketChange}
          disabled={!selectedTerritory}
        >
          {markets.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <label>Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={!selectedTerritory || !selectedDate || loading}
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
    </div>
  );
}

export default SearchPanel;
