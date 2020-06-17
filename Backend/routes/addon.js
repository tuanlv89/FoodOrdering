const router = require('./index');
const API_KEY = '14121998';
const _ = require('lodash');
const { poolPromised, sql } = require('../db')


exports.getAddOnByFoodId = router.get('/addon', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { foodId } = req.query;
        if(!_.isUndefined(foodId)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('FoodId', sql.Int, foodId)
                                            .query('SELECT ID, Description, ExtraPrice FROM [Addon] WHERE id IN'
                                            + ' (SELECT AddonId FROM [Food_AddOn] WHERE FoodId = @FoodId)');
                if(queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }                                       
            } catch(err) { 
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing foodId'}));
        }
    }
})
