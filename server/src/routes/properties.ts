import { Router, Request, Response } from 'express';
import { getAllProperties, insertProperty, clearProperties } from '../database/db';
import rightmoveService from '../services/rightmoveService';
import scoringService from '../services/scoringService';
import { WeightedFilter } from '../types/property';
import NodeCache from 'node-cache';

const router = Router();

// Cache for scraped data (TTL: 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * GET /api/properties
 * Returns all properties with optional scoring/filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const properties = getAllProperties();

    // If no filters provided, return all properties
    if (!req.query.filters) {
      return res.json({ properties, count: properties.length });
    }

    // Parse weighted filters from query
    const filters: WeightedFilter = JSON.parse(req.query.filters as string);

    // Score and filter properties
    const scoredProperties = scoringService.scoreProperties(properties, filters);

    res.json({
      properties: scoredProperties,
      count: scoredProperties.length,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

/**
 * POST /api/properties/scrape
 * Scrapes properties from Rightmove and stores them in the database
 */
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check cache first
    const cached = cache.get(url);
    if (cached) {
      return res.json({
        message: 'Using cached data',
        count: (cached as any).length,
        cached: true,
      });
    }

    // Scrape properties
    const properties = await rightmoveService.fetchProperties(url);

    // Store in database
    properties.forEach(property => {
      insertProperty(property);
    });

    // Cache the URL
    cache.set(url, properties);

    res.json({
      message: 'Properties scraped successfully',
      count: properties.length,
      cached: false,
    });
  } catch (error) {
    console.error('Error scraping properties:', error);
    res.status(500).json({ error: 'Failed to scrape properties from Rightmove' });
  }
});

/**
 * POST /api/properties/scrape-nottingham
 * Quick endpoint to scrape Nottingham area
 */
router.post('/scrape-nottingham', async (req: Request, res: Response) => {
  try {
    const { radius = 10 } = req.body;

    const url = rightmoveService.getNottinghamSearchUrl(radius);

    // Check cache
    const cached = cache.get(url);
    if (cached) {
      return res.json({
        message: 'Using cached data for Nottingham',
        count: (cached as any).length,
        cached: true,
      });
    }

    // Scrape properties
    const properties = await rightmoveService.fetchProperties(url);

    // Store in database
    properties.forEach(property => {
      insertProperty(property);
    });

    // Cache the URL
    cache.set(url, properties);

    res.json({
      message: 'Nottingham properties scraped successfully',
      count: properties.length,
      url,
      cached: false,
    });
  } catch (error) {
    console.error('Error scraping Nottingham properties:', error);
    res.status(500).json({ error: 'Failed to scrape properties from Rightmove' });
  }
});

/**
 * DELETE /api/properties
 * Clears all properties from the database
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    clearProperties();
    cache.flushAll();
    res.json({ message: 'All properties cleared successfully' });
  } catch (error) {
    console.error('Error clearing properties:', error);
    res.status(500).json({ error: 'Failed to clear properties' });
  }
});

/**
 * GET /api/properties/stats
 * Returns statistics about stored properties
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const properties = getAllProperties();

    const stats = {
      total: properties.length,
      averagePrice: properties.reduce((sum, p) => sum + p.price, 0) / properties.length || 0,
      studentProperties: properties.filter(p => p.isStudent).length,
      withGarden: properties.filter(p => p.hasGarden).length,
      propertyTypes: properties.reduce((acc, p) => {
        acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bedroomDistribution: properties.reduce((acc, p) => {
        acc[p.bedrooms] = (acc[p.bedrooms] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
