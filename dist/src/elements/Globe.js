System.register(['pixi.js', './Ball', './Floor'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var pixi_js_1, Ball_1, Floor_1;
    var Container, Graphics, Ticker, Cd, rho, ag, frameRate, Globe;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Ball_1_1) {
                Ball_1 = Ball_1_1;
            },
            function (Floor_1_1) {
                Floor_1 = Floor_1_1;
            }],
        execute: function() {
            Container = pixi_js_1.default.Container;
            Graphics = pixi_js_1.default.Graphics;
            Cd = 0.47; // Dimensionless
            rho = 1.22; // kg / m^3
            ag = 9.81; // m / s^2
            frameRate = 1 / 40; // Seconds
            Globe = (function (_super) {
                __extends(Globe, _super);
                function Globe() {
                    _super.call(this);
                    this.radius = 100;
                    this.objs = [];
                    this.g = 9.8; // m/s^2 - acceleration due to gravity
                    this.t = new Date().getTime();
                    this.ppm = 20; // pixels per meter
                    this.background = new Graphics();
                    this.background.beginFill(0xFF0000, .8);
                    this.background.drawCircle(0, 0, this.radius);
                    this.background.endFill();
                    this.background.x = this.radius;
                    this.background.y = this.radius;
                    this.addChild(this.background);
                    var posX = 0;
                    var posY = -1;
                    for (var i = 0; i < 1; i++) {
                        var ball = new Ball_1.default(0, 0);
                        ball.positions.x = (this.radius * 2 - 3 * ball.width) / 2;
                        ball.positions.y = (this.radius * 2 - 3 * ball.height) / 2;
                        posX = i % 3;
                        if (posX === 0) {
                            posY++;
                        }
                        ball.positions.x += (ball.width + 10) * posX;
                        ball.positions.y += (ball.height + 10) * posY;
                        ball.x = ball.positions.x;
                        ball.y = ball.positions.y;
                        this.objs.push(ball);
                        this.addChild(ball);
                    }
                    var floor = new Floor_1.default(10);
                    this.addChild(floor);
                    this.objs.push(floor);
                }
                Globe.prototype.update = function () {
                    var nt = new Date().getTime();
                    var dt = (nt - this.t) / 1000;
                    var i;
                    var j;
                    for (i = 0; i < this.objs.length; i++) {
                        var obj1 = this.objs[i];
                        obj1.update(this.g, dt, this.ppm);
                        for (j = i + 1; j < this.objs.length; j++) {
                            var obj2 = this.objs[j];
                            obj2.collide(obj1);
                        }
                        obj1.x = obj1.positions.x;
                        obj1.y = obj1.positions.y;
                        console.log(obj1.x, obj1.y);
                    }
                    this.t = nt;
                    // this.balls.forEach((ball: Ball)=>{
                    // let A: number = Math.PI * ball.radius * ball.radius / (10000); // m^2
                    // var Fx: number = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
                    // var Fy: number = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);
                    // Fx = (isNaN(Fx) ? 0 : Fx);
                    // Fy = (isNaN(Fy) ? 0 : Fy);
                    // // Calculate acceleration ( F = ma )
                    // var ax: number = Fx / ball.mass;
                    // var ay: number = ag + (Fy / ball.mass);
                    //     // Integrate to get velocity
                    // ball.velocity.x += ax * frameRate;
                    // ball.velocity.y += ay * frameRate;
                    //     // Integrate to get position
                    // ball.position.x += ball.velocity.x * frameRate * 100;
                    // ball.position.y += ball.velocity.y * frameRate * 100;
                    // if (ball.position.y > Game.height - ball.radius) {
                    //     ball.velocity.y *= ball.restitution;
                    //     ball.position.y = Game.height - ball.radius;
                    // }
                    // if (ball.position.x > Game.width - ball.radius) {
                    //     ball.velocity.x *= ball.restitution;
                    //     ball.position.x = Game.width - ball.radius;
                    // }
                    // if (ball.position.x < ball.radius) {
                    //     ball.velocity.x *= ball.restitution;
                    //     ball.position.x = ball.radius;
                    // }
                    // });
                };
                return Globe;
            }(Container));
            exports_1("default", Globe);
        }
    }
});
