import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import {OnDeleteBehaviour, PhysicsObjectState} from "./state/PhysicsState";
import {MapSchema} from "@colyseus/schema";

export interface PhysicsObject {
    physicsBody: Ammo.btRigidBody;
    mass: number;
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
    private ammoInitialized = false;

    init() {
        if (this.ammoInitialized) {
            this.tmpTrans = new Ammo.btTransform();
            this.tmpVec3 = new Ammo.btVector3();
            this.tmpQuat = new Ammo.btQuaternion(0, 0, 0, 1);
            this.setupPhysicsWorld();
        } else {
            Ammo(Ammo).then(() => {
                this.ammoInitialized = true;
                this.tmpTrans = new Ammo.btTransform();
                this.tmpVec3 = new Ammo.btVector3();
                this.tmpQuat = new Ammo.btQuaternion(0, 0, 0, 1);
                this.setupPhysicsWorld();
            });
        }
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
        this.physicsLoop = global.setInterval(this.updatePhysics.bind(this), 25);
    }

    addGameBoardBoundarys() {
        const borderCoords = {
            x: [-35, -25, -15, -5, 5, 15, 25, 35, 45],
            y: [-40, -30, -20, -10, 0, 10, 20, 30, 40]
        };
        const addGameBoardBoundary = (origin: Ammo.btVector3, size: Ammo.btVector3) => {
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin( origin );
            transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
            let motionState = new Ammo.btDefaultMotionState( transform );

            let colShape = new Ammo.btBoxShape( size );
            colShape.setMargin( 0.05 );

            let localInertia = new Ammo.btVector3( 0, 0, 0 );
            colShape.calculateLocalInertia( 0, localInertia );

            let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
            let body = new Ammo.btRigidBody( rbInfo );
            body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);

            this.physicsWorld.addRigidBody( body );
        }
        const landscapeBoundary = (x1: number, x2: number, y: number) => {
            const len = borderCoords.x[x2] - borderCoords.x[x1];
            const vec = new Ammo.btVector3((borderCoords.x[x2] + borderCoords.x[x1]) / 2, 0.5, borderCoords.y[y]);
            addGameBoardBoundary(vec, new Ammo.btVector3(len / 2 + .15, .35, .15));
        };
        const portraitBoundary = (x: number, y1: number, y2: number) => {
            const len = borderCoords.y[y2] - borderCoords.y[y1];
            const vec = new Ammo.btVector3(borderCoords.x[x], 0.5, (borderCoords.y[y2] + borderCoords.y[y1]) / 2);
            addGameBoardBoundary(vec, new Ammo.btVector3(.15, .35, len / 2 + .15));
        };
        landscapeBoundary(1, 8, 1);
        portraitBoundary(1, 1, 7);
        landscapeBoundary(1, 7, 7);
        portraitBoundary(7, 2, 7);
        landscapeBoundary(2, 7, 2);
        portraitBoundary(2, 2, 6);
        landscapeBoundary(2, 6, 6);
        portraitBoundary(6, 3, 6);
        landscapeBoundary(3, 6, 3);
        portraitBoundary(3, 3, 5);
        landscapeBoundary(3, 5, 5);
        portraitBoundary(5, 4, 5);
        landscapeBoundary(4, 5, 4);
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

        this.addGameBoardBoundarys();
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
        // body.setFriction(friction);
        // body.setRestitution(.9);
        // body.setDamping(0.2, 0.2);


        this.physicsWorld.addRigidBody( body );
        this.physicsObjects.set(-1, {
            mass: 1, objectIdTHREE: -1, onDelete(obj: PhysicsObject): boolean {
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


    removePhysicsObjectByID(id: number): void {
        this.physicsObjects.delete(id);
        //this.physicsObjects.set(id, undefined);
    }
    addPhysicsObject(obj: PhysicsObject): void {
        this.physicsObjects.set(obj.objectIdTHREE, obj);
    }
    getPhysicsObjectByID(id: number): PhysicsObject {
        return this.physicsObjects.get(id);
    }

    updateNetworkObject(key: String, position: Ammo.btVector3, rotation: Ammo.btQuaternion) {
        this.networkObjects.get(key.toString()).position.set(position.x(), position.y(), position.z());
        this.networkObjects.get(key.toString()).quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
    checkDeletionPlane(object: PhysicsObject, objectKey: number, position: Ammo.btVector3) {
        if (position.y() < this.deletionPlane) {
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
    updatePhysicsObject(phys: PhysicsObject, key: number) {
        if (phys === undefined) return;
        const ms: Ammo.btMotionState = phys.physicsBody.getMotionState();
        if (ms === undefined) return;

        ms.getWorldTransform(this.tmpTrans);
        const p = this.tmpTrans.getOrigin();
        const q = this.tmpTrans.getRotation();

        if (!this.checkDeletionPlane(phys, key, p)) {
            this.updateNetworkObject(key.toString(), p, q);
        }
    }
    updatePhysics() {
        const deltaTime = this.clock.getDelta();
        this.physicsWorld.stepSimulation(deltaTime, 10);
        this.physicsObjects.forEach(this.updatePhysicsObject.bind(this));
        this.networkObjects.triggerAll();
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
            this.getPhysicsObjectByID(objID).physicsBody.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);
        } else {
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
            this.tmpTrans.setRotation(this.tmpQuat);
            ms.setWorldTransform(this.tmpTrans);
        }
    }

    setVelocity(objID: number, x: number, y: number, z: number) {
        this.getPhysicsObjectByID(objID).physicsBody.setLinearVelocity(new Ammo.btVector3(x, y, z));
    }
    setAngularVelocity(objID: number, x: number, y: number, z: number) {
        this.getPhysicsObjectByID(objID).physicsBody.setAngularVelocity(new Ammo.btVector3(x, y, z));
    }

    createTransform(params: RigidBodyParams): Ammo.btTransform {
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(params.posX, params.posY, params.posZ));
        transform.setRotation(new Ammo.btQuaternion(params.quatX, params.quatY, params.quatZ, params.quatW));
        return transform;
    }
    private createRigidBody(objectID: number, params: RigidBodyParams) {
        const phys = this.getPhysicsObjectByID(objectID);
        const transform = this.createTransform(params);
        const motionState = new Ammo.btDefaultMotionState(transform);

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        params.shape.calculateLocalInertia( phys.mass, localInertia );

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(phys.mass, motionState, params.shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        body.setFriction(0.5);

        phys.physicsBody = body;
        if (phys.mass > 0) {
            // Disable deactivation
            body.setActivationState(STATE.DISABLE_DEACTIVATION);
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
        // console.log('Shape Mass: ', objectID, mass, rigidBodyParams.colGroup, rigidBodyParams.colMask, rigidBodyParams.quatX, rigidBodyParams.quatY, rigidBodyParams.quatZ, rigidBodyParams.quatW);
        const body = this.createRigidBody(objectID, rigidBodyParams);
    }

    destructEngine(){
        global.clearInterval(this.physicsLoop);

        // Ammo.destroy(this.physicsWorld);
        // Ammo.destroy(this.disposeInfo.solver);
        // Ammo.destroy(this.disposeInfo.broadphase);
        // Ammo.destroy(this.disposeInfo.dispatcher);
        // Ammo.destroy(this.disposeInfo.collision);
        Ammo.destroy(this.tmpQuat);
        Ammo.destroy(this.tmpVec3);
        Ammo.destroy(this.tmpTrans);
    }
}
