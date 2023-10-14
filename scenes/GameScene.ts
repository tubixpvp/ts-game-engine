import {GameObject} from "../gameObject/GameObject";

export class GameScene extends GameObject
{
    //scene updating is running
    private _running:boolean = false;

    //enterFrame() function bind to 'this'
    private _enterFrameBind:any = this.enterFrame.bind(this);

    //last enterFrame() call time
    private _lastUpdateTime:number = 0;

    /**
     * Start frame updating. Will be ignored if already running
     */
    public start() : void
    {
        if(!this._running) {
            this._running = true;
            this._lastUpdateTime = 0;
            requestAnimationFrame(this._enterFrameBind);
        }
    }

    /**
     * Stop frame updating. Will be ignored if not running
     */
    public stop() : void
    {
        this._running = false;
    }

    private enterFrame() : void
    {
        if(!this._running)
        {
            return;
        }
        if(this._enabled) {
            let deltaMs: number;

            const currTime: number = Date.now();

            if (this._lastUpdateTime == 0) {
                deltaMs = 0;
            } else {
                deltaMs = currTime - this._lastUpdateTime;
            }
            this._lastUpdateTime = currTime;

            for (let child of this._children) {
                (child as GameObject).sceneUpdate(deltaMs);
            }
        }
        requestAnimationFrame(this._enterFrameBind);
    }
}