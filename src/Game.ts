
import PIXI from 'pixi.js';

import Machine from 'elements/Machine';

export default class Game{

    static width: number = 0;
    static height: number = 0;

    private renderer:PIXI.SystemRenderer;
    private canvas: HTMLElement;

    private stage: PIXI.Container;

    private machine: Machine;

    constructor(width: number, height: number, canvas: HTMLElement){
        console.log('Game loaded');
        
        Game.width = width;
        Game.height = height;

        this.renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor : 0x1099bb});
        this.canvas = canvas;

        this.canvas.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();
        this.machine = new Machine();
        this.stage.addChild(this.machine);
        
        this.renderer.render(this.stage);


        this.rendering();

    }

    rendering() {
        setTimeout(()=>{
            requestAnimationFrame(this.rendering.bind(this));
        }, 1000 / 60)
        this.machine.tick();
        // render the container
        this.renderer.render(this.stage);
    }

}