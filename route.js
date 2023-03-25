import * as lint from './controllers/lint';

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`Hello. welcome to Stylelint. ${process.env.NODE_ENV || 'devel'}`);
});

router.post('/api/lint', lint.report);

export default router;
