import * as express from 'express';
import {Request, Response} from 'express';
import {MariaDAO} from "./MariaDAO";
import {DBUser} from "./model/DBUser";
import {APIResponse} from "./model/APIResponse";
import multer from "multer";
import * as fs from "fs";
import {ImagePreparer} from "./ImagePreparer";
import * as path from "path";


export class ApiRouter {

    db: MariaDAO;
    router;

    // multer configuration see: https://www.npmjs.com/package/multer for reference
    private multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb( null, 'fileStash' )
        },
        filename: ( req, file, cb ) => {
            cb( null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
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

    private mimeTypes = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        js: 'application/javascript'
    };

    constructor (config) {
        this.db = new MariaDAO(config);
        this.router = express.Router();

        this.router.get('/', async (req, res) => {
            res.sendFile(__dirname + '/views/api.html');
        });

        this.router.get('/profilePic', (req, res) => {
            const defaultImagePath = 'fileStash/defaultImage.jpg';
            const ln: string = req.query.login_name;
            const pw: string = req.query.hash;
            this.db.getProfilePicture(ln, pw).then( dbResponse => {
                let picturePath: string = dbResponse[0].profile_picture;
                if ( picturePath !== undefined ) {
                    if ( picturePath === null ) {
                        picturePath = defaultImagePath;
                    }
                    const mimeType = this.mimeTypes[path.extname(picturePath).slice(1).toLowerCase()] || 'text/plain';
                    const stream = fs.createReadStream(picturePath);
                    stream.on('open', () => {
                        res.set('Content-Type', mimeType);
                        stream.pipe(res);
                    })
                }
            })
        });

        // Change this as soon as we have proper authentication
        this.router.post('/profilePic', this.multipartData.single('img'), (req, res) => {
            const ln: string = req.body.login_name;
            const pw: string = req.body.hash;
            ImagePreparer.prepare(req.file.path).then( (preparedImagePath: string) => {
                // Remove old picture
                this.db.getProfilePicture(ln, pw).then( dbOldPicture => {
                    const oldPath = dbOldPicture[0].profile_picture;
                    if(oldPath !== undefined && oldPath !== null) {
                        fs.unlink(oldPath, () => {});
                    }
                }).then( suc => {
                    // Set new Picture
                    this.db.setProfilePicture(ln, pw, preparedImagePath).then( dbSetNewPicture => {
                        if (dbSetNewPicture.affectedRows === 1) {
                            new APIResponse(res, 200, dbSetNewPicture).send();
                        } else {
                            fs.unlink(req.file.path, () => {});
                            new APIResponse(res, 500, dbSetNewPicture).send();
                        }
                    }, err => {
                        fs.unlink(req.file.path, () => {});
                        new APIResponse(res, 500, {}, [err]).send();
                        console.error(err)
                    });
                });
            });
        });

        // clean dbResponse in MariaDAO for this
        this.router.delete('/profilePic', (req, res) => {
            const ln: string = req.query.login_name;
            const pw: string = req.query.hash;
            if(ln !== undefined && pw !== undefined) {
                this.db.removeProfilePicture(ln, pw).then( dbResposne => {
                    if( dbResposne[0].profile_picture !== undefined ) {
                        fs.unlink(dbResposne[0].profile_picture, () => {});
                    }
                    new APIResponse(res, 200, dbResposne).send();
                })
            } else {
                new APIResponse(res, 401, 'Bad Request', []).send()
            }
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
                    new APIResponse(res, 404, 'Credentials did not match.').send()
                } else if ((suc as any[]).length === 1 ) {
                    new APIResponse(res, 200, suc).send()
                } else {
                    new APIResponse(res, 500, {}, ['FATAL: More than one user found for login. This should NEVER happen.']).send();
                }
            }, err => {
                new APIResponse(res, 500, {}, [err]).send();
                console.error(err)
            });
        });
    }
}

