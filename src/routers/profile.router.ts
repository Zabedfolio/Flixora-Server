import { Router } from 'express';
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar
} from '../controllers/profile.controller';

const router = Router();

router.get('/profiles', getProfiles);
router.post('/profiles', createProfile);
router.put('/profiles/:id', updateProfile);
router.delete('/profiles/:id', deleteProfile);
router.post('/upload', uploadAvatar);

export default router;
