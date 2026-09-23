import { Router } from 'express';
import {
  submitJobApplication,
  getAllJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
} from '../controllers/career.controller';

const careerRouter = Router();

careerRouter.post('/careers/apply', submitJobApplication);
careerRouter.get('/careers/applications', getAllJobApplications);
careerRouter.patch('/careers/applications/:id', updateJobApplicationStatus);
careerRouter.delete('/careers/applications/:id', deleteJobApplication);

export default careerRouter;
