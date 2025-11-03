import React, { useState } from 'react';
import { WeightedFilter } from '../types/property';
import './FilterPanel.css';

interface FilterPanelProps {
  onFilterChange: (filters: WeightedFilter) => void;
  onScrapeNottingham: () => void;
  onClearData: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  onScrapeNottingham,
  onClearData,
}) => {
  const [maxPrice, setMaxPrice] = useState(1500);
  const [priceWeight, setPriceWeight] = useState(5);

  const [minBedrooms, setMinBedrooms] = useState(2);
  const [bedroomsWeight, setBedroomsWeight] = useState(5);

  const [minBathrooms, setMinBathrooms] = useState(1);
  const [bathroomsWeight, setBathroomsWeight] = useState(3);

  const [gardenWeight, setGardenWeight] = useState(3);

  const [studentPreference, setStudentPreference] = useState<boolean | null>(null);
  const [studentWeight, setStudentWeight] = useState(5);

  const handleApplyFilters = () => {
    const filters: WeightedFilter = {};

    if (priceWeight > 0) {
      filters.maxPrice = { value: maxPrice, weight: priceWeight };
    }

    if (bedroomsWeight > 0) {
      filters.minBedrooms = { value: minBedrooms, weight: bedroomsWeight };
    }

    if (bathroomsWeight > 0) {
      filters.minBathrooms = { value: minBathrooms, weight: bathroomsWeight };
    }

    if (gardenWeight > 0) {
      filters.hasGarden = { weight: gardenWeight };
    }

    if (studentPreference !== null && studentWeight > 0) {
      filters.isStudent = { value: studentPreference, weight: studentWeight };
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setMaxPrice(1500);
    setPriceWeight(5);
    setMinBedrooms(2);
    setBedroomsWeight(5);
    setMinBathrooms(1);
    setBathroomsWeight(3);
    setGardenWeight(3);
    setStudentPreference(null);
    setStudentWeight(5);
    onFilterChange({});
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Smart Filters</h2>
        <p className="filter-subtitle">
          Adjust importance (weight) for each criterion. Higher weight = more important.
        </p>
      </div>

      <div className="filter-actions">
        <button onClick={onScrapeNottingham} className="action-button primary">
          Load Nottingham Properties
        </button>
        <button onClick={onClearData} className="action-button secondary">
          Clear Data
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-item">
          <label className="filter-label">
            Max Price: £{maxPrice}
            <span className="weight-badge">Weight: {priceWeight}</span>
          </label>
          <input
            type="range"
            min="0"
            max="3000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="filter-slider"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={priceWeight}
            onChange={(e) => setPriceWeight(Number(e.target.value))}
            className="weight-slider"
          />
        </div>

        <div className="filter-item">
          <label className="filter-label">
            Min Bedrooms: {minBedrooms}
            <span className="weight-badge">Weight: {bedroomsWeight}</span>
          </label>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(Number(e.target.value))}
            className="filter-slider"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={bedroomsWeight}
            onChange={(e) => setBedroomsWeight(Number(e.target.value))}
            className="weight-slider"
          />
        </div>

        <div className="filter-item">
          <label className="filter-label">
            Min Bathrooms: {minBathrooms}
            <span className="weight-badge">Weight: {bathroomsWeight}</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={minBathrooms}
            onChange={(e) => setMinBathrooms(Number(e.target.value))}
            className="filter-slider"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={bathroomsWeight}
            onChange={(e) => setBathroomsWeight(Number(e.target.value))}
            className="weight-slider"
          />
        </div>

        <div className="filter-item">
          <label className="filter-label">
            Garden Preference
            <span className="weight-badge">Weight: {gardenWeight}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={gardenWeight}
            onChange={(e) => setGardenWeight(Number(e.target.value))}
            className="weight-slider"
          />
        </div>

        <div className="filter-item">
          <label className="filter-label">
            Student Property
            <span className="weight-badge">Weight: {studentWeight}</span>
          </label>
          <div className="student-buttons">
            <button
              className={`student-button ${studentPreference === true ? 'active' : ''}`}
              onClick={() => setStudentPreference(true)}
            >
              Yes
            </button>
            <button
              className={`student-button ${studentPreference === false ? 'active' : ''}`}
              onClick={() => setStudentPreference(false)}
            >
              No
            </button>
            <button
              className={`student-button ${studentPreference === null ? 'active' : ''}`}
              onClick={() => setStudentPreference(null)}
            >
              Either
            </button>
          </div>
          {studentPreference !== null && (
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={studentWeight}
              onChange={(e) => setStudentWeight(Number(e.target.value))}
              className="weight-slider"
            />
          )}
        </div>
      </div>

      <div className="filter-buttons">
        <button onClick={handleApplyFilters} className="apply-button">
          Apply Filters
        </button>
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};
