
import PIXI from 'pixi.js'
import Container = PIXI.Container;
import Ticker = PIXI.ticker.Ticker;

import Globe from './Globe';


export default class Machine extends Container{

    private ticker: Ticker = PIXI.ticker.shared;

    public globe: Globe;

    constructor(){
        super();
        
        this.globe = new Globe();
        this.addChild(this.globe);


        // this.ticker.add( this.tick.bind(this), this );
        

    }

    tick(){
        this.globe.update();
    }

}