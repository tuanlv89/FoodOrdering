/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import router from '../routes';
import { poolPromised, sql } from '../db';
import { API_KEY, SECRET_KEY } from '../assets/const';

import { ensureToken } from '../assets/function';

// Get
const getMyFavorite = router.get('/favorite', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        if (_.has(req, 'query.email')) {
          const { email } = req.query;
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('email', sql.NVarChar, email)
              .query('SELECT Email, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price FROM [Favorite] where Email=@email');
            if (queryResult.recordset.length > 0) {
              res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
            } else {
              res.send(JSON.stringify({ success: false, message: 'Empty' }));
            }
          } catch (err) {
            res.status(500); // Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing email in query' }));
        }
      }
    }
  })
})

const getFavoriteByRestaurant = router.get('/favoriteByRestaurant', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        if (_.has(req, 'query.email') && _.has(req, 'query.restaurantId')) {
          const { email, restaurantId } = req.query;
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('email', sql.NVarChar, email)
              .input('restaurantId', sql.Int, restaurantId)
              .query('SELECT Email, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price FROM [Favorite] where Email=@email AND RestaurantId=@restaurantId');
            if (queryResult.recordset.length > 0) {
              res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
            } else {
              res.send(JSON.stringify({ success: false, message: 'Empty' }));
            }
          } catch (err) {
            res.status(500); // Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing email or restaurantId in query' }));
        }
      }
    }
  })
})

const addFavorite = router.post('/favorite', ensureToken, async (req, res) => { // error api
  console.log(req.body);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.' }));
      } else {
        const { email, foodId, restaurantId, restaurantName, foodName, foodImage, foodPrice } = req.body;

        if (!_.isUndefined(email)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('Email', sql.NVarChar, email)
              .input('FoodId', sql.Int, foodId)
              .input('RestaurantId', sql.Int, restaurantId)
              .input('RestaurantName', sql.NVarChar, restaurantName)
              .input('FoodName', sql.NVarChar, foodName)
              .input('FoodImage', sql.NVarChar, foodImage)
              .input('FoodPrice', sql.Float, foodPrice)
              .query('INSERT INTO [Favorite]'
                                                + ' (Email, FoodId, RestaurantId, RestaurantName, FoodName, FoodImage, Price)'
                                                + ' VALUES'
                                                + '(@Email, @FoodId, @RestaurantId, @RestaurantName, @FoodName, @FoodImage, @FoodPrice)');

            res.send(JSON.stringify({ success: true, message: 'INSERT OK' }))
          } catch (err) {
            res.status(500); // Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing email in POST request' }));
        }
      }
    }
  })
})

const deleteFavorite = router.delete('/favorite', ensureToken, async (req, res, next) => { // error api
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log('================>', req.query.key);
      if (req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.' }));
      } else {
        const { email, foodId, restaurantId } = req.query;

        if (!_.isUndefined(email)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('Email', sql.NVarChar, email)
              .input('FoodId', sql.Int, foodId)
              .input('RestaurantId', sql.Int, restaurantId)
              .query('DELETE FROM [Favorite] WHERE Email=@Email AND FoodId=@FoodId AND RestaurantId=@RestaurantId');

            res.send(JSON.stringify({ success: true, message: 'DELETE OK' }))
          } catch (err) {
            res.status(500); // Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing email in DELETE request' }));
        }
      }
    }
  })
})

export default {
  getMyFavorite,
  getFavoriteByRestaurant,
  addFavorite,
  deleteFavorite,
}
