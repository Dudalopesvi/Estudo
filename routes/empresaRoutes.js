import express from 'express';
import { getEmpresaPerfil } from '../controllers/empresaController.js';

const router = express.Router();

router.get('/empresa', getEmpresaPerfil);

export default router;