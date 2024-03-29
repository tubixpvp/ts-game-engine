declare namespace gameengine.components {
    import IGameObject = gameengine.gameObject.IGameObject;
    abstract class Component {
        private _gameObject;
        get gameObject(): IGameObject;
        set gameObject(value: IGameObject);
        attached(gameObject: IGameObject): void;
        destroy(gameObject: IGameObject): void;
        init(): void;
        update(deltaMs: number): void;
        onParentChanged(): void;
    }
}
declare namespace gameengine.gameObject {
    import Component = gameengine.components.Component;
    class GameObject implements IGameObject {
        private readonly _components;
        private readonly _newComponents;
        protected readonly _children: Array<IGameObject>;
        private _parent;
        protected _enabled: boolean;
        get enabled(): boolean;
        set enabled(value: boolean);
        get parent(): IGameObject;
        addChild(gameObject: IGameObject): void;
        onParentChanged(parentObject: IGameObject): void;
        removeChild(gameObject: IGameObject): void;
        hasChild(gameObject: IGameObject): boolean;
        addComponent<T extends Component>(type: {
            new (): T;
        }): T;
        removeComponent<T extends Component>(type: {
            new (): T;
        }): void;
        hasComponent<T extends Component>(type: {
            new (): T;
        }): boolean;
        getComponent<T extends Component>(type: {
            new (): T;
        }): T;
        getComponentInChildren<T extends Component>(type: {
            new (): T;
        }): T;
        getComponentsInChildren<T extends Component>(type: {
            new (): T;
        }): T[];
        getComponentInParent<T extends Component>(type: {
            new (): T;
        }): T;
        sceneUpdate(deltaMs: number): void;
    }
}
declare namespace gameengine.scenes {
    import GameObject = gameengine.gameObject.GameObject;
    import Scene = THREE.Scene;
    class GameScene extends GameObject {
        static get currentScene(): GameScene;
        private static _currentScene;
        private _running;
        private _enterFrameBind;
        private _lastUpdateTime;
        private readonly _scene;
        getScene3D(): Scene;
        start(): void;
        stop(): void;
        private enterFrame;
    }
}
declare namespace gameengine.engine.components {
    import Component = gameengine.components.Component;
    import IGameObject = gameengine.gameObject.IGameObject;
    class Camera3D extends Component {
        private _renderer;
        private _camera;
        private readonly _lastDomSize;
        attached(gameObject: IGameObject): void;
        update(deltaMs: number): void;
        destroy(gameObject: IGameObject): void;
        init(): void;
        get fov(): number;
        set fov(value: number);
        get nearDistance(): number;
        set nearDistance(value: number);
        get farDistance(): number;
        set farDistance(value: number);
        get canvas(): HTMLCanvasElement;
        updateAspect(height: number, width: number): void;
    }
}
declare namespace gameengine.engine.components {
    interface ITransform {
    }
}
declare namespace gameengine.gameObject {
    import Component = gameengine.components.Component;
    interface IGameObject {
        addComponent<T extends Component>(type: {
            new (): T;
        }): T;
        removeComponent<T extends Component>(type: {
            new (): T;
        }): void;
        hasComponent<T extends Component>(type: {
            new (): T;
        }): boolean;
        getComponent<T extends Component>(type: {
            new (): T;
        }): T;
        getComponentInChildren<T extends Component>(type: {
            new (): T;
        }): T;
        getComponentsInChildren<T extends Component>(type: {
            new (): T;
        }): T[];
        getComponentInParent<T extends Component>(type: {
            new (): T;
        }): T;
        addChild(gameObject: IGameObject): void;
        removeChild(gameObject: IGameObject): void;
        hasChild(gameObject: IGameObject): boolean;
        get parent(): IGameObject;
    }
}
declare namespace gameengine.engine.components {
    import Component = gameengine.components.Component;
    import IGameObject = gameengine.gameObject.IGameObject;
    import Vector3 = THREE.Vector3;
    import Object3D = THREE.Object3D;
    class Transform3D extends Component implements ITransform {
        readonly position: Vector3;
        readonly rotation: Vector3;
        private object3d;
        setObject3D(object3d: Object3D): void;
        setNewObject3D(): void;
        getObject3D(): Object3D;
        static getTransformFromObject3D(object3d: Object3D): Transform3D;
        update(deltaMs: number): void;
        onParentChanged(): void;
        static init(gameObject: IGameObject, object3d: Object3D): void;
    }
}
declare namespace gameengine.engine.material {
    abstract class Material {
        abstract get material(): THREE.Material | THREE.Material[];
        abstract dispose(): void;
    }
}
declare namespace gameengine.engine.material {
    class TextureMaterial extends Material {
        static readonly MESH_BASIC: string;
        private _type;
        private _texture;
        private _material;
        constructor(type: string, data: HTMLImageElement | THREE.Texture);
        dispose(): void;
        get material(): THREE.Material | THREE.Material[];
    }
}
declare namespace gameengine.engine.components {
    import Component = gameengine.components.Component;
    import IGameObject = gameengine.gameObject.IGameObject;
    import BufferGeometry = THREE.BufferGeometry;
    import Material = gameengine.engine.material.Material;
    class MeshRenderer extends Component {
        private static readonly DUMMY_MATERIAL;
        private _mesh;
        private _geometry;
        private _material;
        attached(gameObject: IGameObject): void;
        initGeometry(geometry: BufferGeometry): void;
        get material(): Material;
        set material(value: Material);
    }
}
declare namespace gameengine.engine.components {
    import Component = gameengine.components.Component;
    import Vector2 = THREE.Vector2;
    class Transform2D extends Component implements ITransform {
        readonly position: Vector2;
        readonly rotation: Vector2;
    }
}
declare namespace gameengine.engine.resources {
    import Loader = THREE.Loader;
    import LoadingManager = THREE.LoadingManager;
    import Group = THREE.Group;
    class Loader3DS extends Loader {
        private readonly debug;
        private group;
        private materials;
        private _3DSObjectsByName;
        constructor(debug?: boolean, manager?: LoadingManager);
        load(url: string, onLoad: (group: Group) => void, onProgress: (event: ProgressEvent) => void, onError: (error: unknown) => void): void;
        parse(arraybuffer: ArrayBuffer, path: string): Group;
        private readFile;
        private object3DSDataToThreejsMesh;
        private correctMatrix;
        private readAnimationData;
        private readObjectNode;
        private readObjectHierarchy;
        private readObjectName;
        private readMeshData;
        private readNamedObject;
        private readMaterialEntry;
        private readMesh;
        private readFaceArray;
        private readMap;
        private readMaterialGroup;
        private readColor;
        private readPercentage;
        private debugMessage;
    }
}
declare namespace gameengine.engine.resources {
    import IGameObject = gameengine.gameObject.IGameObject;
    class MeshLoader {
        private static readonly loader3DS;
        private static readonly loaderFBX;
        static loadMesh(type: "3ds" | "fbx", url: string, callback: (meshObject: IGameObject) => void): void;
        private static onObjectsLoaded;
        private static traverseAndBuildTree;
        private static onError;
    }
}
type int = number;
declare const int: (value: any) => number;
