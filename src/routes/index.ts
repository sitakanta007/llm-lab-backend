import express from 'express';
import generateRoutes from './generateRoutes.js';
import experimentsRoutes from './experimentsRoutes.js';
import experimentDetails from './experimentDetails.js';
import summaryRoutes from './summaryRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

// Register all routes
router.use(generateRoutes);
router.use(experimentsRoutes);
router.use(experimentDetails);
router.use(summaryRoutes);
router.use(healthRoutes);

export default router;
