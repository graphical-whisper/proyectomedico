import { Request, Response } from 'express';
import { CatalogService } from '../services/catalogService.js';

export class CatalogController {
  private catalogService: CatalogService;

  constructor(catalogService?: CatalogService) {
    this.catalogService = catalogService || new CatalogService();
  }

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoria = String(req.params.categoria);
      const { q, limit } = req.query;

      const items = await this.catalogService.search(
        categoria,
        typeof q === 'string' ? q : undefined,
        limit ? parseInt(limit as string, 10) : 20
      );

      res.json({
        success: true,
        categoria,
        total: items.length,
        data: items
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };

  createCustom = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoria = String(req.params.categoria);
      const { name, code } = req.body;

      const newItem = await this.catalogService.registerCustomItem(categoria, name, code);
      res.status(201).json({
        success: true,
        data: newItem
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };
}
