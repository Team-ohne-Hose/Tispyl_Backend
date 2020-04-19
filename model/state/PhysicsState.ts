import {MapSchema, Schema, type} from "@colyseus/schema";
import {CollisionGroups, PhysicsEngine, PhysicsObject} from "../PhysicsEngine";
import Ammo from "ammojs-typed";
import {PhysicsCommand, PhysicsCommandType} from "../WsData";

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
    objectIDTHREE: number;
    @type(Vector)
    position: Vector = new Vector();
    @type(Quaternion)
    quaternion: Quaternion = new Quaternion();
    private physicsEngine: PhysicsEngine;
    constructor(id: number, engine: PhysicsEngine, position?: Vector, quaternion?: Quaternion) {
        super();
        this.objectIDTHREE = id;
        this.physicsEngine = engine;
        this.position = position || new Vector();
        this.quaternion = quaternion || new Quaternion();
    }

}
export class PhysicsState extends Schema {
    @type({ map: PhysicsObjectState})
    objects = new MapSchema<PhysicsObjectState>();

    private readonly physicsEngine: PhysicsEngine;

    constructor() {
        super();
        this.physicsEngine = new PhysicsEngine(this.objects);
    }


    private getOnDelete(type: OnDeleteBehaviour): (obj: PhysicsObject) => boolean {
        // TODO implement
        return undefined;
    }

    // TODO implement rendering
    renderPhysics() {
        this.physicsEngine.updatePhysics()
    }
    handlePhysicsCommand(cmd: PhysicsCommand, raw: any) {
        if (cmd !== undefined && cmd.subType !== undefined) {
            switch (cmd.subType) {
                case PhysicsCommandType.create:
                    const pos = new Vector(cmd.positionX, cmd.positionY, cmd.positionZ);
                    const quat = new Quaternion(cmd.quaternionX, cmd.quaternionY, cmd.quaternionZ, cmd.quaternionW);
                    this.addPhysicsObject(cmd.objectID, pos, quat, cmd.geo, cmd.mass, cmd.colGroup, cmd.colMask, cmd.behavior)
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
            }
        } else {
            console.log('PhysicsCommand not recognised', raw)
        }
    }

    listPhysicsItems(): string {
        return this.physicsEngine.listObjects();
    }

    addPhysicsObject(id: number, pos: Vector, quat: Quaternion, geo: ArrayLike<number>, mass: number, colGroup?: CollisionGroups, colMask?: CollisionGroups, behavior?: OnDeleteBehaviour) {
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
