System.register(['pixi.js', './Globe'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var pixi_js_1, Globe_1;
    var Container, Ticker, Machine;
    return {
        setters:[
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Globe_1_1) {
                Globe_1 = Globe_1_1;
            }],
        execute: function() {
            Container = pixi_js_1.default.Container;
            Machine = (function (_super) {
                __extends(Machine, _super);
                function Machine() {
                    _super.call(this);
                    this.ticker = pixi_js_1.default.ticker.shared;
                    this.globe = new Globe_1.default();
                    this.addChild(this.globe);
                    // this.ticker.add( this.tick.bind(this), this );
                }
                Machine.prototype.tick = function () {
                    this.globe.update();
                };
                return Machine;
            }(Container));
            exports_1("default", Machine);
        }
    }
});
