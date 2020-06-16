const API_KEY = '14121998';

const _ = require('lodash');
const express = require('express')
const router = express.Router();
const { poolPromised, sql } = require('../db')

router.get('/', (req, res) => {
    res.end('API RUNNING...');
})

/*--------------------------- USER ------------------------*/
router.get('/user', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        if(_.has(req, 'query.fbid')) {
            const { fbid } = req.query;
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('fbid', sql.NVarChar, fbid)
                                            .query('SELECT UserPhone, Name, Address, FBID FROM [User] where fbid=@fbid');
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

router.post('/user', async (req, res, next) => {
    console.log(req.body);
    if(req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.'}));
    } else {
        const { userPhone, username, address, fbid} = req.body;
        console.log(req.body)
        if(!_.isUndefined(fbid)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('UserPhone', sql.NVarChar, userPhone)
                                            .input('username', sql.NVarChar, username)
                                            .input('Address', sql.NVarChar, address)
                                            .input('FBID', sql.NVarChar, fbid)
                                            .query('IF EXISTS(SELECT * FROM [User] WHERE FBID=@fbid)'
                                                + ' UPDATE [User] SET Name=@username, Address=@Address, UserPhone=@UserPhone WHERE FBID=@FBID'
                                                + ' ELSE'
                                                + ' INSERT INTO [User](FBID, UserPhone, Name, Address) OUTPUT Inserted.FBID, Inserted.UserPhone, Inserted.Name, Inserted.Address'
                                                + ' VALUES(@FBID, @UserPhone, @username, @Address)'
                                            );
                console.log('===========>', queryResult);
                if(!_.isUndefined(queryResult.rowsAffected)) {
                    res.send(JSON.stringify({ success: true, message: 'Insert OK' }));
                } else {
                    res.send(JSON.stringify({ success: false, message: 'Insert failed' }));
                }
            } catch(err) {
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }                                
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing fbid in POST body' }));
        }

    }
})


/*--------------------------- RESTAURANT ------------------------*/
router.get('/restaurant', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
                                        .query('SELECT ID, Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl FROM [Restaurant]');
            if(queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
            } else {
                res.send(JSON.stringify({ success: false, message: 'Empty' }));
            }                                       
        } catch(err) { 
            res.status(500); //Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
})

router.get('/restaurantById', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { id } = req.query;
        if(!_.isUndefined(id)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('RestaurantID', sql.Int, id)
                                            .query('SELECT ID, Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl FROM [Restaurant] WHERE id=@RestaurantID');
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
            res.send(JSON.stringify({ success: false, message: 'Missing restaurant id'}));
        }
    }
})

router.get('/restaurantNearBy', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const userLatitude = parseFloat(req.query.lat);
        const userLongtitude = parseFloat(req.query.lng);
        const distance = parseInt(req.query.distance);


        if(_.isNumber(userLatitude) && _.isNumber(userLongtitude)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('Latitude', sql.Float, userLatitude)
                                            .input('Longtitude', sql.Float, userLongtitude)
                                            .input('Distance', sql.Int, distance)
                                            .query('SELECT * FROM(SELECT Id, Name, Address, Phone, Lat, Lng, UserOwner, Image, PaymentUrl,'
                                                + ' ROUND(111.1111 * DEGREES(ACOS(COS(RADIANS(@Latitude)) * COS(RADIANS(lat))'
                                                + '* COS(RADIANS(lng) - RADIANS(@Longtitude)) + SIN(RADIANS(@Latitude))'
                                                + '* SIN(RADIANS(lat)))), 2) AS DistanceInKm FROM [Restaurant])tempTable'
                                                + ' WHERE DistanceInKm < @Distance');
                                            // 111.1111 : số km trên 1 độ vĩ độ
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
            res.send(JSON.stringify({ success: false, message: 'Missing userLatitude or userLongtitude'}));
        }
    }
})


/*--------------------------- FOOD ------------------------*/
router.get('/food', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key != API_KEY) {
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

router.get('/foodById', async (req, res, next) => {
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

router.get('/foodSearchByName', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        const { search } = req.query;
        if(!_.isUndefined(search)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('Search', sql.NVarChar, ` -%${search}%- `)
                                        .query('SELECT Id, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE Name LIKE @Search');
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

/*--------------------------- MENU ------------------------*/
router.get('/menu', async (req, res, next) => {
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

module.exports = router;