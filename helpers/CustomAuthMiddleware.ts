

/** Authentication middleware used to check if given request was sent by a logged in user and if the user
 * is allowed to access the information provided by the request sent.
 *
 * @param req
 * @param res
 * @param next
 */
export function customAuth (req, res, next) {
    next();
}

type accountTriple = { login_hash: string, secret: string, expiration_date: Date };

export class ActiveAccountsManager {

    private static activeAccounts: accountTriple[] = [];

    static loginAccount(login_hash: string, secret: string): Date {
        let exp = new Date();
        exp.setDate(exp.getUTCDate() + 1);

        ActiveAccountsManager.activeAccounts.push({
            login_hash: login_hash,
            secret: secret,
            expiration_date: exp
        });

        return exp;
    }

    static isActive(login_hash: string, secret: string): boolean {
        let idx = ActiveAccountsManager.activeAccounts.findIndex( (at: accountTriple) => {
           return at.login_hash === login_hash && at.secret === secret;
        });
        if ( idx === -1 ) { return false; }
        let currentAccount = ActiveAccountsManager.activeAccounts[idx];
        return currentAccount.expiration_date > new Date(Date.now());
    }
}