/* eslint-disable @typescript-eslint/no-unused-vars*/
/* eslint-disable unused-imports/no-unused-vars*/
/* eslint-disable @typescript-eslint/no-explicit-any*/
/* eslint-disable no-case-declarations*/

import { Client, Room } from 'colyseus';
import { Actions, GameState } from './src/model/state/GameState';
import {
  AchievementMessageType,
  ChatCommandType,
  ChatMessage,
  DebugCommandType,
  GameActionType,
  ItemMessageType,
  MessageType,
  PlayerMessageType,
  WsData,
} from './src/model/WsData';

import { Player } from './src/model/state/Player';
import { PhysicsObjectState } from './src/model/state/PhysicsState';
import { ItemManager } from './src/model/ItemManager';
import { Link } from './src/model/state/Link';
import { VoteEntry, VoteStage } from './src/model/state/VoteState';
import UserController from './src/controller/user.controller';
import GameController from './src/controller/game.controller';
import GameLog from './src/entity/GameLog';
import TileSetController from './src/controller/tileSet.controller';
import { Rule } from './src/model/state/Rule';

export interface Metadata {
  roomName: string;
  author: string;
  tileSetId: number;
  randomizeTiles: boolean;
  enableItems: boolean;
  enableMultipleItems: boolean;
}

export interface CreateRoomOpts extends Metadata {
  displayName: string;
  login: string;
}

export class GameRoom extends Room<GameState, Metadata> {
  createTime: Date;
  peakPlayers: number;
  maxClients = 16;
  maxItemCount = 5;

  /**
   * will be called when a new room should be created
   * @throws Error when type of options is incorrect
   */
  async onCreate(options: CreateRoomOpts): Promise<any> {
    options = options as CreateRoomOpts;
    if (options === undefined) {
      throw new Error(
        'Room creation options were not of type CreateRoomOpts or undefined'
      );
    }

    console.log(`[onCreate] Room created. Options: ${JSON.stringify(options)}`);
    this.createTime = new Date();

    this.peakPlayers = 1;

    this.setState(new GameState());
    this.setMetadata(options as Metadata).catch((reason: any) => {
      throw new Error('Metadata couldnt be set' + reason.toString());
    });
    try {
      const tileSet = await TileSetController.getTileSetById(
        options.tileSetId || 1
      );
      const fields = await tileSet.fields;
      if (options.randomizeTiles) {
        if (
          TileSetController.generateField(fields, this.state.boardLayout, true)
        ) {
          console.log('generated random Layout');
        } else {
          console.error('failed to generate random Layout');
        }
      } else {
        if (
          TileSetController.generateField(fields, this.state.boardLayout, false)
        ) {
          console.log('generated non-random Layout');
        } else {
          console.error('failed to generate non-random Layout');
        }
      }
    } catch (reason) {
      console.error("failed, couldn't get TileSet", reason);
    }

    this.state.physicsState.setBroadcastCallback(this.broadcast.bind(this));
    this.state.physicsState.addDice();
    this.state.physicsState.setOnDiceThrow(
      ((num: number) => {
        if (this.state.action === Actions[Actions.ROLL]) {
          this.state.nextAction(this);
        }
      }).bind(this)
    );

    this.onMessage(MessageType.CHAT_MESSAGE, this.onChatMessage.bind(this));
    this.onMessage(MessageType.JOIN_MESSAGE, this.onJoinMessage.bind(this));
    this.onMessage(MessageType.GAME_MESSAGE, this.onGameMessage.bind(this));
    this.onMessage(MessageType.PLAYER_MESSAGE, this.onPlayerMessage.bind(this));
    this.onMessage(
      MessageType.PHYSICS_MESSAGE,
      this.onPhysicsMessage.bind(this)
    );
    this.onMessage(MessageType.DEBUG_COMMAND, this.onDebugMessage.bind(this));
    this.onMessage(MessageType.LEFT_MESSAGE, this.onLeftMessage.bind(this));
    this.onMessage(MessageType.OTHER, this.onOtherMessage.bind(this));
    this.onMessage(
      MessageType.REFRESH_COMMAND,
      this.onRefreshMessage.bind(this)
    );
    this.onMessage(
      MessageType.ACHIEVEMENT_MESSAGE,
      this.onAchievementMessage.bind(this)
    );
    this.onMessage(MessageType.ITEM_MESSAGE, this.onItemMessage.bind(this));
    this.onMessage(MessageType.CHAT_COMMAND, this.onChatCommand.bind(this));

    return undefined;
  }

  async onDispose(): Promise<void | Promise<any>> {
    console.log(`[onDispose] Destructing physicsState`);

    const tileSet = await TileSetController.getTileSetById(
      this.metadata.tileSetId
    );
    await GameController.saveGameLog(
      new GameLog(
        this.metadata.roomName,
        this.metadata.author,
        this.metadata.randomizeTiles ? 1 : 0,
        tileSet,
        this.metadata.enableItems ? 1 : 0,
        this.metadata.enableMultipleItems ? 1 : 0,
        this.createTime,
        new Date(),
        this.peakPlayers,
        this.state.round
      ),
      this.state.playerList,
      this.createTime,
      this.state.round
    );

    this.state.physicsState.destructState();
    return undefined;
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    console.log(
      `[onJoin] Client ID: ${client.id} DisplayName: ${options.displayName
      } joined. Options: ${JSON.stringify(options)}`
    );

    // find matching player object or create a new one
    const playerResult: [Player, boolean] = this.state.getOrAddPlayer(
      options.login,
      client.id,
      options.displayName,
      this.maxItemCount
    );
    const player: Player = playerResult[0];
    const isNewPlayer: boolean = playerResult[1];
    player.joined = new Date();

    // set joining player as host if no host exists
    if (this.state.hostLoginName === '') {
      this.state.setHost(player.loginName);
    }

    let joinedMsg = '';
    if (isNewPlayer) {
      // increment number of unique players
      this.peakPlayers++;

      joinedMsg = `${this.state.playerList[options.login].displayName
        } joined the game`;
      player.figureId = this.state.physicsState.addPlayerFigure();
    } else {
      joinedMsg = `${this.state.playerList[options.login].displayName
        } reconnected to the game`;

      // remove potential timeout
      if (player.gracePeriodTimeout !== undefined) {
        global.clearTimeout(player.gracePeriodTimeout);
        player.gracePeriodTimeout = undefined;
      }

      // re-enable figure old game
      const pObj: PhysicsObjectState =
        this.state.physicsState.objects[player.figureId];
      pObj.setDisabled(false);

      // register new sessionId to old player object
      player.clientId = client.id;
      player.hasLeft = false;
    }

    player.isConnected = true;
    this.broadcast(MessageType.JOIN_MESSAGE, {
      type: MessageType.JOIN_MESSAGE,
      message: joinedMsg,
    });
  }

  onLeave(client: Client, consented?: boolean): void | Promise<any> {
    const player = this.state.getPlayerByClientId(client.id);

    const minutesToAdd =
      (new Date().getTime() - player.joined.getTime()) / 60000;
    UserController.addPlaytime(player.loginName, minutesToAdd);

    console.log(`[onLeave] Client left the room: ${player.loginName}`);
    if (player !== undefined) {
      if (player.loginName === this.state.hostLoginName) {
        this.broadcast(MessageType.LEFT_MESSAGE, {
          type: MessageType.LEFT_MESSAGE,
          message: `The Host: ${this.state.playerList[player.loginName].displayName
            } left the game.`,
        });
        this.state.removePlayer(player.loginName);

        // get the first still connected player
        const newHostPlayer: [string, Player] = Array.from(
          this.state.playerList.entries()
        ).find((val: [string, Player]) => {
          return val[1].isConnected;
        });
        if (newHostPlayer !== undefined) {
          const login: string = newHostPlayer[0];
          const player: Player = newHostPlayer[1];
          this.state.setHost(login);
          this.broadcast(MessageType.SERVER_MESSAGE, {
            type: MessageType.SERVER_MESSAGE,
            message: `Player: ${player.displayName} is now host of the game.`,
            origin: 'SERVER',
          });
        }
      } else {
        this.broadcast(MessageType.SERVER_MESSAGE, {
          type: MessageType.SERVER_MESSAGE,
          message: `Player: ${this.state.playerList[player.loginName].displayName
            } left the game.`,
          origin: 'SERVER',
        });
        this.state.removePlayer(player.loginName);
      }
      player.gracePeriodTimeout = global.setTimeout(
        ((p: Player): void => {
          if (!p.isConnected) {
            p.hasLeft = true;
            const pObj: PhysicsObjectState =
              this.state.physicsState.objects[p.figureId];
            pObj.setDisabled(true);
          }
          p.gracePeriodTimeout = undefined;
        }).bind(this),
        120000,
        player
      );
    }
    return undefined;
  }

  onChatMessage(client: Client, data: WsData): void {
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined && data.type === MessageType.CHAT_MESSAGE) {
      const msg: ChatMessage = {
        type: MessageType.CHAT_MESSAGE,
        message: data.message,
        authorLoginName: player.loginName,
      };
      this.broadcast(msg.type, msg);
    }
  }

  onJoinMessage(client: Client, data: WsData): void {
    if (data.type === MessageType.JOIN_MESSAGE) {
      // TODO: Why is this block empty?
    }
  }

  onGameMessage(client: Client, data: WsData): void {
    console.log(`got GameMessage: ${JSON.stringify(data)}`);
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined && data.type === MessageType.GAME_MESSAGE) {
      switch (data.action) {
        case GameActionType.advanceRound:
          this.state.nextRound();
          break;
        case GameActionType.advanceAction:
          this.state.nextAction(this);
          break;
        case GameActionType.advanceTurn:
          this.state.nextTurn(this);
          break;
        case GameActionType.reverseTurnOrder:
          console.log('reversingTurnOrder');
          this.state.reversed = !this.state.reversed;
          break;
        case GameActionType.setStartingCondition:
          this.state.startGame();
          break;
        case GameActionType.addRule:
          this.state.rules.push(new Rule(data.text, data.author));
          break;
        case GameActionType.deleteRule:
          this.state.rules.splice(data.id, 1);
          break;
        case GameActionType.setTile:
          const myPlayer = data.playerId
            ? this.state.getPlayer(data.playerId)
            : this.state.getPlayerByFigure(data.figureId);
          if (myPlayer !== undefined) {
            myPlayer.setTile(data.tileId);
          }
          if (this.state.currentPlayerLogin === data.playerId) {
            if (this.state.action === Actions[Actions.MOVE]) {
              this.state.nextAction(this);
            }
            const msg = {
              type: MessageType.GAME_MESSAGE,
              action: GameActionType.showTile,
              tile: data.tileId,
            };
            console.log(msg);
            this.broadcast(msg.type, msg);
          }
          break;
        case GameActionType.readyPropertyChange:
          this.state.playerList[player.loginName].isReady = data.isReady;
          let allReady = true;
          this.state.playerList.forEach((p) => {
            if (!p.isReady) {
              allReady = false;
            }
          });
          if (allReady) {
            this.state.startGame();
          }
          break;
        case GameActionType.refreshData:
          this.state.triggerAll();
          this.state.playerList.triggerAll();
          this.state.playerList.forEach((p) => {
            p.triggerAll();
          });
          break;
        case GameActionType.closeVotingSession:
          this.state.voteState.closingIn = 5;
          const intervalId = setInterval(() => {
            if (this.state.voteState.closingIn <= 0) {
              this.state.voteState.voteConfiguration.votingOptions.sort(
                (a: VoteEntry, b: VoteEntry) => {
                  return b.castVotes.length - a.castVotes.length;
                }
              );
              this.state.voteState.voteStage = VoteStage.IDLE;
              this.state.voteState.author = '';
              clearInterval(intervalId);
            }
            this.state.voteState.closingIn--;
          }, 1000);
          break;
        case GameActionType.startVoteCreation:
          if (data.author === player.displayName) {
            this.state.voteState.voteStage = VoteStage.CREATION;
            this.state.voteState.author = data.author;
          }
          break;
        case GameActionType.stopVoteCreation:
          this.state.voteState.voteStage = VoteStage.IDLE;
          break;
        case GameActionType.beginVotingSession:
          this.state.voteState.voteConfiguration.fromObject(data.config);
          this.state.voteState.voteStage = VoteStage.VOTE;
          break;
        case GameActionType.playerCastVote:
          this.state.voteState.voteConfiguration.votingOptions.forEach(
            (ve: VoteEntry, i: number) => {
              ve.castVotes = ve.castVotes.filter(
                (e) => !(e === player.displayName)
              );
              if (i === data.elementIndex) {
                ve.castVotes.push(player.displayName);
              }
            }
          );
          this.state.voteState.voteConfiguration.triggerAll();
          break;
        case GameActionType.addDrinkbuddies:
          const l = new Link();
          l.source = data.source;
          l.target = data.target;
          this.state.drinkBuddyLinks.push(l);
          break;
        case GameActionType.removeDrinkbuddies:
          const linkIndex = this.state.drinkBuddyLinks.findIndex(
            (l) => l.source === data.source && l.target === data.target
          );
          this.state.drinkBuddyLinks.splice(linkIndex, 1);
          break;
        case GameActionType.wakePlayer:
          const targetPlayer = this.state.getPlayer(data.targetLoginName);
          const targetClient: Client = this.clients.find((value) => {
            return value.id === targetPlayer.clientId;
          });
          if (targetClient !== undefined) {
            targetClient.send(MessageType.GAME_MESSAGE, data);
          } else {
            console.warn(
              'Failed to find target client to send a wake player message to.'
            );
          }
          break;
        case GameActionType.none:
        default:
          console.log(
            `[onMessage] GAME_MESSAGE: No action found for ${JSON.stringify(
              data
            )}`
          );
      }
    }
  }

  onPlayerMessage(client: Client, data: WsData) {
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined && data.type === MessageType.PLAYER_MESSAGE) {
      switch (data.subType) {
        case PlayerMessageType.setFigure:
          const player = this.state.getPlayer(data.playerId);
          if (player !== undefined) {
            player.setFigure(player.figureId, data.playerModel);
          }
          this.state.playerList.triggerAll();
          this.state.playerList.forEach((p) => {
            p.triggerAll();
          });
          console.log(
            'got Figure: ',
            player.figureModel,
            data.playerModel,
            data.playerId
          );
          break;
      }
    }
  }

  onPhysicsMessage(client: Client, data: WsData): void {
    if (data.type === MessageType.PHYSICS_MESSAGE) {
      switch (data.subType) {
        default:
          this.state.physicsState.handlePhysicsCommand(data);
      }
    }
  }

  onDebugMessage(client: Client, data: WsData): void {
    if (data.type === MessageType.DEBUG_COMMAND) {
      switch (data.subType) {
        case DebugCommandType.listPhysics:
          this.state.physicsState.listPhysicsItems();
      }
    }
  }

  onLeftMessage(client: Client, data: WsData): void {
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined && data.type === MessageType.LEFT_MESSAGE) {
      // TODO: Why is this block empty?
    }
  }

  onOtherMessage(client: Client, data: WsData): void {
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined && data.type === MessageType.OTHER) {
      // TODO: Why is this block empty?
    }
  }

  onRefreshMessage(client: Client, data: WsData): void {
    this.broadcast(data.type, data);
  }

  onAchievementMessage(client: Client, data: WsData): void {
    if (data.type === MessageType.ACHIEVEMENT_MESSAGE) {
      switch (data.subType) {
        case AchievementMessageType.newAchievement:
          this.broadcast(data.type, data);
      }
    }
  }

  onItemMessage(client: Client, data: WsData): void {
    if (data.type === MessageType.ITEM_MESSAGE) {
      switch (data.subType) {
        case ItemMessageType.giveItem:
          if (this.isHost(client)) {
            const p = this.state.getPlayer(data.playerLoginName);
            if (p !== undefined) {
              if (Number(data.itemId) === -1) {
                data.itemId = ItemManager.getRandomItem();
              }
              const success = p.addItem(Number(data.itemId));
              if (success) {
                console.log(
                  `[onItemMessage] Player received Item: ${p.loginName}, Item:${data.itemId}`
                );
                this.broadcast(MessageType.SERVER_MESSAGE, {
                  type: MessageType.SERVER_MESSAGE,
                  message: `Player: ${this.state.playerList[data.playerLoginName].displayName
                    } received Item ${data.itemId}.`,
                  origin: 'SERVER',
                });
              } else {
                console.log(
                  `[onItemMessage] Failed giving Item: ${p.loginName}, Item:${data.itemId}`
                );
                client.send(MessageType.SERVER_MESSAGE, {
                  type: MessageType.SERVER_MESSAGE,
                  message: `Player: ${this.state.playerList[data.playerLoginName].displayName
                    } couldnt receive Item ${data.itemId}. Player has maximum allowed number of items`,
                  origin: 'SERVER',
                });
              }
            } else {
              console.log(
                `[onItemMessage] Player couldn't be found to receive Item: ${data.playerLoginName}`
              );
            }
          } else {
            console.log(
              `[onItemMessage] Client not authorized to give Item: ${client.id}`
            );
          }
          break;
        case ItemMessageType.useItem:
          const player = this.state.getPlayerByClientId(client.id);
          if (
            player !== undefined &&
            player.loginName === data.playerLoginName
          ) {
            console.log(`[onItemMessage] Client using Item: ${data.itemId}`);
            if (player.useItem(Number(data.itemId))) {
              data.itemName = ItemManager.getName(Number(data.itemId));
              data.itemDescription = ItemManager.getDescription(
                Number(data.itemId)
              );
              this.broadcast(data.type, data);
            } else {
              console.log(`[onItemMessage] Failed using Item: ${data.itemId}`);
            }
          } else {
            console.log(
              `[onItemMessage] Client not authorized to use: 
              ${player.loginName} tried to use ${data.playerLoginName}'s Item of ${data.itemId}`
            );
          }
          break;
      }
    }
  }

  onChatCommand(client: Client, data: WsData): void {
    if (data.type === MessageType.CHAT_COMMAND) {
      switch (data.subType) {
        case ChatCommandType.commandAsk:
          let answer = true;
          if (
            data.question.includes('not') ||
            data.question.includes('nicht') ||
            data.question.includes('überspringen') ||
            data.question.includes('skip')
          ) {
            answer = false;
          }
          const msg =
            data.authorDisplayName +
            ' asked: ' +
            data.question +
            '\n' +
            'Tispyl says: ' +
            (answer ? 'YES' : 'NO');

          this.broadcast(MessageType.SERVER_MESSAGE, {
            type: MessageType.SERVER_MESSAGE,
            message: msg,
            origin: 'Tispyl',
          });

          break;
        case ChatCommandType.commandRandom:
          if (data.limit === undefined || data.limit < 1) {
            data.limit = 10;
          }
          const rand = Math.min(
            Math.floor(Math.random() * data.limit + 1),
            data.limit
          );

          this.broadcast(MessageType.SERVER_MESSAGE, {
            type: MessageType.SERVER_MESSAGE,
            message: `The random number between 1 and ${data.limit} is ${rand}`,
            origin: 'SERVER',
          });
          break;
        case ChatCommandType.commandCoinFlip:
          const coin = Math.random() >= 0.5;

          this.broadcast(MessageType.SERVER_MESSAGE, {
            type: MessageType.SERVER_MESSAGE,
            message: `The coin landed on ${coin ? 'HEADS (KOPF)' : 'TAILS (ZAHL)'
              }`,
            origin: 'SERVER',
          });
          break;
      }
    }
  }

  private isHost(client: Client): boolean {
    const player = this.state.getPlayerByClientId(client.id);
    if (player !== undefined) {
      return player.loginName === this.state.hostLoginName;
    }
    return false;
  }
}
