export default class Vector{

    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    dot(v: Vector) {
        return this.x * v.x + this.y * v.y;
    };

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    normalize() {
        var s = 1 / this.length();
        this.x *= s;
        this.y *= s;
        return this;
    };

    multiply(s: number) {
        return new Vector(this.x * s, this.y * s);
    };

    tx(v: Vector) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
}