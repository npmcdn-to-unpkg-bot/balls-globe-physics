System.register(['pixi.js', 'elements/Machine'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var pixi_js_1, Machine_1;
    var Game;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Machine_1_1) {
                Machine_1 = Machine_1_1;
            }],
        execute: function() {
            Game = (function () {
                function Game(width, height, canvas) {
                    console.log('Game loaded');
                    Game.width = width;
                    Game.height = height;
                    this.renderer = pixi_js_1.default.autoDetectRenderer(width, height, { backgroundColor: 0x1099bb });
                    this.canvas = canvas;
                    this.canvas.appendChild(this.renderer.view);
                    this.stage = new pixi_js_1.default.Container();
                    this.machine = new Machine_1.default();
                    this.stage.addChild(this.machine);
                    this.renderer.render(this.stage);
                    this.rendering();
                }
                Game.prototype.rendering = function () {
                    var _this = this;
                    setTimeout(function () {
                        requestAnimationFrame(_this.rendering.bind(_this));
                    }, 1000 / 60);
                    this.machine.tick();
                    // render the container
                    this.renderer.render(this.stage);
                };
                Game.width = 0;
                Game.height = 0;
                return Game;
            }());
            exports_1("default", Game);
        }
    }
});
