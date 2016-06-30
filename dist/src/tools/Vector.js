System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Vector;
    return {
        setters:[],
        execute: function() {
            Vector = (function () {
                function Vector(x, y) {
                    this.x = 0;
                    this.y = 0;
                    this.x = x;
                    this.y = y;
                }
                Vector.prototype.dot = function (v) {
                    return this.x * v.x + this.y * v.y;
                };
                ;
                Vector.prototype.length = function () {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                };
                ;
                Vector.prototype.normalize = function () {
                    var s = 1 / this.length();
                    this.x *= s;
                    this.y *= s;
                    return this;
                };
                ;
                Vector.prototype.multiply = function (s) {
                    return new Vector(this.x * s, this.y * s);
                };
                ;
                Vector.prototype.tx = function (v) {
                    this.x += v.x;
                    this.y += v.y;
                    return this;
                };
                ;
                return Vector;
            }());
            exports_1("default", Vector);
        }
    }
});
