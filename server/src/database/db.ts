import Database from 'better-sqlite3';
import path from 'path';
import { Property } from '../types/property';

const dbPath = path.join(__dirname, '../../data/properties.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    priceQualifier TEXT,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    propertyType TEXT NOT NULL,
    address TEXT NOT NULL,
    postcode TEXT,
    latitude REAL,
    longitude REAL,
    hasGarden INTEGER NOT NULL,
    description TEXT,
    images TEXT,
    url TEXT NOT NULL,
    isStudent INTEGER NOT NULL,
    furnishedStatus TEXT,
    availableFrom TEXT,
    addedOn TEXT,
    scrapedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_price ON properties(price);
  CREATE INDEX IF NOT EXISTS idx_bedrooms ON properties(bedrooms);
  CREATE INDEX IF NOT EXISTS idx_bathrooms ON properties(bathrooms);
  CREATE INDEX IF NOT EXISTS idx_isStudent ON properties(isStudent);
  CREATE INDEX IF NOT EXISTS idx_hasGarden ON properties(hasGarden);
`);

export const insertProperty = (property: Property) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO properties (
      id, title, price, priceQualifier, bedrooms, bathrooms, propertyType,
      address, postcode, latitude, longitude, hasGarden, description, images,
      url, isStudent, furnishedStatus, availableFrom, addedOn, scrapedAt
    ) VALUES (
      @id, @title, @price, @priceQualifier, @bedrooms, @bathrooms, @propertyType,
      @address, @postcode, @latitude, @longitude, @hasGarden, @description, @images,
      @url, @isStudent, @furnishedStatus, @availableFrom, @addedOn, @scrapedAt
    )
  `);

  stmt.run({
    ...property,
    hasGarden: property.hasGarden ? 1 : 0,
    isStudent: property.isStudent ? 1 : 0,
    images: JSON.stringify(property.images),
    scrapedAt: property.scrapedAt.toISOString(),
  });
};

export const getAllProperties = (): Property[] => {
  const stmt = db.prepare('SELECT * FROM properties');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    ...row,
    hasGarden: row.hasGarden === 1,
    isStudent: row.isStudent === 1,
    images: JSON.parse(row.images || '[]'),
    scrapedAt: new Date(row.scrapedAt),
  }));
};

export const getPropertyById = (id: string): Property | undefined => {
  const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return undefined;

  return {
    ...row,
    hasGarden: row.hasGarden === 1,
    isStudent: row.isStudent === 1,
    images: JSON.parse(row.images || '[]'),
    scrapedAt: new Date(row.scrapedAt),
  };
};

export const clearProperties = () => {
  db.exec('DELETE FROM properties');
};

export default db;
