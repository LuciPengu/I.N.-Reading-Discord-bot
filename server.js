const app = require('express')();
const Database = require("@replit/database")
const db = new Database()

app.get('/', (req, res) => res.send("server is up"));

app.get('/getAccountData', async (req, res) => res.send(await db.get(req.query.id)));


module.exports = () => {
  app.listen(3000);
}