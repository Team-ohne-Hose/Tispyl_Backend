import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';
import {Player} from "./Player";
import {ReInitialization} from '../ReInitialization';


export class VoteEntry extends Schema {

    @type('boolean')
    isPlayerEntry: boolean = false;

    @type('string')
    playerHandle: string = undefined;

    @type('string')
    text: string = undefined;

    @type([ 'string' ])
    castVotes = new ArraySchema<string>();

    static fromPlayer(p: Player): VoteEntry {
        const entry = new VoteEntry();
        entry.isPlayerEntry = true;
        entry.playerHandle = p.loginName;
        entry.text = p.displayName;
        return entry;
    }

    static fromObject(obj: VoteEntry): VoteEntry {
        const ve = new VoteEntry();
        ve.isPlayerEntry = obj.isPlayerEntry;
        ve.playerHandle = obj.playerHandle;
        ve.text = obj.text;
        obj.castVotes.map(v => ve.castVotes.push(v));
        return ve;
    }
}

export class VoteConfiguration extends Schema {

    @type('string')
    author: string;

    @type('string')
    title: string;

    @type( [ 'string' ] )
    ineligibles =  new ArraySchema<string>();

    @type( [ VoteEntry ] )
    votingOptions = new ArraySchema<VoteEntry>();

    @type('boolean')
    hasConcluded: boolean = false;

    build(title: string, author: string, eligibilities: Map<string, boolean>, options: VoteEntry[]): VoteConfiguration {
        const config = new VoteConfiguration();
        config.title = title;
        config.author = author;
        options.forEach(e => config.votingOptions.push(e));
        for (const k of eligibilities) {
            if (!k[1]) {
                config.ineligibles.push(k[0]);
            }
        }
        return config;
    }

    static fromObject(obj: VoteConfiguration): VoteConfiguration {
        const conf = new VoteConfiguration();
        conf.title = obj.title;
        conf.author = obj.author;
        obj.ineligibles.map(i => conf.ineligibles.push(i));
        obj.votingOptions.map(e => conf.votingOptions.push(VoteEntry.fromObject(e)));
        return conf;
    }

}

export class VoteResult {

    readonly title: string;
    readonly author: string;
    readonly entries: VoteEntry[];
    readonly ineligibles: string[];
    readonly timestamp: Date;

    constructor( title: string, author: string, options: VoteEntry[], ineligibles: string[] = [] ) {
        this.title = title;
        this.author = author;
        this.entries = options;
        this.ineligibles = ineligibles;
        this.timestamp = new Date();
    }
}

export class VoteState extends Schema {

  @type('boolean')
  creationInProgress: boolean = false;

  @type('string')
  author: string = '';

  @type( VoteConfiguration )
  activeVoteConfiguration: VoteConfiguration = undefined;

  @type('number')
  closingIn: number = -1;
}


