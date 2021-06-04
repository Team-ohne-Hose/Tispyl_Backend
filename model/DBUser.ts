export class DBUser {
  constructor(ln, dn, ph) {
    this.user_id = NaN;
    this.login_name = ln;
    this.display_name = dn;
    this.password_hash = ph;

    this.user_creation = '';
    this.time_played = 0;
    this.last_figure = '';
    this.is_connected = false;
    this.is_dev = false;
  }

  user_id: number;
  login_name: string;
  display_name: string;
  password_hash: string;
  user_creation: string;
  time_played: number;
  profile_picture: string;
  last_figure: string;
  is_connected: boolean;
  is_dev: boolean;
}

export class APIUser {
  constructor(usr: DBUser) {
    this.login_name = usr.login_name;
    this.display_name = usr.display_name;
  }

  login_name: string;
  display_name: string;
}
