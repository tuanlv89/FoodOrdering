import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.end('API RUNNING...');
})

module.exports = router;