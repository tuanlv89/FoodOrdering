const API_KEY = '14121998';

const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    res.end('API RUNNING...');
})

module.exports = router;