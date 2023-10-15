module gameengine.engine.components {
    import Component = gameengine.components.Component;
    import IGameObject = gameengine.gameObject.IGameObject;
    import Vector3 = THREE.Vector3;
    import Object3D = THREE.Object3D;

    export class Transform3D extends Component implements ITransform {
        public readonly position: Vector3 = new Vector3();

        public readonly rotation: Vector3 = new Vector3();

        private object3d: Object3D;

        /**
         * Link Transform3D to the ThreeJS Object3D
         * @param object3d {Object3D} Object to connect
         */
        public setObject3D(object3d: Object3D): void {
            this.object3d = object3d;
            this.object3d.userData = this;
            this.onParentChanged();
        }

        /**
         * Create new ThreeJS Object3D and link Transform3D to it
         */
        public setNewObject3D() : void
        {
            this.setObject3D(new Object3D());
        }

        /**
         * Get ThreeJS Object3D that linked to this Transform3D
         * @return {Object3D}
         */
        public getObject3D(): Object3D {
            return this.object3d;
        }

        public static getTransformFromObject3D(object3d: Object3D): Transform3D {
            return object3d.userData as Transform3D;
        }

        public override update(deltaMs: number): void {
            this.object3d.position.copy(this.position);
            this.object3d.rotation.x = this.rotation.x;
            this.object3d.rotation.y = this.rotation.y;
            this.object3d.rotation.z = this.rotation.z;
        }

        public override onParentChanged(): void {
            if (this.object3d.parent != null) {
                this.object3d.removeFromParent();
            }
            if (this.gameObject.parent != null) {
                let transform3: Transform3D = this.gameObject.getComponentInParent(Transform3D);
                if (transform3 != null) {
                    transform3.getObject3D().add(this.object3d);
                }
            }
        }

        public static init(gameObject: IGameObject, object3d: Object3D): void {
            let transform3: Transform3D = gameObject.getComponent(Transform3D);
            if (transform3 == null) {
                transform3 = gameObject.addComponent(Transform3D);
            }
            transform3.setObject3D(object3d);
        }
    }
}