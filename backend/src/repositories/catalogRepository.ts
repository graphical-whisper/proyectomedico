import { pool, getDbConnectionStatus } from '../config/database.js';
import { CatalogItem } from '../types/index.js';
import { INITIAL_CATALOGS } from './catalogData.js';

export class CatalogRepository {
  private inMemoryCatalogs: CatalogItem[] = [...INITIAL_CATALOGS];

  async searchByCategory(category: string, query?: string, limit: number = 20): Promise<CatalogItem[]> {
    if (getDbConnectionStatus()) {
      try {
        let sql = `
          SELECT id, category, code, name, description, frequency
          FROM catalog_items
          WHERE category = $1
        `;
        const params: any[] = [category];

        if (query && query.trim().length > 0) {
          sql += ` AND (name ILIKE $2 OR code ILIKE $2)`;
          params.push(`%${query.trim()}%`);
          sql += ` ORDER BY frequency DESC, name ASC LIMIT $3`;
          params.push(limit);
        } else {
          sql += ` ORDER BY frequency DESC, name ASC LIMIT $2`;
          params.push(limit);
        }

        const res = await pool.query(sql, params);
        return res.rows;
      } catch (err: any) {
        console.warn('Error al consultar catalogo en PostgreSQL, usando fallback en memoria:', err.message);
      }
    }

    // Fallback en memoria si la BD no esta disponible
    let results = this.inMemoryCatalogs.filter(item => item.category === category);
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(q) || (item.code && item.code.toLowerCase().includes(q))
      );
    }
    return results.sort((a, b) => (b.frequency || 0) - (a.frequency || 0)).slice(0, limit);
  }

  async addCatalogItem(item: Omit<CatalogItem, 'id'>): Promise<CatalogItem> {
    const newItem: CatalogItem = {
      ...item,
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    if (getDbConnectionStatus()) {
      try {
        await pool.query(
          `INSERT INTO catalog_items (id, category, code, name, description, frequency)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newItem.id, newItem.category, newItem.code || null, newItem.name, newItem.description || null, newItem.frequency || 1]
        );
      } catch (err: any) {
        console.warn('Error al guardar termino nuevo en PostgreSQL:', err.message);
      }
    }

    this.inMemoryCatalogs.push(newItem);
    return newItem;
  }
}
