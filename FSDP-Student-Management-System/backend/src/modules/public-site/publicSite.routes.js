import { Router } from 'express';
import { publicCatalogue } from './publicSite.repository.js';
export const publicSiteRouter = Router();
publicSiteRouter.get('/catalogue', async (req, res) => res.json(await publicCatalogue()));
