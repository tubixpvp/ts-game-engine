module gameengine.gameObject {
    import Component = gameengine.components.Component;

    export class GameObject implements IGameObject {
        private readonly _components: Array<Component> = new Array<Component>();

        private readonly _newComponents: Array<Component> = new Array<Component>();

        protected readonly _children: Array<IGameObject> = new Array<IGameObject>();

        private _parent: IGameObject = null;


        protected _enabled: boolean = true;

        public get enabled(): boolean {
            return this._enabled;
        }

        public set enabled(value: boolean) {
            this._enabled = value;
        }

        public get parent(): IGameObject {
            return this._parent;
        }

        public addChild(gameObject: IGameObject): void {
            if (this.hasChild(gameObject)) {
                throw new Error("Object already attached as child");
            }
            if (this == gameObject) {
                throw new Error("You cannot attach object to itself");
            }
            this._children.push(gameObject);
            (gameObject as GameObject).onParentChanged(this);
        }

        public onParentChanged(parentObject: IGameObject): void {
            this._parent = parentObject;
            for (let component of this._components) {
                component.onParentChanged();
            }
        }

        public removeChild(gameObject: IGameObject) {
            if (!this.hasChild(gameObject)) {
                throw new Error("Object bust be a child");
            }
            this._children.splice(this._children.indexOf(gameObject), 1);
            (gameObject as GameObject).onParentChanged(null);
        }

        public hasChild(gameObject: IGameObject): boolean {
            return this._children.indexOf(gameObject) != -1;
        }

        public addComponent<T extends Component>(type: { new(): T; }): T {
            if (this.hasComponent<T>(type)) {
                throw new Error("Component has been already added");
            }
            let component: T = new type();
            this._components.push(component);
            this._newComponents.push(component);
            component.gameObject = this;
            component.attached(this);
            return component;
        }

        public removeComponent<T extends Component>(type: { new(): T; }): void {
            if (!this.hasComponent<T>(type)) {
                throw new Error("Component is not attached");
            }

            let component: Component = this.getComponent<T>(type);
            component.destroy(this);
            component.gameObject = null;

            let index: number = this._newComponents.indexOf(component);
            if (index != -1)
                this._newComponents.splice(index, 1);

            index = this._components.indexOf(component);
            if (index != -1)
                this._components.splice(index, 1);
        }

        public hasComponent<T extends Component>(type: { new(): T; }): boolean {
            for (let component of this._components) {
                if (component instanceof type)
                    return true;
            }
            return false;
        }

        public getComponent<T extends Component>(type: { new(): T }): T {
            for (let component of this._components) {
                if (component instanceof type)
                    return component;
            }
            return null;
        }

        public getComponentInChildren<T extends Component>(type: { new(): T }): T {
            for (let child of this._children) {
                if (child.hasComponent(type)) {
                    return child.getComponent(type);
                }
            }
            return null;
        }

        public getComponentsInChildren<T extends Component>(type: { new(): T }): T[] {
            let result: T[] = [];

            for (let child of this._children) {
                if (child.hasComponent(type)) {
                    result.push(child.getComponent(type));
                }
            }

            return result;
        }

        public getComponentInParent<T extends Component>(type: { new(): T }): T {
            if (this._parent == null) {
                return null;
            }
            if (this._parent.hasComponent(type)) {
                return this._parent.getComponent(type);
            }
            return this._parent.getComponentInParent(type);
        }

        public sceneUpdate(deltaMs: number): void {
            while (this._newComponents.length > 0) {
                this._newComponents.shift().init();
            }
            if (!this._enabled) {
                return;
            }
            for (let component of this._components) {
                component.update(deltaMs);
            }

            for (let child of this._children) {
                (child as GameObject).sceneUpdate(deltaMs);
            }
        }

    }
}