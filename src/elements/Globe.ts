
import PIXI from 'pixi.js'
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;
import Ticker = PIXI.ticker.Ticker;

import Game from '../Game';

import Ball from './Ball';
import Floor from './Floor';
import CollideObject from './CollideObject';

const Cd = 0.47;  // Dimensionless
const rho = 1.22; // kg / m^3
const ag = 9.81;  // m / s^2
const frameRate = 1/40; // Seconds


export default class Globe extends Container{

    private background: Graphics;

    radius: number = 100;

    objs:Array<CollideObject> = [];

    g = 9.8; // m/s^2 - acceleration due to gravity
    t = new Date().getTime();
    ppm = 20; // pixels per meter


    constructor(){
        super();


        this.background = new Graphics();
        this.background.beginFill(0xFF0000, .8);
        this.background.drawCircle(0, 0, this.radius);
        this.background.endFill();

        this.background.x = this.radius;
        this.background.y = this.radius;

        this.addChild(this.background);

        let posX: number = 0;
        let posY: number = -1;
        for (let i: number = 0; i < 1; i++) {
            let ball: Ball = new Ball(0, 0);
            ball.positions.x = ( this.radius * 2 - 3 * ball.width ) / 2; 
            ball.positions.y = ( this.radius * 2 - 3 * ball.height ) / 2;
            
            posX = i % 3;
            if(posX === 0){
                posY++;
            }

            ball.positions.x += ( ball.width + 10 ) * posX;
            ball.positions.y += ( ball.height + 10 ) * posY;

            ball.x = ball.positions.x;
            ball.y = ball.positions.y;

            this.objs.push(ball);
            this.addChild(ball);
        }

        let floor:Floor =  new Floor(10);
        this.addChild(floor);
        this.objs.push(floor);

    }

    update(){
        
        let nt: number = new Date().getTime();
        let dt: number = (nt - this.t) / 1000;
        var i: number; 
        let j: number;
        for (i = 0; i < this.objs.length; i++) {
            let obj1: CollideObject = this.objs[i];
            obj1.update(this.g, dt, this.ppm);

            for (j = i + 1; j < this.objs.length; j++) {
                let obj2: CollideObject = this.objs[j];
                obj2.collide(obj1);
            }

            obj1.x = obj1.positions.x;
            obj1.y = obj1.positions.y;
            console.log(obj1.x , obj1.y);
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


    }

}