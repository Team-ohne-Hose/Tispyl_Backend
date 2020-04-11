import * as express from "express";
import {MariaDAO} from "./MariaDAO";
import {DBUser} from "./model/DBUser";

export const apiRouter = express.Router();
const db: MariaDAO = new MariaDAO();


apiRouter.get('/', async (req, res) => {
    res.sendFile(__dirname + '/views/api.html');
});

apiRouter.get('/users', async (req, res) => {
    const id: number = req.query.user_id;
    if (id !== undefined) {
        db.getUser(id).then( suc => {
            res.send(JSON.stringify(suc));
        }, err => {
            res.send("Failec connectivity check: " + err)
        })
    } else {
        db.getAllUsers().then( suc => {
            res.send(JSON.stringify(suc));
        }, err => {
            res.send("Failec connectivity check: " + err)
        })
    }
});

apiRouter.put('/users', async (req, res) => {
    console.log("got PUT /users BODY " + JSON.stringify(req.body));

    let usrData: DBUser = req.body;
    db.insertUser(usrData).then( suc => {
        res.send(JSON.stringify(suc));
    }, err => {
        res.send('{"response":"failed"}');
        console.log(err)
    });
});

apiRouter.patch('/users', async (req, res) => {
    console.log("got UPDATE /users BODY " + JSON.stringify(req.body));

    let usrData: DBUser = req.body;
    db.updateUser(usrData).then( suc => {
        res.send(JSON.stringify(suc));
    }, err => {
        res.send('{"response":"failed"}');
        console.log(err)
    });
});

apiRouter.delete('/users', async (req, res) => {
    console.log("got DELETE /users/remove BODY " + JSON.stringify(req.body));

    let usrData: number = req.body.user_id;
    db.removeUser(usrData).then( suc => {
        res.send(JSON.stringify(suc));
    }, err => {
        res.send('{"response":"failed"}');
        console.log(err)
    });
});

