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

export interface WeightedFilter {
  maxPrice?: { value: number; weight: number };
  minBedrooms?: { value: number; weight: number };
  minBathrooms?: { value: number; weight: number };
  hasGarden?: { weight: number };
  isStudent?: { value: boolean; weight: number };
  propertyType?: { values: string[]; weight: number };
  location?: {
    lat: number;
    lng: number;
    maxDistance: number;
    weight: number;
  };
}
