import {Client, Room} from "colyseus";
import {GameState} from "./GameState";



export class GameRoom extends Room<GameState> {

    playerNames = new Map<string, string>();

    onCreate(options: any): void | Promise<any> {
        console.log("onCreate was triggered with: ", options);

        this.setState(new GameState());

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
        this.playerNames.set(client.id, options.displayName);
        console.log('options were: ', options);
        this.broadcast({type: 'JOIN_MESSAGE', content: { message: `[Server] ${this.playerNames.get(client.id)}(${client.id}) joined the game` }});

        return undefined;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        console.log("onLeave was triggered");

        return undefined;
    }

    onMessage(client: Client, data: any): void {
        console.log("onMessage was triggered", data);
        if (data.type === 'CHAT_MESSAGE') {
            this.broadcast({type: 'CHAT_MESSAGE', content: { message: `[${this.playerNames.get(client.id)}] ${data.content.message}` }})
        } else if (data.type === 'ADVANCE_ROUND') {
            this.state.nextRound()
        } else {
            console.error("Unknown data: ", data);
        }
    }

}
