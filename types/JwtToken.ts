export interface JwtUserData {
    id: number;
    username: string;
};

export interface JwtToken extends JwtUserData {
    iat: number;
    exp: number;
};
