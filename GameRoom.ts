import {Client, Room} from "colyseus";



export class GameRoom extends Room {

    onCreate(options: any): void | Promise<any> {
        console.log("onCreate was triggered with: ", options);

        this.setMetadata({
            lobbyName: options['name'],
            author: options['author']
        });
        return undefined;
    }

    onDispose(): void | Promise<any> {
        console.log("onDispose was triggered");

        return undefined;
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        console.log("onJoin was triggered");

        return undefined;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        console.log("onLeave was triggered");

        return undefined;
    }

    onMessage(client: Client, data: any): void {
        console.log("onMessage was triggered");

    }

}