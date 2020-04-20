export type WsData = OtherMessage | ChatMessage | JoinMessage | GameMessage | PlayerMessage | PhysicsCommand | DebugCommand;
export enum MessageType {
  OTHER,
  CHAT_MESSAGE,
  JOIN_MESSAGE,
  GAME_MESSAGE,
  PLAYER_MESSAGE,
  PHYSICS_MESSAGE,
  DEBUG_COMMAND
}

export interface OtherMessage {
  type: MessageType.OTHER;
  message: string;
}
export interface ChatMessage {
  type: MessageType.CHAT_MESSAGE;
  message: string;
}
export interface JoinMessage {
  type: MessageType.JOIN_MESSAGE;
  message: string;
}
export enum GameActionType {
  none,
  advanceRound,
  advanceAction,
  advanceTurn,
  setStartingCondition,
  setTile
}
export type GameMessage = GameAction | GameSetTile;
type actionTypes = GameActionType.none |
    GameActionType.advanceRound |
    GameActionType.advanceAction |
    GameActionType.advanceTurn |
    GameActionType.setStartingCondition;
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
export type PlayerMessage = SetFigure;
export enum PlayerMessageType {
  setFigure
}
export interface SetFigure {
  type: MessageType.PLAYER_MESSAGE;
  subType: PlayerMessageType.setFigure;
  playerId: string;
  figureId: number;
  color: number;
}

export enum PhysicsCommandType {
  getNewId,
  create,
  remove,
  kinematic,
  position,
  quaternion,
  velocity,
  angularVelocity
}
export type PhysicsCommand = PhysicsCommandKinematic |
    PhysicsCommandCreate    |
    PhysicsCommandRemove    |
    PhysicsCommandPosition  |
    PhysicsCommandQuat      |
    PhysicsCommandVelocity  |
    PhysicsCommandAngular   |
    PhysicsCommandGetNewId;
export interface PhysicsCommandKinematic {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.kinematic;
  objectID: number;
  kinematic: boolean;
}
export interface PhysicsCommandCreate {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.create;
  objectID: number;
  geo: ArrayLike<number>;
  mass: number;
  colGroup: number;
  colMask: number;
  behavior: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  quaternionW: number;
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
export interface PhysicsCommandGetNewId {
  type: MessageType.PHYSICS_MESSAGE;
  subType: PhysicsCommandType.getNewId;
  id: number;
}

export type DebugCommand = ListPhysics;
export enum DebugCommandType {
  listPhysics
}
export interface ListPhysics {
  type: MessageType.DEBUG_COMMAND;
  subType: DebugCommandType.listPhysics;
}

