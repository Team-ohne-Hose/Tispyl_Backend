import {MapSchema, Schema, type} from "@colyseus/schema";
import {PhysicsEngine, PhysicsObject} from "../PhysicsEngineCannon";
import {
    GameActionType,
    GameDiceRoll,
    MessageType,
    PhysicsCommand,
    PhysicsCommandType,
    PhysicsEntity,
    PhysicsEntityVariation,
    WsData
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
    @type("boolean")
    disabled = false;

    private physicsBuffer: PhysicsObject;
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

    setDisabled(disable: boolean) {
        if (disable !== this.disabled) {
            if (disable) {
                this.physicsBuffer = this.physicsEngine.getPhysicsObjectByID(this.objectIDPhysics);
                this.physicsEngine.world.remove(this.physicsBuffer.physicsBody);
                this.physicsEngine.removePhysicsObjectByID(this.objectIDPhysics);
            } else if (this.physicsBuffer !== undefined) {
                this.physicsEngine.addCannonObject(this.physicsBuffer.physicsBody);
                this.physicsEngine.addPhysicsObject(this.physicsBuffer);
            }
            this.disabled = disable;
        }
    }

}
export class PhysicsState extends Schema {
    @type({ map: PhysicsObjectState})
    objects = new MapSchema<PhysicsObjectState>();

    private diceObj: PhysicsObjectState;
    private diceNoMotion = true;
    private updateDiceLoop: NodeJS.Timeout;
    private readonly sqrtHalf = Math.sqrt(.5);

    private readonly physicsEngine: PhysicsEngine;
    private idCounter = 1;
    private loader: EntityLoader;
    private readonly startPoint = {x: 38.708, y: 10, z: -36.776};
    private broadcastNewMessage: (type: MessageType, cmd: WsData) => void;
    private onDiceThrow: (number: number) => void;

    constructor() {
        super();
        this.physicsEngine = new PhysicsEngine(this.objects);
        this.loader = new EntityLoader();
        this.updateDiceLoop = global.setInterval(this.updateDice.bind(this), 500);
    }

    setBroadcastCallback(broadcastCallback: ((type: MessageType, cmd: WsData) => void)) {
        this.broadcastNewMessage = broadcastCallback;
    }
    setOnDiceThrow(diceCallback: ((num: number) => void)) {
        this.onDiceThrow = diceCallback;
    }
    private getNewId(): number {
        this.idCounter++;
        console.log(`Gave out new physcics ID: ${this.idCounter}`);
        return this.idCounter;
    }
    // Deprecated
    listPhysicsItems(): string {
        return "";
        //deprecated return this.physicsEngine.listObjects();
    }
    handlePhysicsCommand(cmd: PhysicsCommand) {
        // console.log('PCMD: ', cmd.subType, cmd['objectID']);
        //console.log(`physics objects ${JSON.stringify(this.objects)}`);
        switch (cmd.subType) {
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
            case PhysicsCommandType.wakeAll:
                this.physicsEngine.wakeAll();
                break;
            default:
                console.error('PhysicsCommand not recognised', cmd);
                break;
        }
    }
    addPlayerFigure(): number {
        const id = this.getNewId();
        const pos = new Vector(this.startPoint.x, this.startPoint.y, this.startPoint.z);
        const quat = new Quaternion(0, 0, 0, 1);
        const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat, PhysicsEntity.figure, PhysicsEntityVariation.default);
        this.objects.set(String(id), obj);
        this.loader.load(this.physicsEngine, obj, PhysicsEntity.figure, PhysicsEntityVariation.default);
        return id;
    }
    addDice() {
        const id = this.getNewId();
        const pos = new Vector(0, 10, 0);
        const quat = new Quaternion(0, 0, 0, 1);
        const obj = new PhysicsObjectState(id, this.physicsEngine, pos, quat, PhysicsEntity.dice, PhysicsEntityVariation.default);
        this.objects.set(String(id), obj);
        this.loader.load(this.physicsEngine, obj, PhysicsEntity.dice, PhysicsEntityVariation.default);
        this.diceObj = obj;
    }

    checkDiceMoving(): boolean {
        if (this.diceObj !== undefined) {
            const physObj = this.physicsEngine.getPhysicsObjectByID(this.diceObj.objectIDPhysics);
            // console.log(physObj.physicsBody.getLinearVelocity().length(), physObj.physicsBody.getAngularVelocity().length());
            if (physObj.physicsBody.velocity.norm() < .01 && physObj.physicsBody.angularVelocity.norm() < 1 * Math.PI) {
                if (!this.diceNoMotion) {
                    this.diceNoMotion = true;
                    return false;
                }
            } else if (physObj.physicsBody.velocity.norm() > .1 || physObj.physicsBody.angularVelocity.norm() > 10 * Math.PI) {
                this.diceNoMotion = false;
            }
        }
        return true;
    }
    getDiceNumber(): number {
        const diceOrientationUp = new THREE.Vector3(0, 1, 0).normalize();
        const diceOrientationLeft = new THREE.Vector3(1, 0, 0).normalize();
        const diceOrientationFwd = new THREE.Vector3(0, 0, 1).normalize();
        diceOrientationUp.applyQuaternion(new THREE.Quaternion(
          this.diceObj.quaternion.x,
          this.diceObj.quaternion.y,
          this.diceObj.quaternion.z,
          this.diceObj.quaternion.w));
        diceOrientationLeft.applyQuaternion(new THREE.Quaternion(
          this.diceObj.quaternion.x,
          this.diceObj.quaternion.y,
          this.diceObj.quaternion.z,
          this.diceObj.quaternion.w));
        diceOrientationFwd.applyQuaternion(new THREE.Quaternion(
          this.diceObj.quaternion.x,
          this.diceObj.quaternion.y,
          this.diceObj.quaternion.z,
          this.diceObj.quaternion.w));

        let diceNumber = -1;
        if (diceOrientationUp.y >= this.sqrtHalf) {
            diceNumber = 4;
        } else if (diceOrientationUp.y <= -this.sqrtHalf) {
            diceNumber = 3;
        } else if (diceOrientationLeft.y >= this.sqrtHalf) {
            diceNumber = 5;
        } else if (diceOrientationLeft.y <= -this.sqrtHalf) {
            diceNumber = 2;
        } else if (diceOrientationFwd.y >= this.sqrtHalf) {
            diceNumber = 1;
        } else if (diceOrientationFwd.y <= -this.sqrtHalf) {
            diceNumber = 6;
        }
        return diceNumber;
    }
    updateDice() {
        if (!this.checkDiceMoving()) {
            const num = this.getDiceNumber();
            console.log(`Dice roll resulted in a ${num}`);
            if (this.onDiceThrow !== undefined) {
                this.onDiceThrow(num);
            }
            const msg: GameDiceRoll = {
                type: MessageType.GAME_MESSAGE,
                action: GameActionType.diceRolled,
                roll: num };
            this.broadcastNewMessage(msg.type, msg);
        }
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
        this.physicsEngine.setQuat(id, x || 0, y || 0, z || 0, w || 1);
    }
    setVelocity(objID: number, x: number, y: number, z: number) {
        this.physicsEngine.setVelocity(objID, x || 0, y || 0, z || 0);
    }
    setAngularVelocity(objID: number, x: number, y: number, z: number) {
        this.physicsEngine.setAngularVelocity(objID, x || 0, y || 0, z || 0);
    }

    destructState() {
        global.clearInterval(this.updateDiceLoop);
        this.physicsEngine.destructEngine();
    }
}
