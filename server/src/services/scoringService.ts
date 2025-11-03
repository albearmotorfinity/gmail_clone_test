import { Property, WeightedFilter, ScoredProperty } from '../types/property';

/**
 * Service for scoring and filtering properties based on weighted criteria
 * This allows flexible matching where properties don't need to meet all criteria,
 * but are ranked by how well they match the user's preferences
 */
export class ScoringService {
  /**
   * Scores properties based on weighted filter criteria
   * Returns properties sorted by relevance score (highest first)
   */
  scoreProperties(properties: Property[], filters: WeightedFilter): ScoredProperty[] {
    const scoredProperties: ScoredProperty[] = properties.map(property => {
      let totalScore = 0;
      let maxPossibleScore = 0;
      const matchDetails: any = {};

      // Score: Price
      if (filters.maxPrice) {
        const weight = filters.maxPrice.weight;
        maxPossibleScore += weight;

        if (property.price <= filters.maxPrice.value) {
          // Give partial credit based on how much cheaper it is
          const priceRatio = 1 - (property.price / filters.maxPrice.value);
          const score = weight * (0.5 + priceRatio * 0.5); // Min 50% if under budget
          totalScore += score;
          matchDetails.price = { matched: true, contribution: score };
        } else {
          // Penalize if over budget, but don't exclude
          const overBudgetRatio = Math.min((property.price - filters.maxPrice.value) / filters.maxPrice.value, 1);
          const penalty = weight * (0.3 * (1 - overBudgetRatio)); // Max 30% if slightly over
          totalScore += penalty;
          matchDetails.price = { matched: false, contribution: penalty };
        }
      }

      // Score: Minimum Bedrooms
      if (filters.minBedrooms) {
        const weight = filters.minBedrooms.weight;
        maxPossibleScore += weight;

        if (property.bedrooms >= filters.minBedrooms.value) {
          // Give bonus for extra bedrooms
          const extraBedrooms = property.bedrooms - filters.minBedrooms.value;
          const score = weight * Math.min(1, 0.8 + extraBedrooms * 0.1);
          totalScore += score;
          matchDetails.bedrooms = { matched: true, contribution: score };
        } else {
          // Partial credit if close
          const bedroomRatio = property.bedrooms / filters.minBedrooms.value;
          const score = weight * bedroomRatio * 0.4;
          totalScore += score;
          matchDetails.bedrooms = { matched: false, contribution: score };
        }
      }

      // Score: Minimum Bathrooms
      if (filters.minBathrooms) {
        const weight = filters.minBathrooms.weight;
        maxPossibleScore += weight;

        if (property.bathrooms >= filters.minBathrooms.value) {
          const extraBathrooms = property.bathrooms - filters.minBathrooms.value;
          const score = weight * Math.min(1, 0.8 + extraBathrooms * 0.2);
          totalScore += score;
          matchDetails.bathrooms = { matched: true, contribution: score };
        } else {
          const bathroomRatio = property.bathrooms / filters.minBathrooms.value;
          const score = weight * bathroomRatio * 0.4;
          totalScore += score;
          matchDetails.bathrooms = { matched: false, contribution: score };
        }
      }

      // Score: Garden
      if (filters.hasGarden) {
        const weight = filters.hasGarden.weight;
        maxPossibleScore += weight;

        if (property.hasGarden) {
          totalScore += weight;
          matchDetails.hasGarden = { matched: true, contribution: weight };
        } else {
          matchDetails.hasGarden = { matched: false, contribution: 0 };
        }
      }

      // Score: Student Property
      if (filters.isStudent) {
        const weight = filters.isStudent.weight;
        maxPossibleScore += weight;

        const wantsStudent = filters.isStudent.value;
        if ((wantsStudent && property.isStudent) || (!wantsStudent && !property.isStudent)) {
          totalScore += weight;
          matchDetails.isStudent = { matched: true, contribution: weight };
        } else {
          // Small penalty for mismatch
          matchDetails.isStudent = { matched: false, contribution: 0 };
        }
      }

      // Score: Property Type
      if (filters.propertyType && filters.propertyType.values.length > 0) {
        const weight = filters.propertyType.weight;
        maxPossibleScore += weight;

        const matches = filters.propertyType.values.some(
          type => property.propertyType.toLowerCase().includes(type.toLowerCase())
        );

        if (matches) {
          totalScore += weight;
          matchDetails.propertyType = { matched: true, contribution: weight };
        } else {
          matchDetails.propertyType = { matched: false, contribution: 0 };
        }
      }

      // Score: Multiple Location Proximities
      if (filters.locations && filters.locations.length > 0 && property.latitude && property.longitude) {
        filters.locations.forEach((locationFilter, index) => {
          const weight = locationFilter.weight;
          maxPossibleScore += weight;

          const distance = this.calculateDistance(
            locationFilter.lat,
            locationFilter.lng,
            property.latitude,
            property.longitude
          );

          const locationKey = `location_${locationFilter.name || index}`;

          if (distance <= locationFilter.maxDistance) {
            // Score based on proximity (closer = better)
            const proximityRatio = 1 - (distance / locationFilter.maxDistance);
            const score = weight * (0.5 + proximityRatio * 0.5); // Min 50% if within range
            totalScore += score;
            matchDetails[locationKey] = { matched: true, contribution: score, distance: distance.toFixed(2) + 'km' };
          } else {
            // Partial credit if reasonably close
            const excessRatio = Math.min((distance - locationFilter.maxDistance) / locationFilter.maxDistance, 1);
            const score = weight * (0.3 * (1 - excessRatio));
            totalScore += score;
            matchDetails[locationKey] = { matched: false, contribution: score, distance: distance.toFixed(2) + 'km' };
          }
        });
      }

      // Score: Room Criteria
      if (filters.rooms && property.roomDetails) {
        const weight = filters.rooms.weight;
        const criteria = filters.rooms.criteria;
        let roomScore = 0;
        let roomCriteriaCount = 0;
        const roomMatches: any = {};

        // Check minimum double rooms
        if (criteria.minDoubleRooms !== undefined) {
          roomCriteriaCount++;
          if (property.roomDetails.doubleRooms >= criteria.minDoubleRooms) {
            roomScore += 1;
            roomMatches.doubleRooms = true;
          } else {
            const ratio = property.roomDetails.doubleRooms / criteria.minDoubleRooms;
            roomScore += ratio * 0.5; // Partial credit
            roomMatches.doubleRooms = false;
          }
        }

        // Check minimum ensuite rooms
        if (criteria.minEnsuiteRooms !== undefined) {
          roomCriteriaCount++;
          if (property.roomDetails.ensuiteRooms >= criteria.minEnsuiteRooms) {
            roomScore += 1;
            roomMatches.ensuiteRooms = true;
          } else {
            const ratio = property.roomDetails.ensuiteRooms / criteria.minEnsuiteRooms;
            roomScore += ratio * 0.5; // Partial credit
            roomMatches.ensuiteRooms = false;
          }
        }

        // Check similarly sized rooms
        if (criteria.similarSizedRooms !== undefined) {
          roomCriteriaCount++;
          if (property.roomDetails.similarSizedRooms === criteria.similarSizedRooms) {
            roomScore += 1;
            roomMatches.similarSizedRooms = true;
          } else {
            roomMatches.similarSizedRooms = false;
          }
        }

        // Check master bedroom
        if (criteria.hasMasterBedroom !== undefined) {
          roomCriteriaCount++;
          if (property.roomDetails.hasMasterBedroom === criteria.hasMasterBedroom) {
            roomScore += 1;
            roomMatches.hasMasterBedroom = true;
          } else {
            roomMatches.hasMasterBedroom = false;
          }
        }

        // Calculate final room score
        if (roomCriteriaCount > 0) {
          maxPossibleScore += weight;
          const normalizedRoomScore = (roomScore / roomCriteriaCount) * weight;
          totalScore += normalizedRoomScore;
          matchDetails.rooms = {
            matched: roomScore === roomCriteriaCount,
            contribution: normalizedRoomScore,
            details: roomMatches,
          };
        }
      }

      // Normalize score to 0-100 range
      const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      return {
        ...property,
        relevanceScore: Math.round(normalizedScore * 100) / 100,
        matchDetails,
      };
    });

    // Sort by relevance score (highest first)
    return scoredProperties.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculates distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new ScoringService();
