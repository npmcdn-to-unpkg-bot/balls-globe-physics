System.register(['pixi.js', './CollideObject', '../tools/Vector', '../Game'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var pixi_js_1, CollideObject_1, Vector_1, Game_1;
    var Graphics, Floor;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (CollideObject_1_1) {
                CollideObject_1 = CollideObject_1_1;
            },
            function (Vector_1_1) {
                Vector_1 = Vector_1_1;
            },
            function (Game_1_1) {
                Game_1 = Game_1_1;
            }],
        execute: function() {
            Graphics = pixi_js_1.default.Graphics;
            Floor = (function (_super) {
                __extends(Floor, _super);
                function Floor(floor) {
                    _super.call(this, 0, 0);
                    this.py = 0;
                    this.background = new Graphics();
                    this.background.beginFill(0x0000FF, .8);
                    this.background.drawRect(0, 0, Game_1.default.width, floor);
                    this.background.endFill();
                    this.addChild(this.background);
                    this.velocity = new Vector_1.default(0, 0);
                    this.mass = 5.9722 * Math.pow(10, 24);
                    this.radius = 10000000;
                    this.positions = new Vector_1.default(0, this.py = Game_1.default.height - floor);
                }
                Floor.prototype.update = function (g, dt, ppm) {
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.velocity.x = 0;
                    this.positions.y = this.py;
                };
                ;
                return Floor;
            }(CollideObject_1.default));
            exports_1("default", Floor);
        }
    }
});
