import router from '../routes';
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import Exjwt from 'express-jwt';
import Sequelize from 'sequelize';

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
    username: {
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
const createAccount = async({username, password}) => {
    return await Account.create({username, password});
};
// Get all
const getAllAccounts = async () => {
    return await Account.findAll();
}
// get one
const getAccount = async obj => {
    return await Account.findOne({ where: obj });
}


// Init Express-Jwt middleware
const jwtMW = Exjwt({
    secret: 'TUANLV_SECRET_KEY'
})

const ensureToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

//signup
const signup = router.post('/users/registerss', async (req, res) => {
    const {username, password} = req.body;
    await createAccount({username, password}).then(user => res.json({user, msg: 'create success'})).catch(err => res.status(401).json({message: err.message}))
})
//login
const login = router.post('/users/login', async (req, res) => {
    const {username, password} = req.body;
    if(username && password) {
        let user = await getAccount({username: username});
        if(!user) {
            res.status(401).json({message: 'Account not found'})
        } else {
            if(user.password === password) {
                let token = Jwt.sign({name: user.name, password: user.password}, 'TUANLV_SECRET_KEY', {expiresIn: 86400}); //sign token
                res.json({message: 'OK', token: token})
            } else {
                res.status(401).json({message: 'password incorect'});
            }
        }
    }
    
})
//protect resource
const get = router.get('/getAll', ensureToken,  async (req, res) => {
    Jwt.verify(req.token, 'TUANLV_SECRET_KEY', (err, data) => {
        if(err) {
            res.sendStatus(403);
        } else {
            getAllAccounts().then(users => res.json({users}))
        }
    })
})

export default {
    get,
    login,
    signup
}