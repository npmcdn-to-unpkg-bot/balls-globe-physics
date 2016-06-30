
import PIXI from 'pixi.js'
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;

import Vector from '../tools/Vector';

export default class CollideObject extends Container{

    positions: Vector;
    velocity: Vector;
    mass: number = 0.1; //kg
    radius: number = 15; // 1px = 1cm
    restitution: number = -0.7;
    cr: number = 0;

    constructor(x: number, y: number){
        super();

        this.positions = new Vector(x, y);
        this.velocity = new Vector(10, 0);

    }

    update(g: number, dt: number, ppm: number){

    }

    collide(obj: CollideObject) {

        let dt: Vector; 
        let mT: Vector;
        let v1: number = 0;
        let v2: number = 0; 
        let cr: number = 0; 
        let sm: number = 0;
        let dn: Vector = new Vector(this.positions.x - obj.positions.x, this.positions.y - obj.positions.y);
        let sr: number = this.radius + obj.radius; // sum of radii
        let dx = dn.length(); // pre-normalized magnitude

        if (dx > sr) {
            return; // no collision
        }

        // sum the masses, normalize the collision vector and get its tangential
        sm = this.mass + obj.mass;
        dn.normalize();
        dt = new Vector(dn.y, -dn.x);

        // avoid double collisions by "un-deforming" balls (larger mass == less tx)
        // this is susceptible to rounding errors, "jiggle" behavior and anti-gravity
        // suspension of the object get into a strange state
        mT = dn.multiply(this.radius + obj.radius - dx);
        this.positions.tx(mT.multiply(obj.mass / sm));
        obj.positions.tx(mT.multiply(-this.mass / sm));

        // this interaction is strange, as the CR describes more than just
        // the ball's bounce properties, it describes the level of conservation
        // observed in a collision and to be "true" needs to describe, rigidity, 
        // elasticity, level of energy lost to deformation or adhesion, and crazy
        // values (such as cr > 1 or cr < 0) for stange edge cases obviously not
        // handled here (see: http://en.wikipedia.org/wiki/Coefficient_of_restitution)
        // for now assume the ball with the least amount of elasticity describes the
        // collision as a whole:
        cr = Math.min(this.cr, obj.cr);

        // cache the magnitude of the applicable component of the relevant velocity
        v1 = dn.multiply(this.velocity.dot(dn)).length();
        v2 = dn.multiply(obj.velocity.dot(dn)).length(); 

        // maintain the unapplicatble component of the relevant velocity
        // then apply the formula for inelastic collisions
        this.velocity = dt.multiply(this.velocity.dot(dt));
        this.velocity.tx(dn.multiply((cr * obj.mass * (v2 - v1) + this.mass * v1 + obj.mass * v2) / sm));

        // do this once for each object, since we are assuming collide will be called 
        // only once per "frame" and its also more effiecient for calculation cacheing 
        // purposes
        obj.velocity = dt.multiply(obj.velocity.dot(dt));
        obj.velocity.tx(dn.multiply((cr * this.mass * (v1 - v2) + obj.mass * v2 + this.mass * v1) / sm));
    };
}