import React, { useState, useCallback } from 'react';
import SearchPanel from './components/SearchPanel';
import GanttChart from './components/GanttChart';
import './App.css';

function App() {
  const [ganttParams, setGanttParams] = useState(null);

  const handleSearch = useCallback((params) => {
    setGanttParams({ ...params });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Telecom Technician Job Scheduler</h1>
        <p>Field Supervisor Dashboard - Technician to Job Mapping</p>
      </header>
      <div className="app-content">
        <SearchPanel onSearch={handleSearch} />
        {ganttParams ? (
          <GanttChart
            territoryId={ganttParams.territoryId}
            marketIds={ganttParams.marketIds}
            date={ganttParams.date}
          />
        ) : (
          <div className="placeholder">
            <div className="placeholder-content">
              <h2>Select Territory and Date</h2>
              <p>Use the search panel above to select a territory, optionally filter by markets, and choose a date to view the technician job schedule.</p>
            </div>
          </div>
        )}
      </div>
      <div className="legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <span className="legend-item"><span className="legend-color" style={{background:'#3498db'}}></span>Copper</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#2ecc71'}}></span>Fiber</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#9b59b6'}}></span>Modem</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#e74c3c'}}></span>Router</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#1abc9c'}}></span>Networking</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#95a5a6'}}></span>Travel</span>
          <span className="legend-item"><span className="legend-color" style={{background:'#f39c12'}}></span>Break</span>
        </div>
      </div>
    </div>
  );
}

export default App;
