///<reference path="../gameObject/GameObject.ts"/>
module gameengine.scenes {
    import GameObject = gameengine.gameObject.GameObject;

    export class GameScene extends GameObject {
        /**
         * Current updating scene
         * @return {GameScene}
         */
        public static get currentScene(): GameScene {
            return this._currentScene;
        }

        private static _currentScene: GameScene = null;


        //scene updating is running
        private _running: boolean = false;

        //enterFrame() function bind to 'this'
        private _enterFrameBind: any = this.enterFrame.bind(this);

        //last enterFrame() call time
        private _lastUpdateTime: number = 0;

        private readonly _scene: THREE.Scene = new THREE.Scene();

        /**
         * Get ThreeJS Scene instance used in GameScene
         * @return {THREE.Scene}
         */
        public getScene3D(): THREE.Scene {
            return this._scene;
        }

        /**
         * Start frame updating. Will be ignored if already running
         */
        public start(): void {
            if (!this._running) {
                this._running = true;
                this._lastUpdateTime = 0;
                requestAnimationFrame(this._enterFrameBind);
            }
        }

        /**
         * Stop frame updating. Will be ignored if not running
         */
        public stop(): void {
            this._running = false;
        }

        private enterFrame(): void {
            if (!this._running) {
                return; //stop frame updating if scene is stopped
            }
            if (this._enabled) { //if GameObject is enabled
                let deltaMs: number;

                const currTime: number = Date.now();

                if (this._lastUpdateTime == 0) {
                    deltaMs = 0;
                } else {
                    deltaMs = currTime - this._lastUpdateTime;
                }
                this._lastUpdateTime = currTime;

                GameScene._currentScene = this;

                for (let child of this._children) {
                    (child as GameObject).sceneUpdate(deltaMs);
                }

                GameScene._currentScene = null;
            }
            requestAnimationFrame(this._enterFrameBind);
        }
    }
}