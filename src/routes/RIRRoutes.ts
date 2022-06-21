import { Router } from 'express';
import RIRController from '../controllers/RIRController.js';

const router = Router();
router
    .get('/rir', RIRController.findAllRIRs)
    .get('/rir/deleted', RIRController.findAllRIRDeleted)
    .get('/rir/:id', RIRController.findOneRIR)
    .post('/rir', RIRController.createRIR)
    .post('/rir/restore/:id', RIRController.restoreRIR)
    .put('/rir/:id', RIRController.updateRIR)
    .delete('/rir/:id', RIRController.destroyRIR);

    export default router;
