/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import router from '../routes';
import { poolPromised, sql } from '../db';
import { API_KEY, SECRET_KEY } from '../assets/const';

import { ensureToken } from '../assets/function';

export const getSizeByFoodId = router.get('/size', ensureToken, async (req, res) => {
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.query);
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        const { foodId } = req.query;
        if (!_.isUndefined(foodId)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('FoodId', sql.Int, foodId)
              .query('SELECT ID, Description, ExtraPrice FROM [Size] WHERE id IN'
                                                + ' (SELECT SizeId FROM [Food_Size] WHERE FoodId = @FoodId)');
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
          res.send(JSON.stringify({ success: false, message: 'Missing foodId' }));
        }
      }
    }
  })
})
