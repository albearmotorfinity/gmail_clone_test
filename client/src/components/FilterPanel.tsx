import React, { useState } from 'react';
import { WeightedFilter, LocationFilter, RoomFilter } from '../types/property';
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
  // Basic filters
  const [maxPrice, setMaxPrice] = useState(1500);
  const [priceWeight, setPriceWeight] = useState(5);
  const [minBedrooms, setMinBedrooms] = useState(2);
  const [bedroomsWeight, setBedroomsWeight] = useState(5);
  const [minBathrooms, setMinBathrooms] = useState(1);
  const [bathroomsWeight, setBathroomsWeight] = useState(3);
  const [gardenWeight, setGardenWeight] = useState(3);
  const [studentPreference, setStudentPreference] = useState<boolean | null>(null);
  const [studentWeight, setStudentWeight] = useState(5);

  // Room filters
  const [showRoomFilters, setShowRoomFilters] = useState(false);
  const [minDoubleRooms, setMinDoubleRooms] = useState(0);
  const [minEnsuiteRooms, setMinEnsuiteRooms] = useState(0);
  const [similarSizedRooms, setSimilarSizedRooms] = useState<boolean | null>(null);
  const [hasMasterBedroom, setHasMasterBedroom] = useState<boolean | null>(null);
  const [roomWeight, setRoomWeight] = useState(7);

  // Location filters
  const [showLocationFilters, setShowLocationFilters] = useState(false);
  const [locations, setLocations] = useState<LocationFilter[]>([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLat, setNewLocationLat] = useState('');
  const [newLocationLng, setNewLocationLng] = useState('');
  const [newLocationDistance, setNewLocationDistance] = useState(5);
  const [newLocationWeight, setNewLocationWeight] = useState(8);

  // Nottingham coordinates for preset locations
  const presetLocations = {
    'University of Nottingham': { lat: 52.9548, lng: -1.1581 },
    'Nottingham Trent University': { lat: 52.9588, lng: -1.1571 },
    'City Centre': { lat: 52.9536, lng: -1.1505 },
  };

  const handleAddLocation = () => {
    if (newLocationName && newLocationLat && newLocationLng) {
      setLocations([
        ...locations,
        {
          name: newLocationName,
          lat: parseFloat(newLocationLat),
          lng: parseFloat(newLocationLng),
          maxDistance: newLocationDistance,
          weight: newLocationWeight,
        },
      ]);
      setNewLocationName('');
      setNewLocationLat('');
      setNewLocationLng('');
      setNewLocationDistance(5);
      setNewLocationWeight(8);
    }
  };

  const handleAddPresetLocation = (name: string) => {
    const coords = presetLocations[name as keyof typeof presetLocations];
    if (coords) {
      setLocations([
        ...locations,
        {
          name,
          lat: coords.lat,
          lng: coords.lng,
          maxDistance: 5,
          weight: 8,
        },
      ]);
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

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

    // Add room criteria
    if (showRoomFilters && roomWeight > 0) {
      const roomCriteria: RoomFilter = {};
      if (minDoubleRooms > 0) roomCriteria.minDoubleRooms = minDoubleRooms;
      if (minEnsuiteRooms > 0) roomCriteria.minEnsuiteRooms = minEnsuiteRooms;
      if (similarSizedRooms !== null) roomCriteria.similarSizedRooms = similarSizedRooms;
      if (hasMasterBedroom !== null) roomCriteria.hasMasterBedroom = hasMasterBedroom;

      if (Object.keys(roomCriteria).length > 0) {
        filters.rooms = { criteria: roomCriteria, weight: roomWeight };
      }
    }

    // Add locations
    if (showLocationFilters && locations.length > 0) {
      filters.locations = locations;
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
    setShowRoomFilters(false);
    setMinDoubleRooms(0);
    setMinEnsuiteRooms(0);
    setSimilarSizedRooms(null);
    setHasMasterBedroom(null);
    setRoomWeight(7);
    setShowLocationFilters(false);
    setLocations([]);
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

      {/* Basic Filters */}
      <div className="filter-section">
        <h3 className="section-title">Basic Filters</h3>

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

      {/* Room Filters */}
      <div className="filter-section">
        <div className="section-header" onClick={() => setShowRoomFilters(!showRoomFilters)}>
          <h3 className="section-title">Room Criteria {showRoomFilters ? '▼' : '▶'}</h3>
          <span className="section-badge">Advanced</span>
        </div>

        {showRoomFilters && (
          <>
            <div className="filter-item">
              <label className="filter-label">
                Min Double Bedrooms: {minDoubleRooms}
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={minDoubleRooms}
                onChange={(e) => setMinDoubleRooms(Number(e.target.value))}
                className="filter-slider"
              />
            </div>

            <div className="filter-item">
              <label className="filter-label">
                Min Ensuite Rooms: {minEnsuiteRooms}
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={minEnsuiteRooms}
                onChange={(e) => setMinEnsuiteRooms(Number(e.target.value))}
                className="filter-slider"
              />
            </div>

            <div className="filter-item">
              <label className="filter-label">Similarly-Sized Rooms</label>
              <div className="student-buttons">
                <button
                  className={`student-button ${similarSizedRooms === true ? 'active' : ''}`}
                  onClick={() => setSimilarSizedRooms(true)}
                >
                  Yes
                </button>
                <button
                  className={`student-button ${similarSizedRooms === false ? 'active' : ''}`}
                  onClick={() => setSimilarSizedRooms(false)}
                >
                  No
                </button>
                <button
                  className={`student-button ${similarSizedRooms === null ? 'active' : ''}`}
                  onClick={() => setSimilarSizedRooms(null)}
                >
                  Either
                </button>
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-label">Master Bedroom</label>
              <div className="student-buttons">
                <button
                  className={`student-button ${hasMasterBedroom === true ? 'active' : ''}`}
                  onClick={() => setHasMasterBedroom(true)}
                >
                  Yes
                </button>
                <button
                  className={`student-button ${hasMasterBedroom === false ? 'active' : ''}`}
                  onClick={() => setHasMasterBedroom(false)}
                >
                  No
                </button>
                <button
                  className={`student-button ${hasMasterBedroom === null ? 'active' : ''}`}
                  onClick={() => setHasMasterBedroom(null)}
                >
                  Either
                </button>
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-label">
                Room Criteria Weight
                <span className="weight-badge">Weight: {roomWeight}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={roomWeight}
                onChange={(e) => setRoomWeight(Number(e.target.value))}
                className="weight-slider"
              />
            </div>
          </>
        )}
      </div>

      {/* Location Filters */}
      <div className="filter-section">
        <div className="section-header" onClick={() => setShowLocationFilters(!showLocationFilters)}>
          <h3 className="section-title">Multiple Locations {showLocationFilters ? '▼' : '▶'}</h3>
          <span className="section-badge">Advanced</span>
        </div>

        {showLocationFilters && (
          <>
            <div className="preset-locations">
              <p className="preset-label">Quick Add:</p>
              {Object.keys(presetLocations).map((name) => (
                <button
                  key={name}
                  className="preset-button"
                  onClick={() => handleAddPresetLocation(name)}
                  disabled={locations.some(l => l.name === name)}
                >
                  + {name}
                </button>
              ))}
            </div>

            {locations.map((location, index) => (
              <div key={index} className="location-item">
                <div className="location-header">
                  <strong>{location.name}</strong>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    ×
                  </button>
                </div>
                <div className="location-details">
                  <span>≤{location.maxDistance}km</span>
                  <span className="weight-badge">Weight: {location.weight}</span>
                </div>
              </div>
            ))}

            <div className="add-location">
              <h4>Add Custom Location</h4>
              <input
                type="text"
                placeholder="Location name (e.g., Work)"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="location-input"
              />
              <div className="coords-inputs">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={newLocationLat}
                  onChange={(e) => setNewLocationLat(e.target.value)}
                  className="location-input small"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={newLocationLng}
                  onChange={(e) => setNewLocationLng(e.target.value)}
                  className="location-input small"
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">
                  Max Distance: {newLocationDistance}km
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={newLocationDistance}
                  onChange={(e) => setNewLocationDistance(Number(e.target.value))}
                  className="filter-slider"
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">
                  Weight: {newLocationWeight}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={newLocationWeight}
                  onChange={(e) => setNewLocationWeight(Number(e.target.value))}
                  className="weight-slider"
                />
              </div>
              <button
                onClick={handleAddLocation}
                className="add-location-button"
                disabled={!newLocationName || !newLocationLat || !newLocationLng}
              >
                Add Location
              </button>
            </div>
          </>
        )}
      </div>

      <div className="filter-buttons">
        <button onClick={handleApplyFilters} className="apply-button">
          Apply Filters
        </button>
        <button onClick={handleReset} className="reset-button">
          Reset All
        </button>
      </div>
    </div>
  );
};
