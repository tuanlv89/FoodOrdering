import router from './index';
import _ from 'lodash';
import { poolPromised, sql } from '../db';
import { API_KEY } from '../const';


exports.getAllRestaurants = router.get('/restaurant', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
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

exports.getRestaurantById =router.get('/restaurantById', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
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

exports.getRestaurantNearBy = router.get('/restaurantNearBy', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
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