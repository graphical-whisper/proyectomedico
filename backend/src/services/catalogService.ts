import { CatalogRepository } from '../repositories/catalogRepository.js';
import { CatalogItem } from '../types/index.js';

export class CatalogService {
  private catalogRepo: CatalogRepository;

  constructor(catalogRepo?: CatalogRepository) {
    this.catalogRepo = catalogRepo || new CatalogRepository();
  }

  async search(category: string, query?: string, limit: number = 20): Promise<CatalogItem[]> {
    const validCategories = ['alergia', 'medicamento', 'diagnostico', 'motivo_consulta', 'antecedente', 'hallazgo_examen'];
    if (!validCategories.includes(category)) {
      throw new Error(`Categoria '${category}' no valida. Categorias permitidas: ${validCategories.join(', ')}`);
    }

    return await this.catalogRepo.searchByCategory(category, query, limit);
  }

  async registerCustomItem(category: any, name: string, code?: string): Promise<CatalogItem> {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del termino no puede estar vacio');
    }

    return await this.catalogRepo.addCatalogItem({
      category,
      name: name.trim(),
      code: code ? code.trim() : undefined,
      frequency: 1
    });
  }
}
