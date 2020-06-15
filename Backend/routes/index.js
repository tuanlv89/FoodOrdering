const API_KEY = '1234';

const express = require('express')
const router = express.Router();
const { poolPromise, sql } = require('../db')

router.get('/', (req, res) => {
    res.end('API RUNNING...');
})

//===================================
// USER TABLE
// POST / GET
//===================================
router.get('/user', async (req, res, next) => {
    console.log(req.query);
    if(req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        let fbid = req.query.fbid;
        if(fbid !== undefined) {
            try {
                const pool = await poolPromise;
                const queryResult = await pool.request().input('fbid', sql.NVarChar, fbid).query('SELECT userPhone, name, address, fbid FROM [User] where fbid=@fbid');
                if(queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }                                       
            } catch(err) { 
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing fbid in query' }));
        }
    }
})

module.exports = router;