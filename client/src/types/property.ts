export interface RoomDetails {
  doubleRooms: number; // Number of double bedrooms
  singleRooms: number; // Number of single bedrooms
  ensuiteRooms: number; // Number of ensuite rooms
  hasMasterBedroom: boolean; // Has a master bedroom
  similarSizedRooms: boolean; // Rooms are similarly sized
}

export interface Property {
  id: string;
  title: string;
  price: number;
  priceQualifier?: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  address: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  hasGarden: boolean;
  description: string;
  images: string[];
  url: string;
  isStudent: boolean;
  furnishedStatus?: string;
  availableFrom?: string;
  addedOn: string;
  scrapedAt: Date;
  roomDetails?: RoomDetails; // Detailed room information
}

export interface ScoredProperty extends Property {
  relevanceScore: number;
  matchDetails: {
    [key: string]: {
      matched: boolean;
      contribution: number;
    };
  };
}

export interface LocationFilter {
  name: string; // e.g., "University", "Work", "City Centre"
  lat: number;
  lng: number;
  maxDistance: number; // in km
  weight: number;
}

export interface RoomFilter {
  minDoubleRooms?: number;
  minEnsuiteRooms?: number;
  similarSizedRooms?: boolean;
  hasMasterBedroom?: boolean;
}

export interface WeightedFilter {
  maxPrice?: { value: number; weight: number };
  minBedrooms?: { value: number; weight: number };
  minBathrooms?: { value: number; weight: number };
  hasGarden?: { weight: number };
  isStudent?: { value: boolean; weight: number };
  propertyType?: { values: string[]; weight: number };
  locations?: LocationFilter[]; // Multiple locations with individual weights
  rooms?: { criteria: RoomFilter; weight: number };
}
