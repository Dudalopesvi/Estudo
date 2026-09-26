import { Router } from 'express';
import { toggleCurtida, getComentarios, addComentario } from '../controllers/interacoesController.js';

const router = Router();

router.post('/atividades/:id/curtir', toggleCurtida);
router.get('/atividades/:id/comentarios', getComentarios);
router.post('/atividades/:id/comentarios', addComentario);

export default router;