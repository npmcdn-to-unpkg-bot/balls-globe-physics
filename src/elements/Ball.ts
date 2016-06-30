
import PIXI from 'pixi.js'
import Graphics = PIXI.Graphics;

import CollideObject from './CollideObject';

export default class Ball extends CollideObject{

    private background: Graphics;

    constructor(x: number, y: number){
        super(x, y);

        this.background = new Graphics();
        this.background.beginFill(0x00FF00, .8);
        this.background.drawCircle(0, 0, this.radius);
        this.background.endFill();
        this.addChild(this.background);

    }

    update(g: number, dt: number, ppm: number) {
        this.velocity.y += g * dt;
        this.positions.x += this.velocity.x * dt * ppm;
        this.positions.y += this.velocity.y * dt * ppm;
    };
}