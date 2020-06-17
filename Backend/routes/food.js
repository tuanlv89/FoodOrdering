const router = require('./index');
const API_KEY = '14121998';
const _ = require('lodash');
const { poolPromised, sql } = require('../db')


exports.getFoodByMenuId = router.get('/food', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { menuId } = req.query;
        if(!_.isUndefined(menuId)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('MenuId', sql.Int, menuId)
                                            .query('SELECT ID, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE id IN'
                                            + ' (SELECT FoodID FROM [Menu_Food] WHERE MenuID = @MenuId)');
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
            res.send(JSON.stringify({ success: false, message: 'Missing menuId'}));
        }
    }
})

exports.getFoodById = router.get('/foodById', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key'}));
    } else {
        const { id } = req.query;
        if(!_.isUndefined(id)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('FoodId', sql.Int, id)
                                        .query('SELECT Id, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE id = @FoodId');
                                        console.log('=====================>', queryResult)
                if(queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset[0] }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }
     
            } catch(err) {
                res.status(500); // Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing FoodID'}));
        }
    }
});

exports.searchFoodByName = router.get('/foodSearchByName', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { search } = req.query;
        if(!_.isUndefined(search)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('Search', sql.NVarChar, `%${search}%`)
                                        .query('SELECT Id, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE name LIKE @Search');
                if(queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Empty' }));
                }
            } catch(err) {
                res.status(500); //Internal server error
                res.send({ success: false, message: err.message });
            }
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing search param' }));
        }
    }
});
