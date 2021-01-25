import {OnDeleteBehaviour, PhysicsObjectState} from "./state/PhysicsState";
import {MapSchema} from "@colyseus/schema";
import CANNON from "cannon";
import boundaryData from "../resources/gameBoundarys.json";
import {PhysicsEntity} from "./WsData";

export interface PhysicsObject {
  physicsBody: CANNON.Body;
  mass: number;
  objectIdTHREE: number;
  onDelete: ((obj: PhysicsObject) => boolean);
}

export class PhysicsEngine {
  private readonly SLEEP_SPEED = .1;
  private readonly SLEEP_TIME = 1.0;
  private readonly ground_Material = new CANNON.Material('ground');
  private readonly dice_Material = new CANNON.Material('dice');
  private readonly figure_Material = new CANNON.Material('figure');

  private physicsObjects = new Map<number, PhysicsObject>();
  private networkObjects: MapSchema<PhysicsObjectState>
  private physicsLoop: NodeJS.Timeout;
  private deletionPlane = -.15;
  world: CANNON.World;
  disposeFromViewport: (obj: PhysicsObject) => boolean;

  private fixedTimeStep = 10; //milliseconds
  private maxSubSteps = 10;
  private lastTime;
  private lastLog;

  private iterations = 0;
  private sumOfIterations = 0;

  private iterations = 0;
  private sumOfIterations = 0;

  constructor(objects: MapSchema<PhysicsObjectState>) {
    this.networkObjects = objects;
    this.setupPhysicsWorld();
  }

  setupPhysicsWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.81, 0);
    this.world.allowSleep = true;
    this.world.solver.iterations = 10;

    this.setupMaterials();

    this.addCannonObject(this.createGameBoard());
    console.log('rendering started');
    this.physicsLoop = global.setInterval(this.updatePhysics.bind(this), this.fixedTimeStep);
  }
  setupMaterials() {
    /* Defaults from Cannon are:
      friction: 0.3,
      restitution: 0.3,
      contactEquationRelaxation: 1e7,
      contactEquationStiffness: 3,
      frictionEquationRelaxation: 1e7,
      frictionEquationStiffness: 3
     */
    const dice_ground = new CANNON.ContactMaterial(this.ground_Material, this.dice_Material, {
      friction: 0.0006,
      restitution: 0.4,
      contactEquationStiffness: 0.5,
      contactEquationRelaxation: 1e7,
      frictionEquationStiffness: 0.1,
      frictionEquationRelaxation: 1e7
    });
    this.world.addContactMaterial(dice_ground);
    const figure_ground = new CANNON.ContactMaterial(this.ground_Material, this.figure_Material, {
      friction: 0.3,
      restitution: 0.3,
      contactEquationStiffness: 0.5,
      contactEquationRelaxation: 1e14,
      frictionEquationStiffness: 0.1,
      frictionEquationRelaxation: 1e7
    });
    this.world.addContactMaterial(figure_ground);
    const dice_figure = new CANNON.ContactMaterial(this.dice_Material, this.figure_Material, {
      friction: 0.3,
      restitution: 0.3,
      contactEquationStiffness: 0.5,
      contactEquationRelaxation: 1e7,
      frictionEquationStiffness: 0.1,
      frictionEquationRelaxation: 1e7
    });
    this.world.addContactMaterial(dice_figure);
  }
  updatePhysics() {
    const time = Date.now();//performance.now(); //Date.now();
    if (this.lastTime != undefined) {
      const dt = (time - this.lastTime) / 3000;
      this.lastTime = time;
      //this.world.step(this.fixedTimeStep / 1000, dt, this.maxSubSteps);
      this.world.step(dt);

      this.sumOfIterations += dt;
      this.iterations++;
      if (this.lastLog === undefined) this.lastLog = Date.now();
      const dtLog = Date.now() - this.lastLog; //in ms
      if (this.iterations >= 1000 && dtLog >= 120000) { //every 2 minutes AND 1000 Frames, log mean time
        this.lastLog = Date.now();
        console.info("last", this.iterations, "Physics Iterations with", (this.sumOfIterations / this.iterations * 1000).toFixed(4), "ms dt, ", this.fixedTimeStep, "ms desired timestep");
        this.sumOfIterations = 0;
        this.iterations = 0;
      }
    } else {
      this.lastTime = time;
    }
    this.physicsObjects.forEach(this.updatePhysicsObject.bind(this));
  }
  updatePhysicsObject(phys: PhysicsObject, key: number) {
    if (phys === undefined || phys.physicsBody === undefined) return;

    if (!this.checkDeletionPlane(phys, key, phys.physicsBody.position)) {
      this.updateNetworkObject(key.toString(), phys.physicsBody.position, phys.physicsBody.quaternion);
    }
  }
  updateNetworkObject(key: String, position: CANNON.Vec3, quat: CANNON.Quaternion) {
    const netObj = this.networkObjects.get(key.toString());
    netObj.position.set(
      PhysicsEngine.rescaleUnitInverse(position.x),
      PhysicsEngine.rescaleUnitInverse(position.y),
      PhysicsEngine.rescaleUnitInverse(position.z));
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

  public static rescaleUnit(inVal: number): number {
    return inVal / 100;
  }
  public static rescaleUnitInverse(inVal: number): number {
    return inVal * 100;
  }

  createGameBoard(): CANNON.Body{
    const gBoardBody = new CANNON.Body({
      mass: 0, //mass=0 makes the body static
      material: this.ground_Material
    });
    const halfExtends = new CANNON.Vec3(PhysicsEngine.rescaleUnit(50), PhysicsEngine.rescaleUnit(3), PhysicsEngine.rescaleUnit(50));
    const gBoardShape = new CANNON.Box(halfExtends);
    const halfExtendsTiles = new CANNON.Vec3(PhysicsEngine.rescaleUnit(40), PhysicsEngine.rescaleUnit(3), PhysicsEngine.rescaleUnit(40));
    const tilesShape = new CANNON.Box(halfExtendsTiles);
    gBoardBody.addShape(tilesShape, new CANNON.Vec3(0, PhysicsEngine.rescaleUnit(-2.5), 0));
    gBoardBody.addShape(gBoardShape, new CANNON.Vec3(0, PhysicsEngine.rescaleUnit(-2.6), 0));
    gBoardBody.position.set(0, PhysicsEngine.rescaleUnit(0.1), 0);
    this.addGameBoardBoundarys(gBoardBody);

    return gBoardBody;
  }
  addGameBoardBoundarys(gameBoard: CANNON.Body) {
    boundaryData.boundarys.forEach((value: {landscape: boolean, x: number, y: number, length: number}) => {
      const x = boundaryData.borderCoords.x[value.x], y = boundaryData.borderCoords.y[value.y];

      const halfExtends = new CANNON.Vec3(
        PhysicsEngine.rescaleUnit(value.landscape ? value.length/2 + boundaryData.boundaryWidth : boundaryData.boundaryWidth),
        PhysicsEngine.rescaleUnit(boundaryData.boundaryHeight),
        PhysicsEngine.rescaleUnit(value.landscape ? boundaryData.boundaryWidth : value.length/2 + boundaryData.boundaryWidth));
      const boundaryShape = new CANNON.Box(halfExtends);

      gameBoard.addShape(boundaryShape, new CANNON.Vec3(
        PhysicsEngine.rescaleUnit(value.landscape ? x + value.length/2 + boundaryData.boundaryWidth : x),
        PhysicsEngine.rescaleUnit(boundaryData.yOffset),
        PhysicsEngine.rescaleUnit(value.landscape ? y : y + value.length/2 + boundaryData.boundaryWidth)
      ));
    });
  }
  addCannonObject(o: CANNON.Body) {
    o.sleepSpeedLimit = this.SLEEP_SPEED;
    o.sleepTimeLimit = this.SLEEP_TIME;
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
    const pBody = this.getPhysicsObjectByID(objID).physicsBody;
    if (kinematic) {
      pBody.type = CANNON.Body.KINEMATIC;
    } else {
      pBody.type = CANNON.Body.DYNAMIC;
      pBody.wakeUp();
    }
  }
  setPosition(objID: number, x: number, y: number, z: number) {
    this.getPhysicsObjectByID(objID).physicsBody.position.set(
      PhysicsEngine.rescaleUnit(x), PhysicsEngine.rescaleUnit(y), PhysicsEngine.rescaleUnit(z));
  }
  setQuat(objID: number, x: number, y: number, z: number, w: number) {
    this.getPhysicsObjectByID(objID).physicsBody.quaternion.set(x, y, z, w);
  }
  setVelocity(objID: number, x: number, y: number, z: number) {
    const pBody = this.getPhysicsObjectByID(objID).physicsBody;
    if (pBody === undefined) {
      return;
    }
    //console.log("set Velocity:", objID, x, y, z);
    //pBody.velocity.set(x, y, z);
    pBody.wakeUp();
    pBody.velocity.set(
      PhysicsEngine.rescaleUnit(x),
      PhysicsEngine.rescaleUnit(y),
      PhysicsEngine.rescaleUnit(z));
    pBody.velocity.scale(2, pBody.velocity);
    pBody.velocity.scale(pBody.mass, pBody.inertia);
    /*pBody.inertia.set(
      PhysicsEngine.rescaleUnit(x) * pBody.mass,
      PhysicsEngine.rescaleUnit(y) * pBody.mass,
      PhysicsEngine.rescaleUnit(z) * pBody.mass);*/
  }
  //set angular Velocity by rotation axis. length of vector is the rotation speed
  setAngularVelocity(objID: number, x: number, y: number, z: number) {
    const pBody = this.getPhysicsObjectByID(objID).physicsBody;
    pBody.angularVelocity.set(x, y, z);
    const aVelClone = pBody.angularVelocity.clone();
    //console.log("set Ang Velocity:", aVelClone, aVelClone.normalize());
  }

  addShape(geoList: {shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[], object: PhysicsObjectState, mass: number, onDelete?: OnDeleteBehaviour) {
    const objectID = object.objectIDPhysics;
    const physicsBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(
        PhysicsEngine.rescaleUnit(object.position.x),
        PhysicsEngine.rescaleUnit(object.position.y),
        PhysicsEngine.rescaleUnit(object.position.z)),
      quaternion: new CANNON.Quaternion(
        object.quaternion.x,
        object.quaternion.y,
        object.quaternion.z,
        object.quaternion.w)
    });
    if (object.entity === PhysicsEntity.dice) {
      physicsBody.material = this.dice_Material;
    } else if (object.entity === PhysicsEntity.figure) {
      physicsBody.material = this.figure_Material;
    }
    geoList.forEach((geo) => {
      physicsBody.addShape(geo.shape, geo.offset, geo.orientation);
    });
    this.physicsObjects.set(objectID, {
      mass: mass,
      objectIdTHREE: objectID,
      physicsBody: physicsBody,
      onDelete: this.getOnDelete(onDelete) || this.defaultOnDelete
    });
    this.addCannonObject(physicsBody);
    console.info('Shape Added: ID:', objectID,
      ', mass:', mass.toFixed(2),
      ', entity:', object.entity,
      ',x:', PhysicsEngine.rescaleUnit(object.position.x).toFixed(2),
      'y:', PhysicsEngine.rescaleUnit(object.position.y).toFixed(2),
      'z:', PhysicsEngine.rescaleUnit(object.position.z).toFixed(2),
      'rx:', object.quaternion.x.toFixed(2),
      'ry:', object.quaternion.y.toFixed(2),
      'rz:', object.quaternion.z.toFixed(2),
      'rw:', object.quaternion.w.toFixed(2));
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
<<<<<<< HEAD
<<<<<<< HEAD
    obj.physicsBody.position.set( 0, 0.15, 0);
=======
    obj.physicsBody.position.set( 0, 15, 0);
>>>>>>> added Cannon as new Physics Engine
=======
    obj.physicsBody.position.set( 0, 0.15, 0);
>>>>>>> tweaked Cannon Physics to match a reasonable behavior
    obj.physicsBody.velocity.set(0, 0, 0);
    return true;
  }


  destructEngine(){
    global.clearInterval(this.physicsLoop);
  }
}
