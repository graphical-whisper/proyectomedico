import { Request, Response } from 'express';
import { ConsultationService } from '../services/consultationService.js';

export class ConsultationController {
  private consultService: ConsultationService;

  constructor(consultService?: ConsultationService) {
    this.consultService = consultService || new ConsultationService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const saved = await this.consultService.createConsultation(req.body);
      const summaryText = this.consultService.generateClinicalSummaryText(saved);

      res.status(201).json({
        success: true,
        message: 'Consulta registrada correctamente',
        data: saved,
        summaryText
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const consultation = await this.consultService.getConsultationById(id);

      if (!consultation) {
        res.status(404).json({
          success: false,
          error: 'Consulta no encontrada'
        });
        return;
      }

      const summaryText = this.consultService.generateClinicalSummaryText(consultation);

      res.json({
        success: true,
        data: consultation,
        summaryText
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.consultService.getRecentConsultations(20);
      res.json({
        success: true,
        total: items.length,
        data: items
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  };

  previewSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summaryText = this.consultService.generateClinicalSummaryText(req.body);
      res.json({
        success: true,
        summaryText
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };
}
