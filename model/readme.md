# Model
This folder contains code belonging to the model part pf the MVC concept.

## State
These files contain the classes for the colyseus state synchronisation.

## PhysicsEngineCannon
This class is doing the heavy lifting of the backend simulation.
It simulates all physics-objects. Each gameroom gets its own instance of a physics engine.

Instead of THREE or colyseus, which use cm as a unit, the physics works with meters.
Therefore, length units have to be converted.

### References to a object in the different scopes
The physics engine has references to each physics object.
These are held as an object from the PhysicsObject interface in the physicsObjects map.
These PhysicsObject are the main reference, which is used in the physics engine.
Cannon uses internally the physicsBody of the PhysicsObject, but the Physics works with the PhysicsObject,
which also contains the id corresponding to the same entity in THREE.


### Simulation Loop
The main simulation loop is driven by a setInterval, fixedTimeStep=10 sets the desired frame time in milliseconds.

Each simulation cycle, the position and rotation of each PhysicsObject is copied to the corresponding entry in networkObjects,
which is the reference to the object held in the colyseus state. Colyseus then syncs that to the clients.

### Sleep state
If a object doesn't move faster than sleepSpeedLimit for sleepTimeLimit, it is set into a sleep state,
and not getting simulated until it gets hit by something else or is being awaked.

### adding physics objects
A physics object is added by calling the addShape function.

- geoList contains a list of the primary shapes making up the collisionBox with its offset and orientation.
- object is the reference to the colyseus state object. This object has to be created before the physics object can be created.
- onDelete marks if a object should be respawned when it hits the deletionPlane(falling off the gameboard).
It could also be used to model different behavior.

### Angular velocity
Angular velocity is set by a vector marking the rotation axis. The length of this vector is the rotationspeed(in rad/time)

### setKinematic
Kinematic mode allows the manual movement of a object.
In kinematic mode, the object is influencing other objects while not being influenced by them or gravity. 
