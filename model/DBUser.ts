
export class DBUser {
    user_id: number;
    login_name: string;
    display_name: string;
    password_hash: string;
}

export class APIUser {

    constructor (usr: DBUser) {
        this.login_name = usr.login_name;
        this.display_name = usr.display_name;
    }

    login_name: string;
    display_name: string;
}