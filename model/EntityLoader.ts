import {PhysicsEntity, PhysicsEntityVariation} from "./WsData";
import {PhysicsEngine} from "./PhysicsEngineCannon";
import {PhysicsObjectState} from "./state/PhysicsState";
import * as THREE from 'three';
import {AnimationClip, BufferGeometry, Camera, Group} from 'three';
import {GLTFLoader} from "./gltfLoaderLocal/GLTFLoaderLocal.js";
import {BufferGeometryUtils} from "./BufferGeometryUtils.js";
import CANNON from "cannon";


interface GLTF {
    animations: AnimationClip[];
    scene: Group;
    scenes: Group[];
    cameras: Camera[];
    asset: {
        copyright?: string;
        generator?: string;
        version?: string;
        minVersion?: string;
        extensions?: any;
        extras?: any;
    };
    parser: any;
    userData: any;
}
interface GeometryList {
    diceDefault: {shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[];
    figureDefault: {shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[];
}
export class EntityLoader {

    private readonly constantProperties = {
        dice: {
            default: {
                mass: 0.01,
                behavior: 0,
                fname: 'diceDefault.gltf'
            }
        },
        figure: {
            default: {
                mass: 0.008,
                behavior: 0,
                fname: 'figureDefaultNoTex.gltf'
            }
        }
    }
    private readonly resourcePath = __dirname + '/../resources/models/';
    private static geometries: GeometryList = {
        diceDefault: undefined,
        figureDefault: undefined
    }
    fs = require('fs');


    constructor() {
    }

    private isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
        if (obj !== undefined) {
            const m = obj as THREE.Mesh;
            return (m !== undefined && m.geometry !== undefined && m.type === 'Mesh');
        }
        return false;
    }
    private mergeChildrenGeo(parent: THREE.Object3D): THREE.BufferGeometry {
        if (parent === undefined) {
            // console.log('undefined');
            return undefined;
        } else if (this.isMesh(parent)) {
            // console.log('Mesh: ', parent.name);
            const geo = parent.geometry.clone();
            const buffGeo = geo instanceof THREE.BufferGeometry ? geo : new THREE.BufferGeometry().fromGeometry(geo);
            buffGeo.scale(parent.scale.x, parent.scale.y, parent.scale.z);
            return buffGeo;
        } else {
            // console.log('other: ', parent.name, parent.type);
            const bufferGeos: BufferGeometry[] = [];
            parent.children.forEach((val: THREE.Object3D, i: number) => {
                const childGeo: BufferGeometry = this.mergeChildrenGeo(val);
                if (childGeo !== undefined) {
                    bufferGeos.push(childGeo);
                }
            });
            // console.log('Merge ' + bufferGeos.length + ' Geos');
            if (bufferGeos === undefined) {
                return undefined;
            } else if (bufferGeos.length <= 1) {
                return bufferGeos[0];
            } else {
                const resultGeo: THREE.BufferGeometry = BufferGeometryUtils.mergeBufferGeometries(bufferGeos);
                resultGeo.scale(parent.scale.x, parent.scale.y, parent.scale.z);
                return resultGeo;
            }
        }
        return undefined;
    }

    private createConvexPolyhedron(geometry: THREE.Geometry | THREE.BufferGeometry): CANNON.ConvexPolyhedron {
        if (!(geometry as THREE.Geometry).vertices) {
            geometry = new THREE.Geometry().fromBufferGeometry(
              geometry as THREE.BufferGeometry
            );
            geometry.mergeVertices();
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
        }
        const points: CANNON.Vec3[] = (<THREE.Geometry>geometry).vertices.map(
          function(v) {
              return new CANNON.Vec3(v.x, v.y, v.z);
          }
        );
        const faces: number[][] = (<THREE.Geometry>geometry).faces.map(function(f) {
            return [f.a, f.b, f.c];
        });

        // typedefinition of CANNON is wrong! faces has to be of type number[][].
        // To stop Typescript complaining, cast to any
        return new CANNON.ConvexPolyhedron(points, faces as any);
    }

    private async loadModel(fName: string): Promise<CANNON.ConvexPolyhedron> {
        console.log(`Loading new model: ${fName}`);
        const loader = new GLTFLoader(); //.setPath(this.resourcePath);
        const path = this.resourcePath + fName;

        const scene: THREE.Group = await new Promise((resolve, reject) => {
            var data = this.fs.readFileSync(this.resourcePath + fName);
            loader.parse(data, fName, (gltf: GLTF) => {
                console.log(`Finished loading: ${fName}`); // gltf.scene);
                resolve(gltf.scene);
            }, (e) => {
                console.error('Error', e);
                reject();
            });
        });
        // console.log('scenechildren are:', scene.children);

        const buffGeo: BufferGeometry = this.mergeChildrenGeo(scene);
        return this.createConvexPolyhedron(buffGeo);
    }
    private async loadGeometry(entity: PhysicsEntity, variant: PhysicsEntityVariation): Promise<{shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[]> {
        switch (entity) {
            case PhysicsEntity.dice:
                switch (variant) {
                    case PhysicsEntityVariation.default:
                        if (EntityLoader.geometries.diceDefault === undefined) {
                            const geoList: {shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[] = [];
                            geoList.push({shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.01, 0.01)),
                                offset: new CANNON.Vec3(0, 0, 0),
                                orientation: new CANNON.Quaternion(0, 0, 0, 1)});
                            EntityLoader.geometries.diceDefault = geoList;
                        }
                        return EntityLoader.geometries.diceDefault;
                        break;
                }
                break;
            case PhysicsEntity.figure:
                switch (variant) {
                    case PhysicsEntityVariation.default:
                        if (EntityLoader.geometries.figureDefault === undefined) {
                            const geoList: {shape: CANNON.Shape, offset: CANNON.Vec3, orientation: CANNON.Quaternion}[] = [];
                            const cylinderShape = new CANNON.Cylinder(PhysicsEngine.rescaleUnit(1.9), PhysicsEngine.rescaleUnit(2.16), PhysicsEngine.rescaleUnit(0.64), 14);
                            var q = new CANNON.Quaternion();
                            q.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI / 2);
                            // casting to any because CANNON typedef is missing the function
                            (cylinderShape as any).transformAllPoints(new CANNON.Vec3(), q);
                            geoList.push({shape: cylinderShape,
                                offset: new CANNON.Vec3(0, 0, 0),
                                orientation: new CANNON.Quaternion(0, 0, 0, 1)})
                            EntityLoader.geometries.figureDefault = geoList;
                        }
                        return EntityLoader.geometries.figureDefault;
                        break;
                }
                break;
        }
        console.error('could not load geometry for', entity, variant);
        return undefined;
    }

    async load(engine: PhysicsEngine, object: PhysicsObjectState, entity: PhysicsEntity, variation?: PhysicsEntityVariation): Promise<void> {
        switch (entity) {
            case PhysicsEntity.figure:
                await this.loadFigure(engine, object, variation);
                break;
            case PhysicsEntity.dice:
                await this.loadDice(engine, object, variation);
                break;
        }
        return;
    }
    async loadDice(engine: PhysicsEngine, object: PhysicsObjectState, variation?: PhysicsEntityVariation): Promise<void> {
        variation = variation || PhysicsEntityVariation.default;
        switch (variation) {
            case PhysicsEntityVariation.default:
                await this.loadDiceDefault(engine, object);
                break;
        }
        return;
    }
    private async loadDiceDefault(engine: PhysicsEngine, object: PhysicsObjectState): Promise<void> {
        engine.addShape(await this.loadGeometry(PhysicsEntity.dice, PhysicsEntityVariation.default),
            object,
            this.constantProperties.dice.default.mass,
            this.constantProperties.dice.default.behavior);
        return;
        return;
    }
    async loadFigure(engine: PhysicsEngine, object: PhysicsObjectState, color?: number, variation?: PhysicsEntityVariation): Promise<void> {
        variation = variation || PhysicsEntityVariation.default;
        switch (variation) {
            case PhysicsEntityVariation.default:
                await this.loadFigureDefault(engine, object, color);
                break;
        }
    }
    private async loadFigureDefault(engine: PhysicsEngine, object: PhysicsObjectState, color?: number): Promise<void> {
        engine.addShape(await this.loadGeometry(PhysicsEntity.figure, PhysicsEntityVariation.default),
            object,
            this.constantProperties.figure.default.mass,
            this.constantProperties.figure.default.behavior);
        return;
    }

    async loadOther(engine: PhysicsEngine, object: PhysicsObjectState, color?: number, variation?: PhysicsEntityVariation): Promise<void> {
        variation = variation || PhysicsEntityVariation.default;
        switch (variation) {
            case PhysicsEntityVariation.default:
                await this.loadOtherDefault(engine, object, color);
                break;
        }
        return;
    }
    private async loadOtherDefault(engine: PhysicsEngine, object: PhysicsObjectState, color?: number) {
        engine.addShape(await this.loadGeometry(PhysicsEntity.figure, PhysicsEntityVariation.default),
            object,
            this.constantProperties.figure.default.mass,
            this.constantProperties.figure.default.behavior);
        return;
    }
}
