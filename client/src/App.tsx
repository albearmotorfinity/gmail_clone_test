import React, { useState, useEffect } from 'react';
import { PropertyCard } from './components/PropertyCard';
import { FilterPanel } from './components/FilterPanel';
import { ScoredProperty, WeightedFilter } from './types/property';
import { api } from './services/api';
import './App.css';

function App() {
  const [properties, setProperties] = useState<ScoredProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchProperties = async (filters?: WeightedFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProperties(filters);
      setProperties(data);
    } catch (err) {
      setError('Failed to fetch properties. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFilterChange = (filters: WeightedFilter) => {
    fetchProperties(filters);
  };

  const handleScrapeNottingham = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.scrapeNottingham(10);
      alert(
        `${result.cached ? 'Loaded' : 'Scraped'} ${result.count} properties from Nottingham area!`
      );
      await fetchProperties();
      await fetchStats();
    } catch (err) {
      setError('Failed to scrape properties. Check console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all property data?')) {
      return;
    }

    setLoading(true);
    try {
      await api.clearProperties();
      setProperties([]);
      setStats(null);
      alert('All property data cleared!');
    } catch (err) {
      setError('Failed to clear data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rightmove Smart Search</h1>
        <p>Find your perfect property in Nottingham with intelligent filtering</p>
        {stats && (
          <div className="stats-bar">
            <span className="stat-item">
              <strong>{stats.total}</strong> properties
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              <strong>{stats.studentProperties}</strong> student
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              <strong>{stats.withGarden}</strong> with garden
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              Avg: <strong>£{Math.round(stats.averagePrice)}</strong>
            </span>
          </div>
        )}
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <FilterPanel
            onFilterChange={handleFilterChange}
            onScrapeNottingham={handleScrapeNottingham}
            onClearData={handleClearData}
          />
        </aside>

        <main className="main-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-message">
              Loading properties...
            </div>
          )}

          {!loading && properties.length === 0 && (
            <div className="empty-state">
              <h2>No properties yet</h2>
              <p>Click "Load Nottingham Properties" to get started!</p>
            </div>
          )}

          {!loading && properties.length > 0 && (
            <>
              <div className="results-header">
                <h2>{properties.length} Properties Found</h2>
                <p className="results-subtitle">
                  Sorted by relevance score based on your preferences
                </p>
              </div>
              <div className="property-grid">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
