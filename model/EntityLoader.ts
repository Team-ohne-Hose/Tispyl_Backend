import {PhysicsCommandAddEntity, PhysicsEntity, PhysicsEntityVariation} from "./WsData";
import {CollisionGroups, PhysicsEngine, PhysicsObject} from "./PhysicsEngine";
import {PhysicsObjectState} from "./state/PhysicsState";
import * as THREE from 'three';
import {AnimationClip, BufferGeometry, Camera, Group} from 'three';
import {GLTFLoader} from "./gltfLoaderLocal/GLTFLoaderLocal.js";
import {BufferGeometryUtils} from "./BufferGeometryUtils.js";


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
    diceDefault: number[];
    figureDefault: number[];
}
export class EntityLoader {

    private readonly constantProperties = {
        dice: {
            default: {
                mass: 1,
                colGroup: CollisionGroups.Dice,
                colMask: CollisionGroups.All,
                behavior: 0,
                fname: 'diceDefault.gltf'
            }
        },
        figure: {
            default: {
                mass: 1,
                colGroup: CollisionGroups.Figures,
                colMask: CollisionGroups.All,
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
        this.init();
    }
    async init() {
        // console.log('Loaded: ', await this.loadModel('diceDefault.gltf'));
        // console.log('Loaded: ', await this.loadGeometry(PhysicsEntity.dice, PhysicsEntityVariation.default));
        console.log('Loaded: ', await this.loadGeometry(PhysicsEntity.figure, PhysicsEntityVariation.default));
        // console.log('done');
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

    private async loadModel(fName: string): Promise<number[]> {
        console.log('loading new model: ', fName);
        const loader = new GLTFLoader(); //.setPath(this.resourcePath);
        const path = this.resourcePath + fName;

        const scene: THREE.Group = await new Promise((resolve, reject) => {
            var data = this.fs.readFileSync(this.resourcePath + fName);
            loader.parse(data, fName, (gltf: GLTF) => {
                console.log('loaded: ', fName); // gltf.scene);
                resolve(gltf.scene);
            }, (e) => {
                console.log('Error', e);
                reject();
            });
        });
        // console.log('scenechildren are:', scene.children);

        const buffGeo: BufferGeometry = this.mergeChildrenGeo(scene);
        return Array.from(buffGeo.getAttribute('position').array);
    }
    private async loadGeometry(entity: PhysicsEntity, variant: PhysicsEntityVariation): Promise<number[]> {
        switch (entity) {
            case PhysicsEntity.dice:
                switch (variant) {
                    case PhysicsEntityVariation.default:
                        if (EntityLoader.geometries.diceDefault === undefined) {
                            EntityLoader.geometries.diceDefault = await this.loadModel(this.constantProperties.dice.default.fname);
                        }
                        return EntityLoader.geometries.diceDefault;
                        break;
                }
                break;
            case PhysicsEntity.figure:
                switch (variant) {
                    case PhysicsEntityVariation.default:
                        if (EntityLoader.geometries.figureDefault === undefined) {
                            EntityLoader.geometries.figureDefault = await this.loadModel(this.constantProperties.figure.default.fname);
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
            this.constantProperties.dice.default.colGroup,
            this.constantProperties.dice.default.colMask,
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
            this.constantProperties.figure.default.colGroup,
            this.constantProperties.figure.default.colMask,
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
            this.constantProperties.figure.default.colGroup,
            this.constantProperties.figure.default.colMask,
            this.constantProperties.figure.default.behavior);
        return;
    }
}
