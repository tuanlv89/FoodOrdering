import router from '../routes';
import _ from 'lodash';
import { poolPromised, sql } from '../db';
import { API_KEY } from '../assets/const';

// Get
const getMyFavorite = router.get('/favorite', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        if(_.has(req, 'query.fbid')) {
            const { fbid } = req.query;
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('fbid', sql.NVarChar, fbid)
                                        .query('SELECT Fbid, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price FROM [Favorite] where Fbid=@fbid');
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
            res.send(JSON.stringify({ success: false, message: 'Missing fbid in query' }));
        }
    }
})

const getFavoriteByRestaurant = router.get('/favoriteByRestaurant', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        if(_.has(req, 'query.fbid') && _.has(req, 'query.restaurantId')) {
            const { fbid, restaurantId } = req.query;
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('fbid', sql.NVarChar, fbid)
                                        .input('restaurantId', sql.Int, restaurantId)
                                        .query('SELECT Fbid, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price FROM [Favorite] where Fbid=@fbid AND RestaurantId=@restaurantId');
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
            res.send(JSON.stringify({ success: false, message: 'Missing fbid or restaurantId in query' }));
        }
    }
})

const addFavorite = router.post('/favorite', async (req, res, next) => { // error api
    console.log(req.body);
    if(req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.'}));
    } else {
        const { fbid, foodId, restaurantId, restaurantName, foodName, foodImage, foodPrice }= req.body;
        
        if(!_.isUndefined(fbid)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('FBID', sql.NVarChar, fbid)
                                        .input('FoodId', sql.Int, foodId)
                                        .input('RestaurantId', sql.Int, restaurantId)
                                        .input('RestaurantName', sql.NVarChar, restaurantName)
                                        .input('FoodName', sql.NVarChar, foodName)
                                        .input('FoodImage', sql.NVarChar, foodImage)
                                        .input('FoodPrice', sql.Float, foodPrice)
                                        .query('INSERT INTO [Favorite]'
                                            + ' (FBID, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price)'
                                            + ' VALUES'
                                            + '(@FBID, @FoodId, @RestaurantId, @RestaurantName, @FoodName, @FoodImage, @FoodPrice)');
            
                res.send(JSON.stringify({success: true, message: 'INSERT OK'}))
            } catch(err) {
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }                                
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing fbid in POST request' }));
        }

    }
})

const deleteFavorite = router.delete('/favorite', async (req, res, next) => { // error api
    console.log(req.query);
    if(req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.'}));
    } else {
        const { fbid, foodId, restaurantId }= req.query;
        
        if(!_.isUndefined(fbid)) {
            try {
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                        .input('FBID', sql.NVarChar, fbid)
                                        .input('FoodId', sql.Int, foodId)
                                        .input('RestaurantId', sql.Int, restaurantId)
                                        .query('DELETE FROM [Favorite] WHERE FBID=@FBID AND FoodId=@FoodId AND RestaurantId=@RestaurantId');
            
                res.send(JSON.stringify({success: true, message: 'DELETE OK'}))
            } catch(err) {
                res.status(500); //Internal server error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }                                
        } else {
            res.send(JSON.stringify({ success: false, message: 'Missing fbid in DELETE request' }));
        }

    }
})




export default {
    getMyFavorite,
    getFavoriteByRestaurant,
    addFavorite,
    deleteFavorite,
}