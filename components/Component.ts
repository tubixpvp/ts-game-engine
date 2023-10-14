module gameengine.components {
    import IGameObject = gameengine.gameObject.IGameObject;

    export abstract class Component {

        private _gameObject: IGameObject;

        /**
         * GameObject to which the component is attached
         * @return {IGameObject}
         */
        public get gameObject(): IGameObject {
            return this._gameObject;
        }

        public set gameObject(value: IGameObject) {
            if (this._gameObject != null) {
                throw new Error("Operation is not allowed");
            }
            this._gameObject = value;
        }

        /**
         * Calls when component is attached
         * @param {IGameObject} gameObject The object that the component is attached
         */
        public attached(gameObject: IGameObject): void {
        }

        /**
         * Calls before remove the component from the GameObject
         * @param {IGameObject} gameObject The object that the component is attached
         */
        public destroy(gameObject: IGameObject): void {
        }

        /**
         * Calls before first frame update. Does not do anything. Override if need
         * */
        public init(): void {
        }

        /**
         * Calls every frame update. Does not do anything. Override if need
         *
         * @param {number} deltaMs Number of milliseconds that have passed since the last update
         * */
        public update(deltaMs: number): void {
        }

        /**
         * Calls when GameObject parent is changed
         */
        public onParentChanged(): void {
        }
    }
}