const router = require('./index');
const API_KEY = '14121998';
const _ = require('lodash');
const { poolPromised, sql } = require('../db')


exports.getMenuByRestaurantId = router.get('/menu', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { restaurantId } = req.query;
        if(!_.isUndefined(restaurantId)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('RestaurantId', sql.Int, restaurantId)
                                            .query('SELECT ID, Name, Description, Image FROM [Menu] WHERE id IN'
                                            + ' (SELECT MenuId FROM [Restaurant_Menu] WHERE RestaurantId = @RestaurantId)');
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
            res.send(JSON.stringify({ success: false, message: 'Missing restaurantId'}));
        }
    }
})