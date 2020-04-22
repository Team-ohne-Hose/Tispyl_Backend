import {MapSchema, Schema, type} from "@colyseus/schema";
import {CollisionGroups, PhysicsEngine, PhysicsObject} from "../PhysicsEngine";
import {
    MessageType,
    PhysicsCommand,
    PhysicsCommandAddEntity,
    PhysicsCommandType,
    PhysicsEntity,
    PhysicsEntityVariation
} from "../WsData";
import {EntityLoader} from "../EntityLoader";
import * as THREE from 'three';

export enum OnDeleteBehaviour {
    default
}
export class Vector extends Schema {
    @type("number")
    x: number;
    @type("number")
    y: number;
    @type("number")
    z: number;
    constructor(x?: number, y?: number, z?: number) {
        super();
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
export class Quaternion extends Schema {
    @type("number")
    x: number;
    @type("number")
    y: number;
    @type("number")
    z: number;
    @type("number")
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number) {
        super();
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
    }
    set(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}
export class PhysicsObjectState extends Schema {
    @type("number")
    objectIDPhysics: number;
    @type(Vector)
    position: Vector = new Vector();
    @type(Quaternion)
    quaternion: Quaternion = new Quaternion();
    @type("number")
    entity: PhysicsEntity;
    @type("number")
    variant: PhysicsEntityVariation;
    private physicsEngine: PhysicsEngine;
    constructor(id: number, engine: PhysicsEngine, position?: Vector, quaternion?: Quaternion, entity?: PhysicsEntity, variation?: PhysicsEntityVariation) {
        super();
        this.objectIDPhysics = id;
        this.physicsEngine = engine;
        this.position = position || new Vector();
        this.quaternion = quaternion || new Quaternion();
        this.entity = entity;
        this.variant = variation;
    }

}
export class PhysicsState extends Schema {
    @type({ map: PhysicsObjectState})
    objects = new MapSchema<PhysicsObjectState>();

    private readonly physicsEngine: PhysicsEngine;
    private idCounter = 1;
    private loader: EntityLoader
    private readonly startPoint = {x: 38.708, y: 10, z: -36.776};
    private broadcastNewObject: (cmd: PhysicsCommandAddEntity) => void;

    constructor() {
        super();
        this.physicsEngine = new PhysicsEngine(this.objects);
        this.loader = new EntityLoader();
    }

    setBroadcastCallback(broadcastCallback: ((cmd: PhysicsCommandAddEntity) => void)) {
        this.broadcastNewObject = broadcastCallback;
    }

    private getOnDelete(type: OnDeleteBehaviour): (obj: PhysicsObject) => boolean {
        // TODO implement
        return undefined;
    }
    private getNewId(): number {
        this.idCounter++;
        console.log('gave out id ', this.idCounter);
        return this.idCounter;
    }
    listPhysicsItems(): string {
        return this.physicsEngine.listObjects();
    }

    handlePhysicsCommand(cmd: PhysicsCommand) {
        // console.log('PCMD: ', cmd.subType, cmd['objectID']);
            switch (cmd.subType) {
                case PhysicsCommandType.addEntity:
                    // TODO: use color
                    const id = this.getNewId();
                    cmd.physicsId = id;
                    const pos = new Vector(cmd.posX, cmd.posY, cmd.posZ);
                    const quat = new Quaternion(cmd.rotX, cmd.rotY, cmd.rotZ, cmd.rotW);
                    const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat, cmd.entity, cmd.variant);
                    obj.entity = cmd.entity || PhysicsEntity.figure;
                    obj.variant = cmd.variant || PhysicsEntityVariation.default;
                    this.objects[id] = obj;
                    this.loader.load(this.physicsEngine, obj, cmd.entity, cmd.variant);
                    this.broadcastNewObject(cmd);
                    break;
                case PhysicsCommandType.remove:
                    this.removePhysicsObject(cmd.objectID);
                    break;
                case PhysicsCommandType.kinematic:
                    this.setKinematic(cmd.objectID, cmd.kinematic);
                    break;
                case PhysicsCommandType.position:
                    this.setPosition(cmd.objectID, cmd.positionX, cmd.positionY, cmd.positionZ);
                    break;
                case PhysicsCommandType.quaternion:
                    this.setRotationQuat(cmd.objectID, cmd.quaternionX, cmd.quaternionY, cmd.quaternionZ, cmd.quaternionW);
                    break;
                case PhysicsCommandType.velocity:
                    this.setVelocity(cmd.objectID, cmd.velX, cmd.velY, cmd.velZ);
                    break;
                case PhysicsCommandType.angularVelocity:
                    this.setAngularVelocity(cmd.objectID, cmd.angularX, cmd.angularY, cmd.angularZ);
                    break;
                default:
                    console.log('PhysicsCommand not recognised', cmd);
                    break;
            }
    }
    addPlayer(): number {
        const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2));
        const id = this.getNewId();
        const pos = new Vector(this.startPoint.x, this.startPoint.y, this.startPoint.z);
        const quat = new Quaternion(rot.x, rot.y, rot.z, rot.w);
        console.log('calculated Quat:', quat.x, quat.y, quat.z, quat.w);
        const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat, PhysicsEntity.figure, PhysicsEntityVariation.default);
        this.objects[id] = obj;
        this.loader.load(this.physicsEngine, obj, PhysicsEntity.figure, PhysicsEntityVariation.default);
        const cmd: PhysicsCommandAddEntity = {
            type: MessageType.PHYSICS_MESSAGE,
            subType: PhysicsCommandType.addEntity,
            physicsId: id,
            entity: PhysicsEntity.figure,
            variant: PhysicsEntityVariation.default,
            posX: this.startPoint.x,
            posY: this.startPoint.y,
            posZ: this.startPoint.z,
            rotX: quat.x,
            rotY: quat.y,
            rotZ: quat.z,
            rotW: quat.w,
            color: undefined,
        }
        this.broadcastNewObject(cmd);
        return id;
    }
    addDice() {
        const id = this.getNewId();
        const pos = new Vector(0, 10, 0);
        const quat = new Quaternion(0, 0, 0, 1);
        const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat, PhysicsEntity.dice, PhysicsEntityVariation.default);
        this.objects[id] = obj;
        this.loader.load(this.physicsEngine, obj, PhysicsEntity.dice, PhysicsEntityVariation.default);
        const cmd: PhysicsCommandAddEntity = {
            type: MessageType.PHYSICS_MESSAGE,
            subType: PhysicsCommandType.addEntity,
            physicsId: id,
            entity: PhysicsEntity.dice,
            variant: PhysicsEntityVariation.default,
            posX: 0,
            posY: 10,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            rotW: 1,
            color: undefined,
        }
        this.broadcastNewObject(cmd);
    }

    sendExisting(cb: ((obj: PhysicsCommandAddEntity) => void)) {
        for (let key in this.objects) {
            console.log('transmitting Object: ', key);
            const obj: PhysicsObjectState = this.objects[key];
            const cmd: PhysicsCommandAddEntity = {
                type: MessageType.PHYSICS_MESSAGE,
                subType: PhysicsCommandType.addEntity,
                physicsId: obj.objectIDPhysics,
                entity: obj.entity || PhysicsEntity.figure,
                variant: obj.variant || PhysicsEntityVariation.default,
                posX: obj.position.x,
                posY: obj.position.y,
                posZ: obj.position.z,
                rotX: obj.quaternion.x,
                rotY: obj.quaternion.y,
                rotZ: obj.quaternion.z,
                rotW: obj.quaternion.w,
                color: undefined,
            }
            cb(cmd);
        }
        console.log('transmitted... ');
    }

    // TODO remove
    private addPhysicsObject(id: number, pos: Vector, quat: Quaternion, geo: ArrayLike<number>, mass: number, colGroup?: CollisionGroups, colMask?: CollisionGroups, behavior?: OnDeleteBehaviour) {
        const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat);
        this.objects[id] = obj;
        this.physicsEngine.addShape(geo, obj, mass, colGroup, colMask, this.getOnDelete(behavior));
    }

    removePhysicsObject(id: number) {
        delete this.objects[id];
    }
    setKinematic(id: number, enable: boolean) {
        this.physicsEngine.setKinematic(id, enable);
    }
    setPosition(id: number, x: number, y: number, z: number) {
        this.objects[id].position.set(x || 0, y || 0, z || 0);
        this.physicsEngine.setPosition(id, x || 0, y || 0, z || 0);
    }
    setRotationQuat(id: number, x: number, y: number, z: number, w: number) {
        this.objects[id].quaternion.set(x || 0, y || 0, z || 0, w || 1);
        this.physicsEngine.setRotationQuat(id, x || 0, y || 0, z || 0, w || 1);
    }
    setVelocity(objID: number, x: number, y: number, z: number) {
        this.physicsEngine.setVelocity(objID, x || 0, y || 0, z || 0);
    }
    setAngularVelocity(objID: number, x: number, y: number, z: number) {
        this.physicsEngine.setAngularVelocity(objID, x || 0, y || 0, z || 0);
    }
}
