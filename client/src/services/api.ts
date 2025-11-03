import axios from 'axios';
import { Property, ScoredProperty, WeightedFilter } from '../types/property';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
  // Fetch all properties with optional filtering
  async getProperties(filters?: WeightedFilter): Promise<ScoredProperty[]> {
    const params = filters ? { filters: JSON.stringify(filters) } : {};
    const response = await axios.get(`${API_BASE_URL}/properties`, { params });
    return response.data.properties;
  },

  // Scrape properties from a Rightmove URL
  async scrapeProperties(url: string): Promise<{ count: number; cached: boolean }> {
    const response = await axios.post(`${API_BASE_URL}/properties/scrape`, { url });
    return response.data;
  },

  // Quick scrape for Nottingham area
  async scrapeNottingham(radius: number = 10): Promise<{ count: number; cached: boolean; url: string }> {
    const response = await axios.post(`${API_BASE_URL}/properties/scrape-nottingham`, { radius });
    return response.data;
  },

  // Get statistics
  async getStats(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/properties/stats`);
    return response.data;
  },

  // Clear all properties
  async clearProperties(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/properties`);
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },
};
