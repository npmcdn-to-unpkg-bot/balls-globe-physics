System.register(['pixi.js', './CollideObject'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var pixi_js_1, CollideObject_1;
    var Graphics, Ball;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (CollideObject_1_1) {
                CollideObject_1 = CollideObject_1_1;
            }],
        execute: function() {
            Graphics = pixi_js_1.default.Graphics;
            Ball = (function (_super) {
                __extends(Ball, _super);
                function Ball(x, y) {
                    _super.call(this, x, y);
                    this.background = new Graphics();
                    this.background.beginFill(0x00FF00, .8);
                    this.background.drawCircle(0, 0, this.radius);
                    this.background.endFill();
                    this.addChild(this.background);
                }
                Ball.prototype.update = function (g, dt, ppm) {
                    this.velocity.y += g * dt;
                    this.positions.x += this.velocity.x * dt * ppm;
                    this.positions.y += this.velocity.y * dt * ppm;
                };
                ;
                return Ball;
            }(CollideObject_1.default));
            exports_1("default", Ball);
        }
    }
});
