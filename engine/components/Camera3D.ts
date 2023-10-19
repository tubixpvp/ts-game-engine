///<reference path="../../scenes/GameScene.ts"/>
module gameengine.engine.components {
    import Component = gameengine.components.Component;
    import IGameObject = gameengine.gameObject.IGameObject;
    import GameScene = gameengine.scenes.GameScene;
    import WebGLRenderer = THREE.WebGLRenderer;
    import PerspectiveCamera = THREE.PerspectiveCamera;
    import Vector2 = THREE.Vector2;

    export class Camera3D extends Component {
        private _renderer: WebGLRenderer;

        private _camera: PerspectiveCamera;

        private readonly _lastDomSize: Vector2 = new Vector2();

        public override attached(gameObject: IGameObject): void {
            this._renderer = new WebGLRenderer({antialias: true});

            this._camera = new PerspectiveCamera(60, 1, 1, 100000);
            Transform3D.init(gameObject, this._camera);
        }

        public override update(deltaMs: number): void {
            let sizeX: number = this._renderer.domElement.width;
            let sizeY: number = this._renderer.domElement.height;

            if (this._lastDomSize.x != sizeX || this._lastDomSize.y != sizeY) {
                this._lastDomSize.set(sizeX, sizeY);
                this.updateAspect(sizeY, sizeX);
            }

            this._renderer.render(GameScene.currentScene.getScene3D(), this._camera);
        }

        public override destroy(gameObject: IGameObject): void {
            document.body.removeChild(this._renderer.domElement);
        }

        public override init(): void {
            let domElement:HTMLCanvasElement = this._renderer.domElement;
            document.body.appendChild(domElement);

            domElement.style.height = "100%";
            domElement.style.width = "100%";
            domElement.style.position = "fixed";
        }

        public get fov(): number {
            return this._camera.fov;
        }

        public set fov(value: number) {
            this._camera.fov = value;
        }

        public get nearDistance(): number {
            return this._camera.near;
        }

        public set nearDistance(value: number) {
            this._camera.near = value;
        }

        public get farDistance(): number {
            return this._camera.far;
        }

        public set farDistance(value: number) {
            this._camera.far = value;
        }

        public get canvas() : HTMLCanvasElement
        {
            return this._renderer.domElement;
        }

        public updateAspect(height: number, width: number): void {
            this._camera.aspect = height / width;
            this._camera.updateProjectionMatrix();
        }
    }
}