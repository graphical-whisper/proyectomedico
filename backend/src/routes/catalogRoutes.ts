import { Router } from 'express';
import { CatalogController } from '../controllers/catalogController.js';

const router = Router();
const controller = new CatalogController();

router.get('/:categoria', controller.search);
router.post('/:categoria', controller.createCustom);

export default router;
