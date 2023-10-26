/* eslint-disable */

import { PhysicsEntity, PhysicsEntityVariation } from './WsData';
import { PhysicsEngine } from './PhysicsEngineCannon';
import { PhysicsObjectState } from './state/PhysicsState';
import CANNON from 'cannon';
interface GeometryList {
  diceDefault: {
    shape: CANNON.Shape;
    offset: CANNON.Vec3;
    orientation: CANNON.Quaternion;
  }[];
  figureDefault: {
    shape: CANNON.Shape;
    offset: CANNON.Vec3;
    orientation: CANNON.Quaternion;
  }[];
}
export class EntityLoader {
  private readonly constantProperties = {
    dice: {
      default: {
        mass: 0.01,
        behavior: 0,
        fname: 'diceDefault.gltf',
      },
    },
    figure: {
      default: {
        mass: 0.008,
        behavior: 0,
        fname: 'figureDefaultNoTex.gltf',
      },
    },
  };

  private readonly resourcePath = __dirname + '/../resources/models/';
  private static geometries: GeometryList = {
    diceDefault: undefined,
    figureDefault: undefined,
  };

  fs = require('fs');

  private async loadGeometry(
    entity: PhysicsEntity,
    variant: PhysicsEntityVariation
  ): Promise<
    {
      shape: CANNON.Shape;
      offset: CANNON.Vec3;
      orientation: CANNON.Quaternion;
    }[]
  > {
    switch (entity) {
      case PhysicsEntity.dice:
        switch (variant) {
          case PhysicsEntityVariation.default:
            if (EntityLoader.geometries.diceDefault === undefined) {
              const geoList: {
                shape: CANNON.Shape;
                offset: CANNON.Vec3;
                orientation: CANNON.Quaternion;
              }[] = [];
              geoList.push({
                shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.01, 0.01)),
                offset: new CANNON.Vec3(0, 0, 0),
                orientation: new CANNON.Quaternion(0, 0, 0, 1),
              });
              EntityLoader.geometries.diceDefault = geoList;
            }
            return EntityLoader.geometries.diceDefault;
        }
        break;
      case PhysicsEntity.figure:
        switch (variant) {
          case PhysicsEntityVariation.default:
            if (EntityLoader.geometries.figureDefault === undefined) {
              const geoList: {
                shape: CANNON.Shape;
                offset: CANNON.Vec3;
                orientation: CANNON.Quaternion;
              }[] = [];
              const cylinderShape = new CANNON.Cylinder(
                PhysicsEngine.rescaleUnit(1.9),
                PhysicsEngine.rescaleUnit(2.16),
                PhysicsEngine.rescaleUnit(0.64),
                14
              );
              const q = new CANNON.Quaternion();
              q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
              // casting to any because CANNON typedef is missing the function
              (cylinderShape as any).transformAllPoints(new CANNON.Vec3(), q);
              geoList.push({
                shape: cylinderShape,
                offset: new CANNON.Vec3(0, 0, 0),
                orientation: new CANNON.Quaternion(0, 0, 0, 1),
              });
              EntityLoader.geometries.figureDefault = geoList;
            }
            return EntityLoader.geometries.figureDefault;
        }
        break;
    }
    console.error('could not load geometry for', entity, variant);
    return undefined;
  }

  async load(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    entity: PhysicsEntity,
    variation?: PhysicsEntityVariation
  ): Promise<void> {
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

  async loadDice(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    variation?: PhysicsEntityVariation
  ): Promise<void> {
    variation = variation || PhysicsEntityVariation.default;
    switch (variation) {
      case PhysicsEntityVariation.default:
        await this.loadDiceDefault(engine, object);
        break;
    }
    return;
  }

  private async loadDiceDefault(
    engine: PhysicsEngine,
    object: PhysicsObjectState
  ): Promise<void> {
    engine.addShape(
      await this.loadGeometry(
        PhysicsEntity.dice,
        PhysicsEntityVariation.default
      ),
      object,
      this.constantProperties.dice.default.mass,
      this.constantProperties.dice.default.behavior
    );
    return;
  }

  async loadFigure(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    color?: number,
    variation?: PhysicsEntityVariation
  ): Promise<void> {
    variation = variation || PhysicsEntityVariation.default;
    switch (variation) {
      case PhysicsEntityVariation.default:
        await this.loadFigureDefault(engine, object, color);
        break;
    }
  }

  private async loadFigureDefault(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    color?: number
  ): Promise<void> {
    engine.addShape(
      await this.loadGeometry(
        PhysicsEntity.figure,
        PhysicsEntityVariation.default
      ),
      object,
      this.constantProperties.figure.default.mass,
      this.constantProperties.figure.default.behavior
    );
    return;
  }

  async loadOther(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    color?: number,
    variation?: PhysicsEntityVariation
  ): Promise<void> {
    variation = variation || PhysicsEntityVariation.default;
    switch (variation) {
      case PhysicsEntityVariation.default:
        await this.loadOtherDefault(engine, object, color);
        break;
    }
    return;
  }

  private async loadOtherDefault(
    engine: PhysicsEngine,
    object: PhysicsObjectState,
    color?: number
  ): Promise<void> {
    engine.addShape(
      await this.loadGeometry(
        PhysicsEntity.figure,
        PhysicsEntityVariation.default
      ),
      object,
      this.constantProperties.figure.default.mass,
      this.constantProperties.figure.default.behavior
    );
    return;
  }
}
