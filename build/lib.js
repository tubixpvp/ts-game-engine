var gameengine;
(function (gameengine) {
    var components;
    (function (components) {
        class Component {
            get gameObject() {
                return this._gameObject;
            }
            set gameObject(value) {
                if (this._gameObject != null) {
                    throw new Error("Operation is not allowed");
                }
                this._gameObject = value;
            }
            attached(gameObject) {
            }
            destroy(gameObject) {
            }
            init() {
            }
            update(deltaMs) {
            }
            onParentChanged() {
            }
        }
        components.Component = Component;
    })(components = gameengine.components || (gameengine.components = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var gameObject;
    (function (gameObject_1) {
        class GameObject {
            constructor() {
                this._components = new Array();
                this._newComponents = new Array();
                this._children = new Array();
                this._parent = null;
                this._enabled = true;
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(value) {
                this._enabled = value;
            }
            get parent() {
                return this._parent;
            }
            addChild(gameObject) {
                if (this.hasChild(gameObject)) {
                    throw new Error("Object already attached as child");
                }
                if (this == gameObject) {
                    throw new Error("You cannot attach object to itself");
                }
                this._children.push(gameObject);
                gameObject.onParentChanged(this);
            }
            onParentChanged(parentObject) {
                this._parent = parentObject;
                for (let component of this._components) {
                    component.onParentChanged();
                }
            }
            removeChild(gameObject) {
                if (!this.hasChild(gameObject)) {
                    throw new Error("Object bust be a child");
                }
                this._children.splice(this._children.indexOf(gameObject), 1);
                gameObject.onParentChanged(null);
            }
            hasChild(gameObject) {
                return this._children.indexOf(gameObject) != -1;
            }
            addComponent(type) {
                if (this.hasComponent(type)) {
                    throw new Error("Component has been already added");
                }
                let component = new type();
                this._components.push(component);
                this._newComponents.push(component);
                component.gameObject = this;
                component.attached(this);
                return component;
            }
            removeComponent(type) {
                if (!this.hasComponent(type)) {
                    throw new Error("Component is not attached");
                }
                let component = this.getComponent(type);
                component.destroy(this);
                component.gameObject = null;
                let index = this._newComponents.indexOf(component);
                if (index != -1)
                    this._newComponents.splice(index, 1);
                index = this._components.indexOf(component);
                if (index != -1)
                    this._components.splice(index, 1);
            }
            hasComponent(type) {
                for (let component of this._components) {
                    if (component instanceof type)
                        return true;
                }
                return false;
            }
            getComponent(type) {
                for (let component of this._components) {
                    if (component instanceof type)
                        return component;
                }
                return null;
            }
            getComponentInChildren(type) {
                for (let child of this._children) {
                    if (child.hasComponent(type)) {
                        return child.getComponent(type);
                    }
                }
                return null;
            }
            getComponentsInChildren(type) {
                let result = [];
                for (let child of this._children) {
                    if (child.hasComponent(type)) {
                        result.push(child.getComponent(type));
                    }
                }
                return result;
            }
            getComponentInParent(type) {
                if (this._parent == null) {
                    return null;
                }
                if (this._parent.hasComponent(type)) {
                    return this._parent.getComponent(type);
                }
                return this._parent.getComponentInParent(type);
            }
            sceneUpdate(deltaMs) {
                while (this._newComponents.length > 0) {
                    this._newComponents.shift().init();
                }
                if (!this._enabled) {
                    return;
                }
                for (let component of this._components) {
                    component.update(deltaMs);
                }
            }
        }
        gameObject_1.GameObject = GameObject;
    })(gameObject = gameengine.gameObject || (gameengine.gameObject = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var scenes;
    (function (scenes) {
        var GameObject = gameengine.gameObject.GameObject;
        class GameScene extends GameObject {
            constructor() {
                super(...arguments);
                this._running = false;
                this._enterFrameBind = this.enterFrame.bind(this);
                this._lastUpdateTime = 0;
                this._scene = new THREE.Scene();
            }
            static get currentScene() {
                return this._currentScene;
            }
            getScene3D() {
                return this._scene;
            }
            start() {
                if (!this._running) {
                    this._running = true;
                    this._lastUpdateTime = 0;
                    requestAnimationFrame(this._enterFrameBind);
                }
            }
            stop() {
                this._running = false;
            }
            enterFrame() {
                if (!this._running) {
                    return;
                }
                if (this._enabled) {
                    let deltaMs;
                    const currTime = Date.now();
                    if (this._lastUpdateTime == 0) {
                        deltaMs = 0;
                    }
                    else {
                        deltaMs = currTime - this._lastUpdateTime;
                    }
                    this._lastUpdateTime = currTime;
                    GameScene._currentScene = this;
                    for (let child of this._children) {
                        child.sceneUpdate(deltaMs);
                    }
                    GameScene._currentScene = null;
                }
                requestAnimationFrame(this._enterFrameBind);
            }
        }
        GameScene._currentScene = null;
        scenes.GameScene = GameScene;
    })(scenes = gameengine.scenes || (gameengine.scenes = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var components;
        (function (components) {
            var Component = gameengine.components.Component;
            var GameScene = gameengine.scenes.GameScene;
            var WebGLRenderer = THREE.WebGLRenderer;
            var PerspectiveCamera = THREE.PerspectiveCamera;
            var Vector2 = THREE.Vector2;
            class Camera3D extends Component {
                constructor() {
                    super(...arguments);
                    this._lastDomSize = new Vector2();
                }
                attached(gameObject) {
                    this._renderer = new WebGLRenderer({ antialias: true });
                    this._camera = new PerspectiveCamera(60, 1, 1, 100000);
                    components.Transform3D.init(gameObject, this._camera);
                }
                update(deltaMs) {
                    let sizeX = this._renderer.domElement.width;
                    let sizeY = this._renderer.domElement.height;
                    if (this._lastDomSize.x != sizeX || this._lastDomSize.y != sizeY) {
                        this._lastDomSize.set(sizeX, sizeY);
                        this.updateAspect(sizeY, sizeX);
                    }
                    this._renderer.render(GameScene.currentScene.getScene3D(), this._camera);
                }
                destroy(gameObject) {
                    document.body.removeChild(this._renderer.domElement);
                }
                init() {
                    let domElement = this._renderer.domElement;
                    document.body.appendChild(domElement);
                    domElement.style.height = "100%";
                    domElement.style.width = "100%";
                    domElement.style.position = "fixed";
                }
                get fov() {
                    return this._camera.fov;
                }
                set fov(value) {
                    this._camera.fov = value;
                }
                get nearDistance() {
                    return this._camera.near;
                }
                set nearDistance(value) {
                    this._camera.near = value;
                }
                get farDistance() {
                    return this._camera.far;
                }
                set farDistance(value) {
                    this._camera.far = value;
                }
                updateAspect(height, width) {
                    this._camera.aspect = height / width;
                    this._camera.updateProjectionMatrix();
                }
            }
            components.Camera3D = Camera3D;
        })(components = engine.components || (engine.components = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var components;
        (function (components) {
            var Component = gameengine.components.Component;
            var Vector2 = THREE.Vector2;
            class Transform2D extends Component {
                constructor() {
                    super(...arguments);
                    this.position = new Vector2();
                    this.rotation = new Vector2();
                }
            }
            components.Transform2D = Transform2D;
        })(components = engine.components || (engine.components = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var components;
        (function (components) {
            var Component = gameengine.components.Component;
            var Vector3 = THREE.Vector3;
            class Transform3D extends Component {
                constructor() {
                    super(...arguments);
                    this.position = new Vector3();
                    this.rotation = new Vector3();
                }
                setObject3D(object3d) {
                    this.object3d = object3d;
                    this.object3d.userData = this;
                    this.onParentChanged();
                }
                getObject3D() {
                    return this.object3d;
                }
                static getTransformFromObject3D(object3d) {
                    return object3d.userData;
                }
                update(deltaMs) {
                    this.object3d.position.copy(this.position);
                    this.object3d.rotation.x = this.rotation.x;
                    this.object3d.rotation.y = this.rotation.y;
                    this.object3d.rotation.z = this.rotation.z;
                }
                onParentChanged() {
                    if (this.object3d.parent != null) {
                        this.object3d.removeFromParent();
                    }
                    if (this.gameObject.parent != null) {
                        let transform3 = this.gameObject.getComponentInParent(Transform3D);
                        if (transform3 != null) {
                            transform3.getObject3D().add(this.object3d);
                        }
                    }
                }
                static init(gameObject, object3d) {
                    let transform3 = gameObject.getComponent(Transform3D);
                    if (transform3 == null) {
                        transform3 = gameObject.addComponent(Transform3D);
                    }
                    transform3.setObject3D(object3d);
                }
            }
            components.Transform3D = Transform3D;
        })(components = engine.components || (engine.components = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
//# sourceMappingURL=lib.js.map