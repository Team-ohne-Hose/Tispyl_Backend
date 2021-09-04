import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema';
import { Player } from './Player';

export class VoteEntry extends Schema {
  @type('boolean')
  isPlayerEntry = false;

  @type('string')
  playerHandle: string = undefined;

  @type('string')
  text: string = undefined;

  @type(['string'])
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
    obj.castVotes.map((v) => ve.castVotes.push(v));
    return ve;
  }
}

export enum VoteStage {
  IDLE = 1,
  CREATION = 2,
  VOTE = 3,
}
export class VoteConfiguration extends Schema {
  @type('string')
  author: string;

  @type('string')
  title: string;

  @type(['string'])
  ineligibles = new ArraySchema<string>();

  @type([VoteEntry])
  votingOptions = new ArraySchema<VoteEntry>();

  build(
    title: string,
    author: string,
    eligibilities: Map<string, boolean>,
    options: VoteEntry[]
  ): VoteConfiguration {
    const config = new VoteConfiguration();
    config.title = title;
    config.author = author;
    options.forEach((e) => config.votingOptions.push(e));
    for (const k of eligibilities) {
      if (!k[1]) {
        config.ineligibles.push(k[0]);
      }
    }
    return config;
  }

  fromObject(obj: VoteConfiguration): void {
    this.title = obj.title;
    this.author = obj.author;
    this.ineligibles.clear();
    obj.ineligibles.map((i) => this.ineligibles.push(i));
    this.votingOptions.clear();
    obj.votingOptions.map((e) =>
      this.votingOptions.push(VoteEntry.fromObject(e))
    );
  }
}

export class VoteResult {
  readonly title: string;
  readonly author: string;
  readonly entries: VoteEntry[];
  readonly ineligibles: string[];
  readonly timestamp: Date;

  constructor(
    title: string,
    author: string,
    options: VoteEntry[],
    ineligibles: string[] = []
  ) {
    this.title = title;
    this.author = author;
    this.entries = options;
    this.ineligibles = ineligibles;
    this.timestamp = new Date();
  }
}

export class VoteState extends Schema {
  @type('string')
  author = 'undefined';

  @type('number')
  voteStage: number = VoteStage.IDLE;

  @type(VoteConfiguration)
  voteConfiguration: VoteConfiguration = new VoteConfiguration();

  @type('number')
  closingIn = -1;
}
