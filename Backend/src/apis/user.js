import router from '../routes';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import { poolPromised, sql } from '../db';
import { API_KEY } from '../assets/const';
const saltRounds = 10;

// Get
const login = router.get('/user', async (req, res, next) => {
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

const signin = router.get('/user/sigin', async (req, res, next) => {
    console.log(req.query);
    if(!_.has(req, 'query.key') || req.query.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key' }));
    } else {
        if(_.has(req, 'query.fbid')) {
            const { fbid, email, password } = req.query;
            try {
                bcrypt.compare(password, '$2b$10$EoJLnpg9sIz34j/TOe7RXu/1IqhFB9YXQLbY0zfB4XIrbgeuuYzvi', function(err, result) {
                    console.log('============>', result, err)
                });
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

// Post
const register = router.post('/user', async (req, res, next) => {
    console.log(req.body);
    if(req.body.key !== API_KEY) {
        res.send(JSON.stringify({ success: false, message: 'Wrong API key.'}));
    } else {
        const { userPhone, username, address, email, password } = req.body;
        console.log(req.body)
        if(!_.isUndefined(email) || !_.isUndefined(password)) {
            try {
                let encryptedPassword = null;
                bcrypt.hash(password, saltRounds, function(err, hash) {
                    encryptedPassword = hash;
                    console.log('===============>', encryptedPassword, err)
                });
                const pool = await poolPromised;
                const queryResult = await pool.request()
                                            .input('UserPhone', sql.NVarChar, userPhone)
                                            .input('username', sql.NVarChar, username)
                                            .input('Address', sql.NVarChar, address)
                                            .input('Email', sql.NVarChar, fbid)
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
            res.send(JSON.stringify({ success: false, message: 'Missing email or password in POST body' }));
        }

    }
})




export default {
    login,
    signin,
    register
}