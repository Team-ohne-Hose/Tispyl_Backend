
export class WSLogger {

    static log(msg: string) {
        const now = new Date(Date.now()).toLocaleTimeString();
        console.log(`[${now}][WSocket] ${msg}`)
    }
}