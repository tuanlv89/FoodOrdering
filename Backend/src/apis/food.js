/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import router from '../routes';
import { poolPromised, sql } from '../db';
import { API_KEY, SECRET_KEY } from '../assets/const';

import { ensureToken } from '../assets/function';

const getFoodByMenuId = router.get('/food', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        const { menuId } = req.query;
        if (!_.isUndefined(menuId)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('MenuId', sql.Int, menuId)
              .query('SELECT ID, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE id IN'
                                                + ' (SELECT FoodID FROM [Menu_Food] WHERE MenuID = @MenuId)');
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
          res.send(JSON.stringify({ success: false, message: 'Missing menuId' }));
        }
      }
    }
  })
})

const getFoodById = router.get('/foodById', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        const { id } = req.query;
        if (!_.isUndefined(id)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('FoodId', sql.Int, id)
              .query('SELECT Id, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE id = @FoodId');
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
          res.send(JSON.stringify({ success: false, message: 'Missing FoodID' }));
        }
      }
    }
  })
});

const searchFoodByName = router.get('/food/search/name', ensureToken, async (req, res, next) => {
  console.log(req.query);
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
      } else {
        const { search } = req.query;
        if (!_.isUndefined(search)) {
          try {
            const pool = await poolPromised;
            const queryResult = await pool.request()
              .input('Search', sql.NVarChar, `%${search}%`)
              .query('SELECT Id, Name, Description, Image, Price, IsSize, IsAddon, Discount FROM [Food] WHERE name LIKE @Search');
            if (queryResult.recordset.length > 0) {
              res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
            } else {
              res.send(JSON.stringify({ success: false, message: 'Empty' }));
            }
          } catch (err) {
            res.status(500); // Internal server error
            res.send({ success: false, message: err.message });
          }
        } else {
          res.send(JSON.stringify({ success: false, message: 'Missing search param' }));
        }
      }
    }
  })
});

export default {
  getFoodByMenuId,
  getFoodById,
  searchFoodByName
}
