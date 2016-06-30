

import PIXI from 'pixi.js'
import Graphics = PIXI.Graphics;

import CollideObject from './CollideObject';

import Vector from '../tools/Vector';

import Game from '../Game';

export default class Floor extends CollideObject{

    py: number = 0;

    private background: Graphics;

    constructor(floor: number) {
        super(0, 0);

        this.background = new Graphics();
        this.background.beginFill(0x0000FF, .8);
        this.background.drawRect(0, 0, Game.width, floor);
        this.background.endFill();
        this.addChild(this.background);

        this.velocity = new Vector(0, 0);
        this.mass = 5.9722 * Math.pow(10, 24);
        this.radius = 10000000;
        this.positions = new Vector(0, this.py = Game.height - floor);
    }

    update(g: number, dt: number, ppm: number) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.x = 0;
        this.positions.y = this.py;
    };
}
