import fs from 'fs';
import path from 'path';
import { pool, getDbConnectionStatus } from '../config/database.js';
import { CatalogItem } from '../types/index.js';
import { INITIAL_CATALOGS } from './catalogData.js';

export class CatalogRepository {
  private inMemoryCatalogs: CatalogItem[] = [...INITIAL_CATALOGS];

  constructor() {
    this.loadExamsCatalog();
  }

  private loadExamsCatalog() {
    const candidatePaths = [
      path.resolve(process.cwd(), 'exams.json'),
      path.resolve(process.cwd(), '../exams.json'),
      path.resolve(process.cwd(), '../../exams.json')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf-8');
          const exams = JSON.parse(raw);
          if (Array.isArray(exams)) {
            const mappedExams: CatalogItem[] = exams.map((ex: any) => ({
              id: `exam-${ex.TestId || Math.random()}`,
              category: 'examen',
              code: ex.AltCode || ex.Abbreviation || '',
              name: ex.Name,
              description: [ex.ShortName, ex.Notes].filter(Boolean).join(' | '),
              frequency: 10
            }));
            this.inMemoryCatalogs.push(...mappedExams);
            console.log(`Portafolio de examenes cargado: ${mappedExams.length} registros desde ${p}`);
            break;
          }
        } catch (e: any) {
          console.warn('No se pudo parsear el archivo exams.json:', e.message);
        }
      }
    }
  }

  async searchByCategory(category: string, query?: string, limit: number = 20): Promise<CatalogItem[]> {
    const targetCategory = category === 'laboratorio' ? 'examen' : category;

    if (getDbConnectionStatus()) {
      try {
        let sql = `
          SELECT id, category, code, name, description, frequency
          FROM catalog_items
          WHERE category = $1
        `;
        const params: any[] = [targetCategory];

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
        if (res.rows.length > 0) {
          return res.rows;
        }
      } catch (err: any) {
        console.warn('Error al consultar catalogo en PostgreSQL, usando fallback en memoria:', err.message);
      }
    }

    // Fallback en memoria o si no hay resultados en DB (ej. para examen cargado de exams.json)
    let results = this.inMemoryCatalogs.filter(item => item.category === targetCategory);
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
