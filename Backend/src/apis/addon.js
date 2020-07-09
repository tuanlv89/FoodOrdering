/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import router from '../routes';
import { poolPromised, sql } from '../db';
import { API_KEY, SECRET_KEY } from '../assets/const';

import { ensureToken } from '../assets/function';

export const getAddOnByFoodId = router.get('/addon', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        const { foodId } = req.query;
        if (!_.isUndefined(foodId)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('FoodId', sql.Int, foodId)
              .query('SELECT ID, Description, Name, ExtraPrice FROM [Addon] WHERE id IN'
                                                + ' (SELECT AddonId FROM [Food_AddOn] WHERE FoodId = @FoodId)');
            if (queryResult.recordset.length > 0) {
              res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            } else {
              res.send(JSON.stringify({ success: false, message: 'Empty' }));
            }
          } catch (err) {
            res.status(500); // Internal server error
            res.send(JSON.stringify({ success: false, message: err.message }));
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing foodId' }));
        }
      }
    }
  })
})
