import {OnDeleteBehaviour, PhysicsObjectState} from "./state/PhysicsState";
import {MapSchema} from "@colyseus/schema";
import CANNON from "cannon";
import boundaryData from "../resources/gameBoundarys.json";

export interface PhysicsObject {
  physicsBody: CANNON.Body;
  mass: number;
  objectIdTHREE: number;
  onDelete: ((obj: PhysicsObject) => boolean);
}

export class PhysicsEngine {
  private physicsObjects = new Map<number, PhysicsObject>();
  private networkObjects: MapSchema<PhysicsObjectState>
  private physicsLoop: NodeJS.Timeout;
  private deletionPlane = -15;
  world: CANNON.World;
  disposeFromViewport: (obj: PhysicsObject) => boolean;

  private fixedTimeStep = 10 / 60; //seconds
  private maxSubSteps = 3;
  private lastTime;

  constructor(objects: MapSchema<PhysicsObjectState>) {
    this.networkObjects = objects;
    this.setupPhysicsWorld();
  }

  setupPhysicsWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.81, 0);

    this.addCannonObject(this.createGameBoard());
    console.log('rendering started');
    this.physicsLoop = global.setInterval(this.updatePhysics.bind(this), 25);
  }
  updatePhysics() {
    const time = Date.now();
    if (this.lastTime != undefined) {
      const dt = (time - this.lastTime) / 1000;
      this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
    }
    this.physicsObjects.forEach(this.updatePhysicsObject.bind(this));
    this.lastTime = time;
  }
  updatePhysicsObject(phys: PhysicsObject, key: number) {
    if (phys === undefined || phys.physicsBody === undefined) return;

    if (!this.checkDeletionPlane(phys, key, phys.physicsBody.position)) {
      this.updateNetworkObject(key.toString(), phys.physicsBody.position, phys.physicsBody.quaternion);
    }
  }
  updateNetworkObject(key: String, position: CANNON.Vec3, quat: CANNON.Quaternion) {
    const netObj = this.networkObjects.get(key.toString());
    netObj.position.set(position.x, position.y, position.z);
    netObj.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
  checkDeletionPlane(object: PhysicsObject, objectKey: number, position: CANNON.Vec3) {
    if (position.y < this.deletionPlane) {
      if (!object.onDelete || !object.onDelete.bind(this)(object)) {
        this.physicsObjects.delete(objectKey);
        if (this.disposeFromViewport) {
          this.disposeFromViewport(object);
        }
      }
      return true;
    }
    return false;
  }

  createGameBoard(): CANNON.Body{
    const halfExtends = new CANNON.Vec3(50, .5, 50);
    const gBoardShape = new CANNON.Box(halfExtends);
    const gBoardBody = new CANNON.Body({
      mass: 0 //mass=0 makes the body static
    });
    gBoardBody.addShape(gBoardShape);
    gBoardBody.position.set(0, -.1, 0);
    this.addGameBoardBoundarys(gBoardBody);

    return gBoardBody;
  }
  addGameBoardBoundarys(gameBoard: CANNON.Body) {
    boundaryData.boundarys.forEach((value: {landscape: boolean, x: number, y: number, length: number}) => {
      const x = boundaryData.borderCoords.x[value.x], y = boundaryData.borderCoords.y[value.y];

      const halfExtends = new CANNON.Vec3(
        value.landscape ? value.length/2 : boundaryData.boundaryWidth,
        boundaryData.boundaryHeight,
        value.landscape ? boundaryData.boundaryWidth : value.length/2);
      const boundaryShape = new CANNON.Box(halfExtends);

      gameBoard.addShape(boundaryShape, new CANNON.Vec3(
        value.landscape ? x + value.length/2 : x,
        boundaryData.yOffset,
        value.landscape ? y : y + value.length/2
      ));
    });
  }
  addCannonObject(o: CANNON.Body) {
    this.world.addBody(o);
  }
  getPhysicsObjectByID(id: number): PhysicsObject {
    return this.physicsObjects.get(id);
  }
  addPhysicsObject(obj: PhysicsObject): void {
    this.physicsObjects.set(obj.objectIdTHREE, obj);
  }
  removePhysicsObjectByID(id: number): void {
    this.physicsObjects.delete(id);
  }
  setKinematic(objID: number, kinematic: boolean) {
    if (kinematic) {
      this.getPhysicsObjectByID(objID).physicsBody.type = CANNON.Body.KINEMATIC;
    } else {
      this.getPhysicsObjectByID(objID).physicsBody.type = CANNON.Body.DYNAMIC;
    }
  }
  setPosition(objID: number, x: number, y: number, z: number) {
    this.getPhysicsObjectByID(objID).physicsBody.position.set(x, y, z);
  }
  setQuat(objID: number, x: number, y: number, z: number, w: number) {
    this.getPhysicsObjectByID(objID).physicsBody.quaternion.set(x, y, z, w);
  }
  setVelocity(objID: number, x: number, y: number, z: number) {
    this.getPhysicsObjectByID(objID).physicsBody.velocity.set(x, y, z);
  }
  setAngularVelocity(objID: number, x: number, y: number, z: number) {
    this.getPhysicsObjectByID(objID).physicsBody.angularVelocity.set(x, y, z);
  }

  addShape(geo: CANNON.Shape, object: PhysicsObjectState, mass: number, onDelete?: OnDeleteBehaviour) {
    const objectID = object.objectIDPhysics;
    const physicsBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(object.position.x, object.position.y, object.position.z),
      quaternion: new CANNON.Quaternion(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w)
    });
    physicsBody.addShape(geo);
    this.physicsObjects.set(objectID, {
      mass: mass,
      objectIdTHREE: objectID,
      physicsBody: physicsBody,
      onDelete: this.getOnDelete(onDelete) || this.defaultOnDelete
    });
    this.addCannonObject(physicsBody);
    // console.log('Shape Mass: ', objectID, mass, rigidBodyParams.colGroup, rigidBodyParams.colMask, rigidBodyParams.quatX, rigidBodyParams.quatY, rigidBodyParams.quatZ, rigidBodyParams.quatW);
  }
  private getOnDelete(type: OnDeleteBehaviour): (obj: PhysicsObject) => boolean {
    switch (type) {
      case OnDeleteBehaviour.default:
      default:
        return this.defaultOnDelete;
        break;
    }
  }
  private defaultOnDelete(obj: PhysicsObject): boolean {
    return this.respawnOnDelete(obj);
  }
  private respawnOnDelete(obj: PhysicsObject): boolean {
    // console.log("deleting with default: " + obj.objectIdTHREE);
    obj.physicsBody.position.set( 0, 15, 0);
    obj.physicsBody.velocity.set(0, 0, 0);
    return true;
  }


  destructEngine(){
    global.clearInterval(this.physicsLoop);
  }
}
