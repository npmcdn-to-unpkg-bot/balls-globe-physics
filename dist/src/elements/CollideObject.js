System.register(['pixi.js', '../tools/Vector'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var pixi_js_1, Vector_1;
    var Container, Graphics, CollideObject;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Vector_1_1) {
                Vector_1 = Vector_1_1;
            }],
        execute: function() {
            Container = pixi_js_1.default.Container;
            CollideObject = (function (_super) {
                __extends(CollideObject, _super);
                function CollideObject(x, y) {
                    _super.call(this);
                    this.mass = 0.1; //kg
                    this.radius = 15; // 1px = 1cm
                    this.restitution = -0.7;
                    this.cr = 0;
                    this.positions = new Vector_1.default(x, y);
                    this.velocity = new Vector_1.default(10, 0);
                }
                CollideObject.prototype.update = function (g, dt, ppm) {
                };
                CollideObject.prototype.collide = function (obj) {
                    var dt;
                    var mT;
                    var v1 = 0;
                    var v2 = 0;
                    var cr = 0;
                    var sm = 0;
                    var dn = new Vector_1.default(this.positions.x - obj.positions.x, this.positions.y - obj.positions.y);
                    var sr = this.radius + obj.radius; // sum of radii
                    var dx = dn.length(); // pre-normalized magnitude
                    if (dx > sr) {
                        return; // no collision
                    }
                    // sum the masses, normalize the collision vector and get its tangential
                    sm = this.mass + obj.mass;
                    dn.normalize();
                    dt = new Vector_1.default(dn.y, -dn.x);
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
                ;
                return CollideObject;
            }(Container));
            exports_1("default", CollideObject);
        }
    }
});
