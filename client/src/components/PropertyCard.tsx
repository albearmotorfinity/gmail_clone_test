import React from 'react';
import { ScoredProperty } from '../types/property';
import './PropertyCard.css';

interface PropertyCardProps {
  property: ScoredProperty;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const {
    title,
    price,
    priceQualifier,
    bedrooms,
    bathrooms,
    propertyType,
    address,
    hasGarden,
    description,
    images,
    url,
    isStudent,
    relevanceScore,
    matchDetails,
    roomDetails,
  } = property;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="property-card">
      <div className="property-card-header">
        <div className="property-image">
          {images.length > 0 ? (
            <img src={images[0]} alt={title} />
          ) : (
            <div className="no-image">No Image</div>
          )}
          {isStudent && <span className="badge student-badge">Student</span>}
          {hasGarden && <span className="badge garden-badge">Garden</span>}
        </div>
        <div
          className="relevance-score"
          style={{ backgroundColor: getScoreColor(relevanceScore) }}
        >
          {relevanceScore.toFixed(0)}%
        </div>
      </div>

      <div className="property-card-body">
        <h3 className="property-title">{title}</h3>
        <p className="property-address">{address}</p>

        <div className="property-price">
          £{price.toLocaleString()}
          {priceQualifier && <span className="price-qualifier"> {priceQualifier}</span>}
        </div>

        <div className="property-details">
          <span className="detail-item">
            <strong>{bedrooms}</strong> bed{bedrooms !== 1 ? 's' : ''}
          </span>
          <span className="detail-separator">•</span>
          <span className="detail-item">
            <strong>{bathrooms}</strong> bath{bathrooms !== 1 ? 's' : ''}
          </span>
          <span className="detail-separator">•</span>
          <span className="detail-item">{propertyType}</span>
        </div>

        {roomDetails && (roomDetails.doubleRooms > 0 || roomDetails.ensuiteRooms > 0 || roomDetails.similarSizedRooms || roomDetails.hasMasterBedroom) && (
          <div className="room-details">
            {roomDetails.doubleRooms > 0 && (
              <span className="room-badge">{roomDetails.doubleRooms} Double</span>
            )}
            {roomDetails.singleRooms > 0 && (
              <span className="room-badge">{roomDetails.singleRooms} Single</span>
            )}
            {roomDetails.ensuiteRooms > 0 && (
              <span className="room-badge ensuite">{roomDetails.ensuiteRooms} Ensuite</span>
            )}
            {roomDetails.hasMasterBedroom && (
              <span className="room-badge master">Master</span>
            )}
            {roomDetails.similarSizedRooms && (
              <span className="room-badge similar">Similar Sized</span>
            )}
          </div>
        )}

        <p className="property-description">
          {description.substring(0, 150)}
          {description.length > 150 ? '...' : ''}
        </p>

        <div className="match-details">
          <h4>Match Details:</h4>
          <div className="match-items">
            {Object.entries(matchDetails).map(([key, detail]) => (
              <div
                key={key}
                className={`match-item ${detail.matched ? 'matched' : 'not-matched'}`}
              >
                <span className="match-icon">{detail.matched ? '✓' : '○'}</span>
                <span className="match-label">{key}</span>
                <span className="match-score">+{detail.contribution.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="view-button"
        >
          View on Rightmove →
        </a>
      </div>
    </div>
  );
};
