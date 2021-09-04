import { VoteConfiguration } from './state/VoteState';

export type WsData =
  | OtherMessage
  | ServerMessage
  | ChatMessage
  | JoinMessage
  | LeftMessage
  | GameMessage
  | PlayerMessage
  | PhysicsCommand
  | DebugCommand
  | RefreshCommand
  | AchievementMessage
  | ItemMessage
  | ChatCommand;

export enum MessageType {
  OTHER,
  SERVER_MESSAGE,
  CHAT_MESSAGE,
  JOIN_MESSAGE,
  LEFT_MESSAGE,
  GAME_MESSAGE,
  PLAYER_MESSAGE,
  PHYSICS_MESSAGE,
  DEBUG_COMMAND,
  REFRESH_COMMAND,
  ACHIEVEMENT_MESSAGE,
  ITEM_MESSAGE,
  CHAT_COMMAND,
}

export interface OtherMessage {
  type: MessageType.OTHER;
  message: string;
}
export interface ServerMessage {
  type: MessageType.SERVER_MESSAGE;
  message: string;
  origin: string;
}
export interface ChatMessage {
  type: MessageType.CHAT_MESSAGE;
  message: string;
  authorLoginName: string;
}
export interface JoinMessage {
  type: MessageType.JOIN_MESSAGE;
  message: string;
}
export interface LeftMessage {
  type: MessageType.LEFT_MESSAGE;
  message: string;
}
export enum GameActionType {
  none,
  addRule,
  deleteRule,
  advanceRound,
  advanceAction,
  advanceTurn,
  reverseTurnOrder,
  readyPropertyChange,
  setStartingCondition,
  showTile,
  setTile,
  refreshData,
  diceRolled,
  startVoteCreation,
  stopVoteCreation,
  beginVotingSession,
  playerCastVote,
  closeVotingSession,
  addDrinkbuddies,
  removeDrinkbuddies,
  wakePlayer,
}

export type GameMessage =
  | GameAction
  | GameSetTile
  | GameShowTile
  | GameReadyProperty
  | GameAddRule
  | GameDeleteRule
  | GameDiceRoll
  | GameStartCreatingVote
  | GameStopCreatingVote
  | GameBeginVotingSession
  | GamePlayerCastVote
  | GameCloseVotingSession
  | GameUpdateDrinkBuddies
  | GameWakePlayer;

type actionTypes =
  | GameActionType.none
  | GameActionType.advanceRound
  | GameActionType.advanceAction
  | GameActionType.advanceTurn
  | GameActionType.reverseTurnOrder
  | GameActionType.refreshData
  | GameActionType.setStartingCondition;

export interface GameAction {
  type: MessageType.GAME_MESSAGE;
  action: actionTypes;
}
export interface GameSetTile {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.setTile;
  figureId: number;
  playerId: string;
  tileId: number;
}
export interface GameShowTile {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.showTile;
  tile: number;
}
export interface GameReadyProperty {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.readyPropertyChange;
  isReady: boolean;
}
export interface GameAddRule {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.addRule;
  text: string;
  author: string;
}
export interface GameDeleteRule {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.deleteRule;
  id: number;
}
export interface GameDiceRoll {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.diceRolled;
  roll: number;
}
export interface GameStartCreatingVote {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.startVoteCreation;
  author: string;
}
export interface GameStopCreatingVote {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.stopVoteCreation;
}
export interface GameBeginVotingSession {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.beginVotingSession;
  config: VoteConfiguration;
}
export interface GamePlayerCastVote {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.playerCastVote;
  elementIndex: number;
}
export interface GameCloseVotingSession {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.closeVotingSession;
}
export interface GameUpdateDrinkBuddies {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.addDrinkbuddies | GameActionType.removeDrinkbuddies;
  source: string;
  target: string;
}
export interface GameWakePlayer {
  type: MessageType.GAME_MESSAGE;
  action: GameActionType.wakePlayer;
  targetLoginName: string;
}

export type PlayerMessage = SetFigure;
export enum PlayerMessageType {
  setFigure,
}
export enum PlayerModel {
  bcap_NukaCola = 1,
  bcap_CocaCola,
  bcap_Tiddies1,
  bcap_Schmucker,
  bcap_Jagermeister,
  bcap_OurAnthem,
  bcap_Murica,
  bcap_countcount,
  bcap_hb,
  bcap_cat,
  bcap_yoshi,
  bcap_niclas,
  bcap_adi,
  bcap_lordHelmchen,
  bcap_gude,
  bcap_Developer,
}
export interface SetFigure {
  type: MessageType.PLAYER_MESSAGE;
  subType: PlayerMessageType.setFigure;
  playerId: string;
  playerModel: PlayerModel;
}

export enum PhysicsCommandType {
  remove,
  kinematic,
  position,
  quaternion,
  velocity,
  angularVelocity,
  wakeAll,
}
export type PhysicsCommand =
  | PhysicsCommandKinematic
  | PhysicsCommandRemove
  | PhysicsCommandPosition
  | PhysicsCommandQuat
  | PhysicsCommandVelocity
  | PhysicsCommandAngular
  | PhysicsCommandWakeAll;
export enum PhysicsEntity {
  dice,
  figure,
}
export enum PhysicsEntityVariation {
  default,
}
export interface PhysicsCommandKinematic {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.kinematic;
  objectID: number;
  kinematic: boolean;
}
export interface PhysicsCommandRemove {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.remove;
  objectID: number;
}
export interface PhysicsCommandPosition {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.position;
  objectID: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}
export interface PhysicsCommandQuat {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.quaternion;
  objectID: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  quaternionW: number;
}
export interface PhysicsCommandVelocity {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.velocity;
  objectID: number;
  velX: number;
  velY: number;
  velZ: number;
}
export interface PhysicsCommandAngular {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.angularVelocity;
  objectID: number;
  angularX: number;
  angularY: number;
  angularZ: number;
}
export interface PhysicsCommandWakeAll {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.wakeAll;
}

export type DebugCommand = ListPhysics;

export enum DebugCommandType {
  listPhysics,
}
export interface ListPhysics {
  type: MessageType.DEBUG_COMMAND;
  subType: DebugCommandType.listPhysics;
}

export type RefreshCommand = RefreshProfilePics;

export enum RefreshCommandType {
  refreshProfilePic,
}
export interface RefreshProfilePics {
  type: MessageType.REFRESH_COMMAND;
  subType: RefreshCommandType.refreshProfilePic;
}

export type AchievementMessage = NewAchievement;

export enum AchievementMessageType {
  newAchievement,
}
export interface NewAchievement {
  type: MessageType.ACHIEVEMENT_MESSAGE;
  subType: AchievementMessageType.newAchievement;
}

export type ItemMessage = GiveItem | UseItem;

export enum ItemMessageType {
  giveItem,
  useItem,
}
export interface GiveItem {
  type: MessageType.ITEM_MESSAGE;
  subType: ItemMessageType.giveItem;
  playerLoginName: string;
  itemId: number;
}
export interface UseItem {
  type: MessageType.ITEM_MESSAGE;
  subType: ItemMessageType.useItem;
  playerLoginName: string;
  targetLoginName: string;
  itemId: number;
  param: string;
  itemName: string;
  itemDescription: string;
}

export type ChatCommand = AskCommand | RandomCommand | CoinFlipCommand;

export enum ChatCommandType {
  commandAsk,
  commandRandom,
  commandCoinFlip,
}
export interface AskCommand {
  type: MessageType.CHAT_COMMAND;
  subType: ChatCommandType.commandAsk;
  question: string;
  authorDisplayName: string;
}
export interface RandomCommand {
  type: MessageType.CHAT_COMMAND;
  subType: ChatCommandType.commandRandom;
  limit: number;
}
export interface CoinFlipCommand {
  type: MessageType.CHAT_COMMAND;
  subType: ChatCommandType.commandCoinFlip;
}
