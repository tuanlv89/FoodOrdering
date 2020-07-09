/* eslint-disable no-return-await */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import Jwt from 'jsonwebtoken';
import Exjwt from 'express-jwt';
import Sequelize from 'sequelize';
import _ from 'lodash';
import router from '../routes';
import { SECRET_KEY } from '../assets/const';
import { ensureToken } from '../assets/function';
import { poolPromised, sql } from '../db';

let sequelize = new Sequelize({
  dialect: 'mssql',
  dialectOptions: {
    instanceName: 'THINKPADW'
  },
  host: 'localhost',
  username: 'sa',
  password: 'tuanlv98',
  database: 'foodordering'
});
// connect
sequelize.authenticate().then(() => console.log('Connect successfully')).catch(err => console.error('Cannot connect to MSSQL: ', err));

const Account = sequelize.define('Account', {
  email: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  password: {
    type: Sequelize.STRING
  }
});
// create table
Account.sync().then(() => console.log('User table create success')).catch(err => console.error('User table error: ', err));
// Insert
const createAccount = async ({ email, password }) => {
  await Account.create({ email, password });
}
// Get all
const getAllAccounts = async () => await Account.findAll()
// get one
const getAccount = async obj => await Account.findOne({ where: obj })

// Init Express-Jwt middleware
const jwtMW = Exjwt({
  secret: SECRET_KEY
})

// signup
const signup = router.post('/user/registerss', async (req, res) => {
  const { email, password } = req.body;
  await createAccount({ email, password }).then(user => res.json({ user, msg: 'create success' })).catch(err => res.status(401).json({ message: err.message }))
})
const register = router.post('/user/register', async (req, res, next) => {
  console.log(req.body);
  const { userPhone, name, address, email, password } = req.body;
  if (!_.isUndefined(email) || !_.isUndefined(password)) {
    try {
      await createAccount({ email, password })
        .then(async (user) => {
          const pool = await poolPromised;
          const queryResult = await pool.request()
            .input('UserPhone', sql.NVarChar, userPhone)
            .input('Name', sql.NVarChar, name)
            .input('Address', sql.NVarChar, address)
            .input('Email', sql.NVarChar, email)
            .query('INSERT INTO [User](UserPhone, Name, Address, Email) OUTPUT Inserted.UserPhone, Inserted.Name, Inserted.Address, Inserted.Email'
                                                  + ' VALUES(@UserPhone, @Name, @Address, @Email)');
          console.log('===========>', queryResult);
          if (!_.isUndefined(queryResult.rowsAffected)) {
            res.send(JSON.stringify({ success: true, message: 'Đăng ký thành công!', result: queryResult.recordset }));
          } else {
            res.send(JSON.stringify({ success: false, message: 'Đăng ký thất bại' }));
          }
        }).catch(err => res.status(401).json({ success: false, message: err.message }));
    } catch (err) {
      res.status(500); // Internal server error
      res.send(JSON.stringify({ success: false, message: err.message }));
    }
  } else {
    res.send(JSON.stringify({ success: false, message: 'Missing email or password in POST body' }));
  }
})

// login
const login = router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    let user = await getAccount({ email });
    if (!user) {
      res.send(JSON.stringify({ success: false, message: 'Tài khoản không tồn tại' }));
      res.status(401);
    } else {
      if (user.password === password) {
        let token = Jwt.sign({ email: user.email, password: user.password }, SECRET_KEY, { expiresIn: 86400 }); // sign token
        const pool = await poolPromised;
        const queryResult = await pool.request()
          .input('email', sql.NVarChar, email)
          .query('SELECT UserPhone, Name, Address, Email FROM [User] where Email=@email');

        if (queryResult.recordset.length > 0) {
          res.send(JSON.stringify({ success: true, result: queryResult.recordset, token }));
        } else {
          res.send(JSON.stringify({ success: false, message: 'Failed' }));
        }
        // res.json({ success: true, message: 'OK', token })
      } else {
        res.status(401).json({ success: false, message: 'password incorect' });
      }
    }
  } else {
    res.send(JSON.stringify({ success: false, message: 'Missing email or password in POST body' }));
  }
})
// protect resource
const getAllAccount = router.get('/account/getAll', ensureToken, async (req, res) => {
  Jwt.verify(req.token, SECRET_KEY, async (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else {
      getAllAccounts().then(users => res.json({ users }))
    }
  })
})

const getUser = router.get('/user', async (req, res, next) => {
  console.log(req.query);
  if (_.has(req, 'query.email')) {
    const { email } = req.query;
    try {
      const pool = await poolPromised;
      const queryResult = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT UserPhone, Name, Address, Email FROM [User] where Email=@email');
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
    res.send(JSON.stringify({ success: false, message: 'Missing email in query' }));
  }
})

export default {
  login,
  signup,
  register,
  getAllAccount,
  getUser
}
