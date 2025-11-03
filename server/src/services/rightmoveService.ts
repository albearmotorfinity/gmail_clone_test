import axios from 'axios';
import * as cheerio from 'cheerio';
import { Property, RoomDetails } from '../types/property';

/**
 * Scrapes property listings from Rightmove search results
 * Note: This is a basic scraper. Rightmove may block requests or change their HTML structure.
 * Consider using their API if available or implementing rate limiting and user agents.
 */
export class RightmoveService {
  private baseUrl = 'https://www.rightmove.co.uk';

  /**
   * Fetches properties from Rightmove for a given search URL
   * Example URL: https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=REGION%5E274&propertyTypes=&mustHave=&dontShow=&furnishTypes=&keywords=
   */
  async fetchProperties(searchUrl: string): Promise<Property[]> {
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const properties: Property[] = [];

      // Find property cards
      $('.propertyCard').each((index, element) => {
        try {
          const $card = $(element);

          // Extract property ID
          const propertyId = $card.attr('id')?.replace('property-', '') || `property-${Date.now()}-${index}`;

          // Extract title and URL
          const titleElement = $card.find('.propertyCard-title');
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href') || '';
          const url = relativeUrl.startsWith('http') ? relativeUrl : `${this.baseUrl}${relativeUrl}`;

          // Extract price
          const priceText = $card.find('.propertyCard-priceValue').text().trim();
          const price = this.parsePrice(priceText);
          const priceQualifier = $card.find('.propertyCard-priceQualifier').text().trim();

          // Extract address
          const address = $card.find('.propertyCard-address').text().trim();

          // Extract property details (bedrooms, bathrooms, etc.)
          const detailsText = $card.find('.propertyCard-details').text().trim();
          const { bedrooms, bathrooms, propertyType } = this.parseDetails(detailsText, title);

          // Extract description
          const description = $card.find('.propertyCard-description').text().trim();

          // Extract images
          const images: string[] = [];
          $card.find('img').each((i, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && !src.includes('placeholder')) {
              images.push(src);
            }
          });

          // Detect if it's a student property
          const isStudent = this.detectStudentProperty(title, description, propertyType);

          // Detect garden
          const hasGarden = this.detectGarden(description, title);

          // Detect room details
          const roomDetails = this.detectRoomDetails(description, title, bedrooms);

          // Extract date added
          const addedOn = $card.find('.propertyCard-branchSummary-addedOrReduced').text().trim();

          const property: Property = {
            id: propertyId,
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
            addedOn,
            scrapedAt: new Date(),
            roomDetails,
          };

          properties.push(property);
        } catch (error) {
          console.error('Error parsing property card:', error);
        }
      });

      return properties;
    } catch (error) {
      console.error('Error fetching properties from Rightmove:', error);
      throw new Error('Failed to fetch properties from Rightmove');
    }
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[£,]/g, '');
    const match = cleaned.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  private parseDetails(detailsText: string, title: string): { bedrooms: number; bathrooms: number; propertyType: string } {
    let bedrooms = 0;
    let bathrooms = 0;
    let propertyType = 'Unknown';

    // Extract bedrooms
    const bedroomMatch = detailsText.match(/(\d+)\s*bed/i) || title.match(/(\d+)\s*bed/i);
    if (bedroomMatch) {
      bedrooms = parseInt(bedroomMatch[1], 10);
    }

    // Extract bathrooms
    const bathroomMatch = detailsText.match(/(\d+)\s*bath/i) || title.match(/(\d+)\s*bath/i);
    if (bathroomMatch) {
      bathrooms = parseInt(bathroomMatch[1], 10);
    }

    // Detect property type
    const typeKeywords = ['flat', 'apartment', 'house', 'detached', 'semi-detached', 'terraced', 'bungalow', 'studio'];
    const combinedText = `${title} ${detailsText}`.toLowerCase();

    for (const keyword of typeKeywords) {
      if (combinedText.includes(keyword)) {
        propertyType = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    return { bedrooms, bathrooms, propertyType };
  }

  private detectStudentProperty(title: string, description: string, propertyType: string): boolean {
    const studentKeywords = [
      'student',
      'university',
      'uni',
      'accommodation',
      'academic year',
      'september start',
      'bills included',
      'all inclusive',
    ];

    const combinedText = `${title} ${description} ${propertyType}`.toLowerCase();
    return studentKeywords.some(keyword => combinedText.includes(keyword));
  }

  private detectGarden(description: string, title: string): boolean {
    const gardenKeywords = ['garden', 'yard', 'patio', 'outdoor space', 'terrace', 'balcony'];
    const combinedText = `${title} ${description}`.toLowerCase();
    return gardenKeywords.some(keyword => combinedText.includes(keyword));
  }

  private detectRoomDetails(description: string, title: string, totalBedrooms: number): RoomDetails {
    const combinedText = `${title} ${description}`.toLowerCase();

    // Detect double bedrooms
    let doubleRooms = 0;
    const doubleMatch = combinedText.match(/(\d+)\s*double\s*bedroom/i);
    if (doubleMatch) {
      doubleRooms = parseInt(doubleMatch[1], 10);
    } else if (combinedText.includes('double bedroom') || combinedText.includes('double bed')) {
      doubleRooms = 1;
    } else if (combinedText.includes('all double') || combinedText.includes('both double')) {
      doubleRooms = totalBedrooms;
    }

    // Detect single bedrooms
    let singleRooms = 0;
    const singleMatch = combinedText.match(/(\d+)\s*single\s*bedroom/i);
    if (singleMatch) {
      singleRooms = parseInt(singleMatch[1], 10);
    } else if (combinedText.includes('single bedroom') || combinedText.includes('single bed')) {
      singleRooms = 1;
    }

    // If we know doubles/singles, calculate the other
    if (doubleRooms > 0 && singleRooms === 0 && doubleRooms < totalBedrooms) {
      singleRooms = totalBedrooms - doubleRooms;
    } else if (singleRooms > 0 && doubleRooms === 0 && singleRooms < totalBedrooms) {
      doubleRooms = totalBedrooms - singleRooms;
    }

    // Detect ensuite rooms
    let ensuiteRooms = 0;
    const ensuiteMatch = combinedText.match(/(\d+)\s*en-?suite/i);
    if (ensuiteMatch) {
      ensuiteRooms = parseInt(ensuiteMatch[1], 10);
    } else if (combinedText.includes('ensuite') || combinedText.includes('en-suite') || combinedText.includes('en suite')) {
      ensuiteRooms = 1;
    }

    // Detect master bedroom
    const hasMasterBedroom = combinedText.includes('master bedroom') ||
                             combinedText.includes('master bed') ||
                             combinedText.includes('main bedroom');

    // Detect similarly sized rooms
    const similarSizedRooms = combinedText.includes('similarly sized') ||
                              combinedText.includes('same size') ||
                              combinedText.includes('equal size') ||
                              combinedText.includes('comparable size') ||
                              combinedText.includes('similar size');

    return {
      doubleRooms,
      singleRooms,
      ensuiteRooms,
      hasMasterBedroom,
      similarSizedRooms,
    };
  }

  /**
   * Generates a Rightmove search URL for Nottingham area
   */
  getNottinghamSearchUrl(radius: number = 10): string {
    // Nottingham location identifier
    const locationId = 'REGION%5E274'; // Nottingham region
    return `${this.baseUrl}/property-to-rent/find.html?locationIdentifier=${locationId}&radius=${radius}.0&propertyTypes=&mustHave=&dontShow=&furnishTypes=&keywords=`;
  }
}

export default new RightmoveService();
