import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import router from '../routes';
import { poolPromised, sql } from '../db';
import { API_KEY, SECRET_KEY } from '../assets/const';

import { ensureToken } from '../assets/function';

const getOrder = router.get('/order', ensureToken, async (req, res, next) => {
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.query);
      const { orderEmail } = req.query;
      if (!_.isUndefined(orderEmail)) {
        try {
          const pool = await poolPromised;
          const queryResult = await pool.request()
            .input('OrderEmail', sql.NVarChar, orderEmail)
            .query('SELECT OrderId, OrderEmail, OrderPhone, OrderName, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem FROM [Order] WHERE OrderEmail=@OrderEmail');
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
        res.send(JSON.stringify({ success: false, message: 'Missing orderEmail' }));
      }
    }
  })
})

const getOrderDetail = router.get('/orderDetail', ensureToken, async (req, res, next) => {
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.query);
      const { orderId } = req.query;
      if (!_.isUndefined(orderId)) {
        try {
          const pool = await poolPromised;
          const queryResult = await pool.request()
            .input('OrderId', sql.Int, orderId)
            .query('SELECT OrderId, ItemId, Quantity, Price, Discount, Size, Addon, ExtraPrice FROM [OrderDetail] WHERE OrderId=@OrderId');
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
        res.send(JSON.stringify({ success: false, message: 'Missing orderId' }));
      }
    }
  })
})

const createOrder = router.post('/createOrder', ensureToken, async (req, res, next) => {
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      const { orderPhone, ordername, orderAddress, orderStatus, orderDate,
        restaurantId, transactionId, COD, totalPrice, numOfItem, orderEmail } = req.body;
      console.log(req.body)
      if (!_.isUndefined(orderEmail)) {
        try {
          const pool = await poolPromised;
          const queryResult = await pool.request()
            .input('OrderEmail', sql.NVarChar, orderEmail)
            .input('OrderPhone', sql.NVarChar, orderPhone)
            .input('Ordername', sql.NVarChar, ordername)
            .input('OrderAddress', sql.NVarChar, orderAddress)
            .input('orderStatus', sql.Int, orderStatus)
            .input('OrderDate', sql.Date, orderDate)
            .input('RestaurantId', sql.Int, restaurantId)
            .input('TransactionId', sql.NVarChar, transactionId)
            .input('COD', sql.Bit, COD === true ? 1 : 0)
            .input('TotalPrice', sql.Float, totalPrice)
            .input('NumOfItem', sql.Int, numOfItem)
            .query('INSERT INTO [Order]'
                                              + ' (OrderEmail, OrderPhone, Ordername, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem)'
                                              + ' VALUES'
                                              + ' (@OrderEmail, @OrderPhone, @Ordername, @OrderAddress, @OrderStatus, @OrderDate, @RestaurantId, @TransactionId, @COD, @TotalPrice, @NumOfItem)'
                                              + ' SELECT OrderEmail, OrderPhone, OrderName, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, NumOfItem FROM [Order] WHERE OrderEmail=@OrderEmail ORDER BY OrderId DESC');
          if (!_.isUndefined(queryResult.recordset.length > 0)) {
            res.send(JSON.stringify({ success: true, result: queryResult.recordset, total: queryResult.recordset.length }));
          } else {
            res.send(JSON.stringify({ success: false, message: 'Empty' }));
          }
        } catch (err) {
          res.status(500); // Internal server error
          res.send(JSON.stringify({ success: false, message: err.message }));
        }
      } else {
        res.send(JSON.stringify({ success: false, message: 'Missing orderEmail in POST request' }));
      }
    }
  })
})

// const updateOrder = router.post('/updateOrder', ensureToken, async (req, res, next) => { // error api
//   Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
//     if (err) {
//       res.sendStatus(403);
//     } else {
//       console.log(req.body);
//       const { orderId } = req.body;
//       let { orderDetail } = req.body;
//       try {
//         orderDetail = JSON.parse(req.body.orderDetail);
//       } catch (err) {
//         res.status(500); // Internal server error
//       }
//       console.log('OrderDetail=======>', orderDetail);
//       if (!_.isUndefined(orderId) && !_.isNull(orderDetail)) {
//         try {
//           const pool = await poolPromised;
//           const table = new sql.Table('OrderDetail'); // Tạo 1 bảng ảo để insert số lượng lớn
//           table.create = true;

//           table.columns.add('OrderId', sql.Int, { nullable: false, primary: true });
//           table.columns.add('ItemId', sql.Int, { nullable: false, primary: true });
//           table.columns.add('Quantity', sql.Int, { nullable: false });
//           table.columns.add('Price', sql.Float, { nullable: false });
//           table.columns.add('Discount', sql.Int, { nullable: false });
//           table.columns.add('Size', sql.NVarChar(50), { nullable: false });
//           table.columns.add('Addon', sql.NVarChar(4000), { nullable: false });
//           table.columns.add('ExtraPrice', sql.Float, { nullable: false });
//           console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', orderDetail);

//           for (let i = 0; i < orderDetail.length; i++) {
//             table.rows.add(
//               orderId,
//               orderDetail[i].foodId,
//               orderDetail[i].foodQuantity,
//               orderDetail[i].foodPrice,
//               orderDetail[i].foodDiscount,
//               orderDetail[i].foodSize,
//               orderDetail[i].foodAddon,
//               parseFloat(orderDetail[i].foodExtraPrice)
//             )
//           }

//           const request = await pool.request();
//           request.bulk(table, (err, resultBulk) => {
//             if (err) {
//               console.log(err);
//               res.send(JSON.stringify({ success: false, message: err.message }));
//             } else {
//               res.send(JSON.stringify({ success: true, message: 'Update OK' }));
//             }
//           })
//         } catch (err) {
//           res.status(500); // Internal server error
//           res.send(JSON.stringify({ success: false, message: err.message }));
//         }
//       } else {
//         res.send(JSON.stringify({ success: false, message: 'Missing orderId or orderDetail in POST request' }));
//       }
//     }
//   })
// })

export default {
  getOrder,
  getOrderDetail,
  createOrder,
  // updateOrder
}
