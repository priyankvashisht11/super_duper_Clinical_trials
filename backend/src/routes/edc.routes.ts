import { Router } from 'express';
import { edcController } from '../controllers/edc.controller';

const router = Router();

router.get('/state',                              (req, res) => edcController.getState(req, res));
router.post('/forms',                             (req, res) => edcController.createForm(req, res));
router.delete('/forms/:id',                       (req, res) => edcController.deleteForm(req, res));
router.post('/forms/:formId/fields',              (req, res) => edcController.addField(req, res));
router.patch('/forms/:formId/fields/:fieldId',    (req, res) => edcController.updateField(req, res));
router.delete('/forms/:formId/fields/:fieldId',   (req, res) => edcController.deleteField(req, res));
router.post('/forms/:formId/fields/:fieldId/move',(req, res) => edcController.moveField(req, res));
router.post('/patients',                          (req, res) => edcController.enrollPatient(req, res));
router.post('/entries',                           (req, res) => edcController.submitEntry(req, res));

export default router;
