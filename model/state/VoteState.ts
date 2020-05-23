import {Schema, ArraySchema, MapSchema, type} from '@colyseus/schema';

export class Vote extends Schema {
  @type('string')
  loginName = '';
  @type('string')
  vote = '';
  constructor(loginName: string, vote: string) {
    super();
    this.loginName = loginName;
    this.vote = vote;
  }
}
export class VoteState extends Schema {
  @type('boolean')
  idle = true;
  @type('string')
  author = '';
  @type({map: Vote})
  votes = new MapSchema<Vote>();
  @type(['string'])
  eligibleLoginNames = new ArraySchema<string>();
  @type('boolean')
  isCustom = false;
  @type( ['string'] )
  customOptions = new ArraySchema<string>();
  constructor() {
    super();
  }

  startVote(author: string, eligible: string[], isCustom: boolean, options?: string[]): void {
    console.log('starting new Vote', author, isCustom, options);
    for (const key in this.votes) {
      delete this.votes[key];
    }
    this.author = author;
    this.isCustom = isCustom;
    if (isCustom) {
      options = options || [];
      this.customOptions.filter(() => false);
      options.forEach((val: string) => {
        this.customOptions.push(val);
      })
    }
  }
  playerVote(playerLogin: string, vote: string): void {
    if (this.eligibleLoginNames.find((val: string) => {
      return val === playerLogin;
    })) {
      console.log('player Voting:', playerLogin, 'for', vote);
      if (this.votes[playerLogin] === undefined) {
        this.votes[playerLogin] = new Vote(playerLogin, vote);
      } else {
        this.votes[playerLogin].vote = vote;
      }
    } else {
      console.log("player not eligible to vote!", playerLogin, 'for', vote, 'eligible:', this.eligibleLoginNames);
    }
  }
}
