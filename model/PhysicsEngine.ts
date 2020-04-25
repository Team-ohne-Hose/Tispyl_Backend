import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import {OnDeleteBehaviour, PhysicsObjectState} from "./state/PhysicsState";
import {MapSchema} from "@colyseus/schema";
import destroy = Ammo.destroy;

export interface PhysicsObject {
    physicsBody: Ammo.btRigidBody;
    mass: number;
    collided: boolean;
    objectIdTHREE: number;
    onDelete: ((obj: PhysicsObject) => boolean);
}

export enum CollisionGroups {
    All = 15,
    Other = 1,
    Plane = 2,
    Figures = 4,
    Dice = 8
}

export enum FLAGS {
    CF_KINEMATIC_OBJECT = 2
}

export enum STATE {
    DISABLE_DEACTIVATION = 4
}

export interface RigidBodyParams {
    shape: Ammo.btCollisionShape;
    posX: number;
    posY: number;
    posZ: number;
    quatX: number;
    quatY: number;
    quatZ: number;
    quatW: number;
    colGroup: CollisionGroups;
    colMask: CollisionGroups;
}

export class PhysicsEngine {
    constructor(objects: MapSchema<PhysicsObjectState>) {
        this.networkObjects = objects;
        this.init();
    }

    private clock: THREE.Clock;
    private tmpVec3: Ammo.btVector3;
    private tmpTrans: Ammo.btTransform;
    private tmpQuat: Ammo.btQuaternion;
    private physicsObjects = new Map<number, PhysicsObject>();
    private networkObjects: MapSchema<PhysicsObjectState>
    private physicsLoop: NodeJS.Timeout;
    physicsWorld: Ammo.btDiscreteDynamicsWorld;
    margin = 0.05;
    deletionPlane = -15;
    disposeFromViewport: (obj: PhysicsObject) => boolean;

    disposeInfo = {solver: undefined, broadphase: undefined, dispatcher: undefined, collision: undefined};

    init() {
        Ammo(Ammo).then(() => {
            this.tmpTrans = new Ammo.btTransform();
            this.tmpVec3 = new Ammo.btVector3();
            this.tmpQuat = new Ammo.btQuaternion(0, 0, 0, 1);
            this.setupPhysicsWorld();
        });
    }

    setupPhysicsWorld() {
        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const overlappingPairCache = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.disposeInfo = {solver: solver,
            broadphase: overlappingPairCache,
            dispatcher: dispatcher,
            collision: collisionConfiguration}

        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0, -100, 0));
        // this.addTestPlane();
        // this.addTestBall();
        this.addGameBoard();
        console.log('rendering started');
        this.clock = new THREE.Clock();
        this.physicsLoop = setInterval(this.updatePhysics.bind(this), 25);
    }

    addGameBoard() {
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( 0, -.1, 0 ) );
        transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 50, .5,50) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( 0, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );
        body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);


        this.physicsWorld.addRigidBody( body );
    }

    addTestBall() {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( 10, 30,10 ) );
        transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btSphereShape( 1 );
        colShape.setMargin( 0.05 );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( 1, motionState, colShape);
        let body = new Ammo.btRigidBody( rbInfo );


        this.physicsWorld.addRigidBody( body );
        this.physicsObjects.set(-1, {
            collided: false, mass: 1, objectIdTHREE: -1, onDelete(obj: PhysicsObject): boolean {
                return false;
            }, physicsBody: body
        });
    }

    addTestPlane() {
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( -10, 4, -10 ) );
        transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 40, 1,40 ) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( 0, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );


        this.physicsWorld.addRigidBody( body );
    }


    getPhysicsObjectByID(id: number): PhysicsObject {
        return this.physicsObjects.get(id);
    }

    updatePhysics() {
        const deltaTime = this.clock.getDelta();
        this.physicsWorld.stepSimulation(deltaTime, 10);
        this.physicsObjects.forEach((phys: PhysicsObject, key: number) => {
            if (phys !== undefined) {
                const ms: Ammo.btMotionState = phys.physicsBody.getMotionState();
                if (ms) {
                    ms.getWorldTransform(this.tmpTrans);
                    const p = this.tmpTrans.getOrigin();
                    const q = this.tmpTrans.getRotation();
                    // console.log(phys.objectIdTHREE, p.x(), p.y(), p.z());
                    if (p.y() < this.deletionPlane) {
                        if (!phys.onDelete || !phys.onDelete.bind(this)(phys)) {
                            this.physicsObjects.delete(key);
                            if (this.disposeFromViewport) {
                                this.disposeFromViewport(phys);
                            }
                        }
                    } else { //  if (key >= 0)
                        this.networkObjects[key].position.set(p.x(), p.y(), p.z());
                        this.networkObjects[key].quaternion.set(q.x(), q.y(), q.z(), q.w());
                        // console.log('rot: ', key, q.x(), q.y(), q.z(), q.w());
                    }
                }
            }
        });
    }

    listObjects(): string {
        let ret = '';
        this.physicsObjects.forEach((val: PhysicsObject, key: number) => {
            console.log('PhysicsObject ' + key);
            ret = ret + ', ' + key;
        });
        return ret;
        console.log('Objects are: ', this.physicsObjects)
    }

    setKinematic(objID: number, kinematic: boolean) {
        if (kinematic) {
            // this.getPhysicsObjectByID(objID).physicsBody.setActivationState( STATE.DISABLE_DEACTIVATION );
            this.getPhysicsObjectByID(objID).physicsBody.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);
        } else {
            // this.getPhysicsObjectByID(objID).physicsBody.setActivationState(0);
            this.getPhysicsObjectByID(objID).physicsBody.setCollisionFlags(0);
        }
    }

    setPosition(objID: number, x: number, y: number, z: number) {
        const pBody = this.getPhysicsObjectByID(objID).physicsBody;
        const ms = pBody.getMotionState();
        if (ms) {
            this.tmpVec3.setValue(x, y, z);
            ms.getWorldTransform(this.tmpTrans);
            this.tmpQuat = this.tmpTrans.getRotation();
            this.tmpTrans.setIdentity();
            this.tmpTrans.setOrigin(this.tmpVec3);
            this.tmpTrans.setRotation(this.tmpQuat);
            ms.setWorldTransform(this.tmpTrans);
            pBody.setWorldTransform(this.tmpTrans);
        }
    }

    setRotation(objID: number, x: number, y: number, z: number) {
        const ms = this.getPhysicsObjectByID(objID).physicsBody.getMotionState();
        if (ms) {
            this.tmpQuat.setEulerZYX(z, y, x);
            this.tmpTrans.setIdentity();
            this.tmpTrans.setRotation(this.tmpQuat);
            ms.setWorldTransform(this.tmpTrans);
        }
    }

    setRotationQuat(objID: number, x: number, y: number, z: number, w: number) {
        console.log('setting rotation of', objID);
        const pBody = this.getPhysicsObjectByID(objID).physicsBody;
        const ms = pBody.getMotionState();
        if (ms) {
            this.tmpQuat.setValue(x, y, z, w);
            ms.getWorldTransform(this.tmpTrans);
            this.tmpVec3 = this.tmpTrans.getOrigin();
            this.tmpTrans.setIdentity();
            // this.tmpTrans.setOrigin(this.tmpVec3);
            this.tmpTrans.setRotation(this.tmpQuat);
            ms.setWorldTransform(this.tmpTrans);
            // pBody.setWorldTransform(this.tmpTrans);
        }
    }

    setVelocity(objID: number, x: number, y: number, z: number) {
        this.getPhysicsObjectByID(objID).physicsBody.setLinearVelocity(new Ammo.btVector3(x, y, z));
    }
    setAngularVelocity(objID: number, x: number, y: number, z: number) {
        this.getPhysicsObjectByID(objID).physicsBody.setAngularVelocity(new Ammo.btVector3(x, y, z));
    }

    private createRigidBody(objectID: number, params: RigidBodyParams) {
        const phys = this.getPhysicsObjectByID(objectID);
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(params.posX, params.posY, params.posZ));
        transform.setRotation(new Ammo.btQuaternion(params.quatX, params.quatY, params.quatZ, params.quatW));
        const motionState = new Ammo.btDefaultMotionState(transform);


        // let colShape = new Ammo.btSphereShape( 1 );
        // colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        params.shape.calculateLocalInertia( phys.mass, localInertia );

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(phys.mass, motionState, params.shape, localInertia); //  colShape); //
        const body = new Ammo.btRigidBody(rbInfo);

        body.setFriction(0.5);

        phys.physicsBody = body;
        phys.collided = false;
        if (phys.mass > 0) {
            // Disable deactivation
            body.setActivationState(STATE.DISABLE_DEACTIVATION);
            console.log('obj with positive mass', objectID);
        }
        this.physicsWorld.addRigidBody(body, params.colGroup, params.colMask);
        return body;
    }

    private createConvexHullPhysicsShape(points: ArrayLike<number>) {
        points = Array.from(points);
        const shape = new Ammo.btConvexHullShape();
        for (let i = 0, il = points.length; i < il; i += 3) {
            this.tmpVec3.setValue(points[i], points[i + 1], points[i + 2]);
            const lastOne = (i >= (il - 3));
            shape.addPoint(this.tmpVec3, lastOne);
        }
        return shape;
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
        this.setPosition(obj.objectIdTHREE, 0, 15, 0);
        obj.physicsBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
        return true;
    }

    addShape(geo: ArrayLike<number>, object: PhysicsObjectState, mass: number, colGroup: CollisionGroups, colMask: CollisionGroups, onDelete?: OnDeleteBehaviour) {
        const objectID = object.objectIDPhysics;
        this.physicsObjects.set(objectID, {
            collided: false,
            mass: mass,
            objectIdTHREE: objectID,
            physicsBody: undefined,
            onDelete: this.getOnDelete(onDelete) || this.defaultOnDelete
        });
        const shape = this.createConvexHullPhysicsShape(geo);
        shape.setMargin(this.margin);
        const rigidBodyParams: RigidBodyParams = {
            posX: object.position.x,
            posY: object.position.y,
            posZ: object.position.z,
            quatX: object.quaternion.x,
            quatY: object.quaternion.y,
            quatZ: object.quaternion.z,
            quatW: object.quaternion.w,
            shape: shape,
            colGroup: colGroup || CollisionGroups.Other,
            colMask: colMask || CollisionGroups.All
        };
        console.log('Shape Mass: ', objectID, mass, rigidBodyParams.colGroup, rigidBodyParams.colMask, rigidBodyParams.quatX, rigidBodyParams.quatY, rigidBodyParams.quatZ, rigidBodyParams.quatW);
        const body = this.createRigidBody(objectID, rigidBodyParams);
    }

    destructEngine(){
        clearInterval(this.physicsLoop);

        Ammo.destroy(this.tmpTrans);
        Ammo.destroy(this.tmpVec3);
        Ammo.destroy(this.tmpQuat);
        Ammo.destroy(this.disposeInfo.broadphase);
        Ammo.destroy(this.disposeInfo.collision);
        Ammo.destroy(this.disposeInfo.dispatcher);
        Ammo.destroy(this.disposeInfo.solver);
        Ammo.destroy(this.physicsWorld);
        Ammo.destroy(Ammo);
    }
}
