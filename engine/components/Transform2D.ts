module gameengine.engine.components {
    import Component = gameengine.components.Component;
    import Vector2 = THREE.Vector2;

    export class Transform2D extends Component implements ITransform {
        public readonly position: Vector2 = new Vector2();

        public readonly rotation: Vector2 = new Vector2();


    }
}