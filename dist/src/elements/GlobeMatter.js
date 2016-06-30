// import PIXI from 'pixi.js'
// import Container = PIXI.Container;
// import Graphics = PIXI.Graphics;
// import Ticker = PIXI.ticker.Ticker;
// import Matter from 'matter-js';
// import Engine = Matter.Engine;
// import Render = Matter.Render;
// import World = Matter.World;
// import Bodies = Matter.Bodies;
// import Composite = Matter.Composite;
// import Body = Matter.Body;
// import Ball from './Ball';
// export default class Globe extends Container{
//     private background: Graphics;
//     private engine: Engine;
//     radius: number = 100;
//     balls:Array<Ball> = [];
//     constructor(){
//         super();
//         this.background = new Graphics();
//         this.background.beginFill(0xFF0000, .8);
//         this.background.drawCircle(0, 0, this.radius);
//         this.background.endFill();
//         this.background.x = this.radius;
//         this.background.y = this.radius;
//         this.addChild(this.background);
//         this.engine = Engine.create();
//         // add all of the bodies to the world
//         let bodiesPhysics:Array<Body> = [];
//         let posX: number = 0;
//         let posY: number = -1;
//         for (let i: number = 0; i < 9; i++) {
//             let ball: Ball = new Ball();
//             ball.x = ( this.radius * 2 - 3 * ball.width ) / 2; 
//             ball.y = ( this.radius * 2 - 3 * ball.height ) / 2;
//             posX = i % 3;
//             if(posX === 0){
//                 posY++;
//             }
//             ball.x += ( ball.width + 10 ) * posX;
//             ball.y += ( ball.height + 10 ) * posY;
//             bodiesPhysics.push(Bodies.circle(ball.x, ball.y, ball.radius));
//             this.balls.push(ball);
//             this.addChild(ball);
//         }
//         World.add(this.engine.world, bodiesPhysics);
//     }
//     update(){
//         Engine.update(this.engine, 1000/60);
//         var bodies = Composite.allBodies(this.engine.world);
//         var vertices:Array<Matter.Vector> = bodies[0].vertices;
//         this.children[1].x = vertices[0].x;
//         this.children[1].y = vertices[0].y;
//         // this.balls.forEach((ball: Ball)=>{
//         //     ball.x += 10;
//         // });
//     }
// } 
