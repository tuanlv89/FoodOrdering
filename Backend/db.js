const sql = require('mssql')
let config = {
    server: 'localhost',
    user: 'sa',
    password: 'tuanlv98',
    database: 'master'
};

const poolPromised = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')
        return pool;
    }).catch(err => console.log('Database connection failed! Bad config: ', err.message))

    module.exports = { sql, poolPromised }