import * as express from 'express';
import {Request, Response} from 'express';
import {MariaDAO} from "./MariaDAO";
import {DBUser} from "./model/DBUser";
import {APIResponse} from "./model/APIResponse";
import multer, {MulterError} from "multer";


export class ApiRouter {

    db: MariaDAO;
    router;

    // multer configuration see: https://www.npmjs.com/package/multer for reference
    private multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb( null, 'fileStash' )
        },
        filename: ( req, file, cb ) => {
            cb( null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
        }
    });
    private multerLimits = {
        fileSize: 1*1024*1024,
        files: 5,
        parts: 10
    };
    private multerFileFilter = (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            let err = new Error('Invalid format. Allowed formats are: .png, .jpg and .jpeg');
            err.name = 'MULTER_FILTER_REJECTION';
            return cb(err);
        }
    };
    private multipartData = multer({
        storage: this.multerStorage,
        limits: this.multerLimits,
        fileFilter: this.multerFileFilter
    });
    ///////////////////////////////////////////////////////////////////////////////

    constructor (config) {
        this.db = new MariaDAO(config);
        this.router = express.Router();

        this.router.get('/', async (req, res) => {
            res.sendFile(__dirname + '/views/api.html');
        });

        this.router.post('/profilePic', this.multipartData.single('img'), (req, res) => {
            const id: number = req.body.user_id;
            const pw: string = req.body.hash;

            console.log('Multer Data', req.file, id, pw);
            new APIResponse(res, 200, 'ok').send();
        });

        this.router.get('/error', (req, res) => {
            throw new Error('Calamity!')
        });

        this.router.get('/users', async (req, res) => {
            const id: number = req.query.user_id;
            const name: string = req.query.login_name;
            let resultPromise: Promise<any>;

            if (id !== undefined) {
                resultPromise = this.db.getUserById(id)
            } else if (name !== undefined) {
                resultPromise = this.db.getUserByLogginName(name)
            } else {
                resultPromise = this.db.getAllUsers()
            }

            resultPromise.then( suc => {
                new APIResponse(res, 200, suc).send()
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.warn(err)
            });
        });

        this.router.post('/users', async (req: Request, res: Response) => {
            let usrData: DBUser = req.body;
            this.db.insertUser(usrData).then( suc => {
                new APIResponse(res, 201, suc).send()
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.warn(err)
            });
        });

        this.router.put('/users', async (req, res) => {
            let usrData: DBUser = req.body;
            this.db.updateUser(usrData).then( suc => {
                new APIResponse(res, 200, suc).send()
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.warn(err)
            });
        });

        this.router.delete('/users', async (req, res) => {
            let usrData: number = req.query.user_id;
            this.db.removeUser(usrData).then( suc => {
                new APIResponse(res, 200, suc).send()
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.warn(err)
            });
        });

        this.router.post('/users/login', async (req, res) => {
            this.db.findLogin(req.body.login_name, req.body.password_hash).then( suc => {
                if ((suc as any[]).length === 0 ) {
                    new APIResponse(res, 404, suc).send()
                } else if ((suc as any[]).length === 1 ) {
                    new APIResponse(res, 200, suc).send()
                } else {
                    new APIResponse(res, 500, {}, ['FATAL: More than one user found for login. This should NEVER happen.']).send();
                }
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.warn(err)
            });
        });
    }
}

