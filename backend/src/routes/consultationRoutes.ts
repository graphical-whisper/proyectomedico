import { Router } from 'express';
import { ConsultationController } from '../controllers/consultationController.js';

const router = Router();
const controller = new ConsultationController();

router.get('/', controller.list);
router.post('/', controller.create);
router.post('/preview-summary', controller.previewSummary);
router.get('/:id', controller.getById);

export default router;
