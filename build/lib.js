var gameengine;
(function (gameengine) {
    var components;
    (function (components) {
        class Component {
            _gameObject;
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
            _components = new Array();
            _newComponents = new Array();
            _children = new Array();
            _parent = null;
            _enabled = true;
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
                for (let child of this._children) {
                    child.sceneUpdate(deltaMs);
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
        var Scene = THREE.Scene;
        class GameScene extends GameObject {
            static get currentScene() {
                return this._currentScene;
            }
            static _currentScene = null;
            _running = false;
            _enterFrameBind = this.enterFrame.bind(this);
            _lastUpdateTime = 0;
            _scene = new Scene();
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
                _renderer;
                _camera;
                _lastDomSize = new Vector2();
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
                get canvas() {
                    return this._renderer.domElement;
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
            var Vector3 = THREE.Vector3;
            var Object3D = THREE.Object3D;
            class Transform3D extends Component {
                position = new Vector3();
                rotation = new Vector3();
                object3d;
                setObject3D(object3d) {
                    this.object3d = object3d;
                    this.object3d.userData = this;
                    this.position.copy(object3d.position);
                    this.rotation.x = object3d.rotation.x;
                    this.rotation.y = object3d.rotation.y;
                    this.rotation.z = object3d.rotation.z;
                    this.onParentChanged();
                }
                setNewObject3D() {
                    this.setObject3D(new Object3D());
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
                    else if (transform3.getObject3D() != null) {
                        throw new Error("Using more than one ThreeJS Object3D in one Transform3D is not allowed");
                    }
                    transform3.setObject3D(object3d);
                }
            }
            components.Transform3D = Transform3D;
        })(components = engine.components || (engine.components = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var material;
        (function (material) {
            class Material {
            }
            material.Material = Material;
        })(material = engine.material || (engine.material = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var material;
        (function (material) {
            class TextureMaterial extends material.Material {
                static MESH_BASIC = "meshBasic";
                _type;
                _texture;
                _material;
                constructor(type, data) {
                    super();
                    this._type = type;
                    if (data instanceof HTMLImageElement) {
                        this._texture = new THREE.Texture(data);
                    }
                    else {
                        this._texture = data.clone();
                    }
                    if (type == TextureMaterial.MESH_BASIC) {
                        const meshBasicMaterial = new THREE.MeshBasicMaterial();
                        this._material = meshBasicMaterial;
                        meshBasicMaterial.map = this._texture;
                    }
                    else {
                        throw new Error("unsupported type: " + type);
                    }
                }
                dispose() {
                    this._type = null;
                    this._material.dispose();
                    this._material = null;
                    this._texture.dispose();
                    this._texture = null;
                }
                get material() {
                    return this._material;
                }
            }
            material.TextureMaterial = TextureMaterial;
        })(material = engine.material || (engine.material = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var components;
        (function (components) {
            var Component = gameengine.components.Component;
            var Mesh = THREE.Mesh;
            var BufferGeometry = THREE.BufferGeometry;
            var TextureMaterial = gameengine.engine.material.TextureMaterial;
            class MeshRenderer extends Component {
                static DUMMY_MATERIAL = new TextureMaterial(TextureMaterial.MESH_BASIC, new Image(1, 1));
                _mesh;
                _geometry;
                _material;
                attached(gameObject) {
                    this._geometry = new BufferGeometry();
                    this._mesh = new Mesh(this._geometry);
                    this.material = MeshRenderer.DUMMY_MATERIAL;
                    components.Transform3D.init(gameObject, this._mesh);
                }
                initGeometry(geometry) {
                    this._geometry.copy(geometry);
                    this._geometry.computeVertexNormals();
                }
                get material() {
                    return this._material;
                }
                set material(value) {
                    this._material = value;
                    this._mesh.material = value.material;
                }
            }
            components.MeshRenderer = MeshRenderer;
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
                position = new Vector2();
                rotation = new Vector2();
            }
            components.Transform2D = Transform2D;
        })(components = engine.components || (engine.components = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var resources;
        (function (resources) {
            var Loader = THREE.Loader;
            var LoaderUtils = THREE.LoaderUtils;
            var FileLoader = THREE.FileLoader;
            var Group = THREE.Group;
            var Float32BufferAttribute = THREE.Float32BufferAttribute;
            var Euler = THREE.Euler;
            var Mesh = THREE.Mesh;
            var BufferGeometry = THREE.BufferGeometry;
            var MeshPhongMaterial = THREE.MeshPhongMaterial;
            var DoubleSide = THREE.DoubleSide;
            var AdditiveBlending = THREE.AdditiveBlending;
            var Texture = THREE.Texture;
            var TextureLoader = THREE.TextureLoader;
            var Color = THREE.Color;
            const M3DMAGIC = 0x4D4D;
            const MLIBMAGIC = 0x3DAA;
            const CMAGIC = 0xC23D;
            const M3D_VERSION = 0x0002;
            const COLOR_F = 0x0010;
            const COLOR_24 = 0x0011;
            const LIN_COLOR_24 = 0x0012;
            const LIN_COLOR_F = 0x0013;
            const INT_PERCENTAGE = 0x0030;
            const FLOAT_PERCENTAGE = 0x0031;
            const MDATA = 0x3D3D;
            const MESH_VERSION = 0x3D3E;
            const MASTER_SCALE = 0x0100;
            const MAT_ENTRY = 0xAFFF;
            const MAT_NAME = 0xA000;
            const MAT_AMBIENT = 0xA010;
            const MAT_DIFFUSE = 0xA020;
            const MAT_SPECULAR = 0xA030;
            const MAT_SHININESS = 0xA040;
            const MAT_TRANSPARENCY = 0xA050;
            const MAT_TWO_SIDE = 0xA081;
            const MAT_ADDITIVE = 0xA083;
            const MAT_WIRE = 0xA085;
            const MAT_WIRE_SIZE = 0xA087;
            const MAT_TEXMAP = 0xA200;
            const MAT_OPACMAP = 0xA210;
            const MAT_BUMPMAP = 0xA230;
            const MAT_SPECMAP = 0xA204;
            const MAT_MAPNAME = 0xA300;
            const MAT_MAP_USCALE = 0xA354;
            const MAT_MAP_VSCALE = 0xA356;
            const MAT_MAP_UOFFSET = 0xA358;
            const MAT_MAP_VOFFSET = 0xA35A;
            const NAMED_OBJECT = 0x4000;
            const N_TRI_OBJECT = 0x4100;
            const POINT_ARRAY = 0x4110;
            const FACE_ARRAY = 0x4120;
            const MSH_MAT_GROUP = 0x4130;
            const TEX_VERTS = 0x4140;
            const MESH_MATRIX = 0x4160;
            const KFDATA = 0xB000;
            const OBJECT_NODE_TAG = 0xB002;
            const NODE_HDR = 0xB010;
            const PIVOT = 0xB013;
            const INSTANCE_NAME = 0xB011;
            const POS_TRACK_TAG = 0xB020;
            const ROT_TRACK_TAG = 0xB021;
            const SCL_TRACK_TAG = 0xB022;
            class Loader3DS extends Loader {
                debug;
                group;
                materials;
                _3DSObjectsByName;
                constructor(debug = false, manager = undefined) {
                    super(manager);
                    this.debug = debug;
                    this.group = null;
                    this.materials = [];
                    this._3DSObjectsByName = {};
                }
                load(url, onLoad, onProgress, onError) {
                    const scope = this;
                    const path = (this.path === '') ? LoaderUtils.extractUrlBase(url) : this.path;
                    const loader = new FileLoader(this.manager);
                    loader.setPath(this.path);
                    loader.setResponseType('arraybuffer');
                    loader.setRequestHeader(this.requestHeader);
                    loader.setWithCredentials(this.withCredentials);
                    loader.load(url, function (data) {
                        try {
                            onLoad(scope.parse(data, path));
                        }
                        catch (e) {
                            if (onError) {
                                onError(e);
                            }
                            else {
                                console.error(e);
                            }
                            scope.manager.itemError(url);
                        }
                    }, onProgress, onError);
                }
                parse(arraybuffer, path) {
                    this.group = new Group();
                    this.materials = [];
                    this._3DSObjectsByName = {};
                    this.readFile(arraybuffer, path);
                    let _3DSObjects = Object.values(this._3DSObjectsByName);
                    for (let i = 0; i < _3DSObjects.length; i++) {
                        if (_3DSObjects[i].containsAnimationData) {
                            this.object3DSDataToThreejsMesh(_3DSObjects[i]);
                        }
                    }
                    this.debugMessage('Parsed ' + Object.values(this._3DSObjectsByName).length + ' meshes');
                    return this.group;
                }
                readFile(arraybuffer, path) {
                    const data = new DataView(arraybuffer);
                    const chunk = new Chunk(data, 0, this.debugMessage);
                    if (chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC) {
                        let next = chunk.readChunk();
                        while (next) {
                            if (next.id === M3D_VERSION) {
                                const version = next.readDWord();
                                this.debugMessage('3DS file version: ' + version);
                            }
                            else if (next.id === MDATA) {
                                this.readMeshData(next, path);
                            }
                            else if (next.id == KFDATA) {
                                this.readAnimationData(next);
                            }
                            else {
                                this.debugMessage('Unknown main chunk: ' + next.hexId);
                            }
                            next = chunk.readChunk();
                        }
                    }
                }
                object3DSDataToThreejsMesh(_3DSObject) {
                    let geometryVertices = _3DSObject.geometryVertices;
                    for (let i = 0; i < geometryVertices.length; i++) {
                        this.correctMatrix(_3DSObject);
                        let vertices = geometryVertices[i];
                        let newVertices = [];
                        for (let i = 0; i < vertices.length; i += 3) {
                            const verticeX = vertices[i];
                            const verticeY = vertices[i + 1];
                            const verticeZ = vertices[i + 2];
                            newVertices.push(_3DSObject.matrix.a * verticeX + _3DSObject.matrix.b * verticeY + _3DSObject.matrix.c * verticeZ + _3DSObject.matrix.d);
                            newVertices.push(_3DSObject.matrix.i * verticeX + _3DSObject.matrix.j * verticeY + _3DSObject.matrix.k * verticeZ + _3DSObject.matrix.l);
                            newVertices.push(-(_3DSObject.matrix.e * verticeX + _3DSObject.matrix.f * verticeY + _3DSObject.matrix.g * verticeZ + _3DSObject.matrix.h));
                        }
                        _3DSObject.geometry.setAttribute('position', new Float32BufferAttribute(newVertices, 3));
                    }
                    _3DSObject.geometry.computeVertexNormals();
                    if (_3DSObject.parent_index != null) {
                        _3DSObject.mesh.position.x = _3DSObject.position.x;
                        _3DSObject.mesh.position.z = -_3DSObject.position.y;
                        _3DSObject.mesh.position.y = _3DSObject.position.z;
                        _3DSObject.mesh.scale.x = _3DSObject.scale.x;
                        _3DSObject.mesh.scale.z = _3DSObject.scale.y;
                        _3DSObject.mesh.scale.y = _3DSObject.scale.z;
                        let euler = new Euler(_3DSObject.rotation.x, _3DSObject.rotation.z, _3DSObject.rotation.y, 'XYZ');
                        _3DSObject.mesh.setRotationFromEuler(euler);
                        let _3DSObjects = Object.values(this._3DSObjectsByName);
                        let parentMesh = _3DSObjects[_3DSObject.parent_index].mesh;
                        parentMesh.add(_3DSObject.mesh);
                    }
                    else {
                        this.group.add(_3DSObject.mesh);
                    }
                }
                correctMatrix(_3DSObject) {
                    let a = _3DSObject.matrix.a;
                    let b = _3DSObject.matrix.b;
                    let c = _3DSObject.matrix.c;
                    let d = _3DSObject.matrix.d;
                    let e = _3DSObject.matrix.e;
                    let f = _3DSObject.matrix.f;
                    let g = _3DSObject.matrix.g;
                    let h = _3DSObject.matrix.h;
                    let i = _3DSObject.matrix.i;
                    let j = _3DSObject.matrix.j;
                    let k = _3DSObject.matrix.k;
                    let l = _3DSObject.matrix.l;
                    let det = 1 / (-c * f * i + b * g * i + c * e * j - a * g * j - b * e * k + a * f * k);
                    _3DSObject.matrix.a = (-g * j + f * k) * det;
                    _3DSObject.matrix.b = (c * j - b * k) * det;
                    _3DSObject.matrix.c = (-c * f + b * g) * det;
                    _3DSObject.matrix.d = (d * g * j - c * h * j - d * f * k + b * h * k + c * f * l - b * g * l) * det;
                    _3DSObject.matrix.e = (g * i - e * k) * det;
                    _3DSObject.matrix.f = (-c * i + a * k) * det;
                    _3DSObject.matrix.g = (c * e - a * g) * det;
                    _3DSObject.matrix.h = (c * h * i - d * g * i + d * e * k - a * h * k - c * e * l + a * g * l) * det;
                    _3DSObject.matrix.i = (-f * i + e * j) * det;
                    _3DSObject.matrix.j = (b * i - a * j) * det;
                    _3DSObject.matrix.k = (-b * e + a * f) * det;
                    _3DSObject.matrix.l = (d * f * i - b * h * i - d * e * j + a * h * j + b * e * l - a * f * l) * det;
                    if (_3DSObject.pivot != null) {
                        _3DSObject.matrix.d -= _3DSObject.pivot.x;
                        _3DSObject.matrix.h -= _3DSObject.pivot.y;
                        _3DSObject.matrix.l -= _3DSObject.pivot.z;
                    }
                }
                readAnimationData(chunk) {
                    let next = chunk.readChunk();
                    while (next) {
                        switch (next.id) {
                            case 0xB001:
                            case 0xB002:
                            case 0xB003:
                            case 0xB004:
                            case 0xB005:
                            case 0xB006:
                            case 0xB007:
                                this.readObjectNode(next);
                                break;
                            default:
                                this.debugMessage('Unknown animation chunk: ' + next.hexId);
                                break;
                        }
                        next = chunk.readChunk();
                    }
                }
                readObjectNode(chunk) {
                    let _3DSObject = null;
                    let next = chunk.readChunk();
                    while (next) {
                        if (next.id == NODE_HDR) {
                            _3DSObject = this.readObjectHierarchy(next);
                        }
                        else if (next.id == INSTANCE_NAME) {
                            _3DSObject = this.readObjectName(next);
                        }
                        else if (next.id == PIVOT) {
                            _3DSObject.pivot.x = next.readFloat();
                            _3DSObject.pivot.y = next.readFloat();
                            _3DSObject.pivot.z = next.readFloat();
                        }
                        else if (next.id == POS_TRACK_TAG) {
                            next.position += 20;
                            _3DSObject.position.x = next.readFloat();
                            _3DSObject.position.y = next.readFloat();
                            _3DSObject.position.z = next.readFloat();
                        }
                        else if (next.id == ROT_TRACK_TAG) {
                            next.position += 20;
                            _3DSObject.rotation.w = next.readFloat();
                            _3DSObject.rotation.x = next.readFloat();
                            _3DSObject.rotation.y = next.readFloat();
                            _3DSObject.rotation.z = next.readFloat();
                        }
                        else if (next.id == SCL_TRACK_TAG) {
                            next.position += 20;
                            _3DSObject.scale.x = next.readFloat();
                            _3DSObject.scale.y = next.readFloat();
                            _3DSObject.scale.z = next.readFloat();
                        }
                        next = chunk.readChunk();
                    }
                }
                readObjectHierarchy(chunk) {
                    let objectName = chunk.readString();
                    let _3DSObject = this._3DSObjectsByName[objectName];
                    _3DSObject.containsAnimationData = true;
                    chunk.position += 4;
                    _3DSObject.parent_index = chunk.readShort();
                    if (_3DSObject.parent_index == -1) {
                        _3DSObject.parent_index = null;
                    }
                    return _3DSObject;
                }
                readObjectName(chunk) {
                    let objectName = chunk.readString();
                    let _3DSObject = this._3DSObjectsByName[objectName];
                    _3DSObject.containsAnimationData = true;
                    return _3DSObject;
                }
                readMeshData(chunk, path) {
                    let next = chunk.readChunk();
                    while (next) {
                        if (next.id === MESH_VERSION) {
                            const version = +next.readDWord();
                            this.debugMessage('Mesh Version: ' + version);
                        }
                        else if (next.id === MASTER_SCALE) {
                            const scale = next.readFloat() * 0.01;
                            this.debugMessage('Master scale: ' + scale);
                            this.group.scale.set(scale, scale, scale);
                        }
                        else if (next.id === NAMED_OBJECT) {
                            this.debugMessage('Named Object');
                            this.readNamedObject(next);
                        }
                        else if (next.id === MAT_ENTRY) {
                            this.debugMessage('Material');
                            this.readMaterialEntry(next, path);
                        }
                        else {
                            this.debugMessage('Unknown MDATA chunk: ' + next.hexId);
                        }
                        next = chunk.readChunk();
                    }
                }
                readNamedObject(chunk) {
                    const name = chunk.readString();
                    let next = chunk.readChunk();
                    while (next) {
                        if (next.id === N_TRI_OBJECT) {
                            let new3DSObject = new Object3DS(name);
                            const mesh = this.readMesh(next, new3DSObject);
                            mesh.name = name;
                            new3DSObject.mesh = mesh;
                            this._3DSObjectsByName[name] = new3DSObject;
                        }
                        else {
                            this.debugMessage('Unknown named object chunk: ' + next.hexId);
                        }
                        next = chunk.readChunk();
                    }
                }
                readMaterialEntry(chunk, path) {
                    let next = chunk.readChunk();
                    const material = new MeshPhongMaterial();
                    while (next) {
                        if (next.id === MAT_NAME) {
                            material.name = next.readString();
                            this.debugMessage('   Name: ' + material.name);
                        }
                        else if (next.id === MAT_WIRE) {
                            this.debugMessage('   Wireframe');
                            material.wireframe = true;
                        }
                        else if (next.id === MAT_WIRE_SIZE) {
                            const value = next.readByte();
                            material.wireframeLinewidth = value;
                            this.debugMessage('   Wireframe Thickness: ' + value);
                        }
                        else if (next.id === MAT_TWO_SIDE) {
                            material.side = DoubleSide;
                            this.debugMessage('   DoubleSided');
                        }
                        else if (next.id === MAT_ADDITIVE) {
                            this.debugMessage('   Additive Blending');
                            material.blending = AdditiveBlending;
                        }
                        else if (next.id === MAT_DIFFUSE) {
                            this.debugMessage('   Diffuse Color');
                            material.color = this.readColor(next);
                        }
                        else if (next.id === MAT_SPECULAR) {
                            this.debugMessage('   Specular Color');
                            material.specular = this.readColor(next);
                        }
                        else if (next.id === MAT_AMBIENT) {
                            this.debugMessage('   Ambient color');
                            material.color = this.readColor(next);
                        }
                        else if (next.id === MAT_SHININESS) {
                            const shininess = this.readPercentage(next);
                            material.shininess = shininess * 100;
                            this.debugMessage('   Shininess : ' + shininess);
                        }
                        else if (next.id === MAT_TRANSPARENCY) {
                            const transparency = this.readPercentage(next);
                            material.opacity = 1 - transparency;
                            this.debugMessage('  Transparency : ' + transparency);
                            material.transparent = (material.opacity < 1);
                        }
                        else if (next.id === MAT_TEXMAP) {
                            this.debugMessage('   ColorMap');
                            material.map = this.readMap(next, path);
                        }
                        else if (next.id === MAT_BUMPMAP) {
                            this.debugMessage('   BumpMap');
                            material.bumpMap = this.readMap(next, path);
                        }
                        else if (next.id === MAT_OPACMAP) {
                            this.debugMessage('   OpacityMap');
                            material.alphaMap = this.readMap(next, path);
                        }
                        else if (next.id === MAT_SPECMAP) {
                            this.debugMessage('   SpecularMap');
                            material.specularMap = this.readMap(next, path);
                        }
                        else {
                            this.debugMessage('   Unknown material chunk: ' + next.hexId);
                        }
                        next = chunk.readChunk();
                    }
                    this.materials[material.name] = material;
                }
                readMesh(chunk, _3DSObject) {
                    let next = chunk.readChunk();
                    const geometry = new BufferGeometry();
                    const material = new MeshPhongMaterial();
                    const mesh = new Mesh(geometry, material);
                    mesh.name = 'mesh';
                    _3DSObject.geometry = geometry;
                    while (next) {
                        if (next.id === POINT_ARRAY) {
                            const points = next.readWord();
                            this.debugMessage('   Vertex: ' + points);
                            const vertices = [];
                            for (let i = 0; i < points; i++) {
                                vertices.push(next.readFloat());
                                vertices.push(next.readFloat());
                                vertices.push(next.readFloat());
                            }
                            _3DSObject.geometryVertices.push(vertices);
                        }
                        else if (next.id === FACE_ARRAY) {
                            this.readFaceArray(next, mesh);
                        }
                        else if (next.id === TEX_VERTS) {
                            const texels = next.readWord();
                            this.debugMessage('   UV: ' + texels);
                            const uvs = [];
                            for (let i = 0; i < texels; i++) {
                                uvs.push(next.readFloat());
                                uvs.push(next.readFloat());
                            }
                            geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
                        }
                        else if (next.id === MESH_MATRIX) {
                            _3DSObject.matrix.a = next.readFloat();
                            _3DSObject.matrix.e = next.readFloat();
                            _3DSObject.matrix.i = next.readFloat();
                            _3DSObject.matrix.b = next.readFloat();
                            _3DSObject.matrix.f = next.readFloat();
                            _3DSObject.matrix.j = next.readFloat();
                            _3DSObject.matrix.c = next.readFloat();
                            _3DSObject.matrix.g = next.readFloat();
                            _3DSObject.matrix.k = next.readFloat();
                            _3DSObject.matrix.d = next.readFloat();
                            _3DSObject.matrix.h = next.readFloat();
                            _3DSObject.matrix.l = next.readFloat();
                        }
                        else {
                            this.debugMessage('   Unknown mesh chunk: ' + next.hexId);
                        }
                        next = chunk.readChunk();
                    }
                    return mesh;
                }
                readFaceArray(chunk, mesh) {
                    const faces = chunk.readWord();
                    this.debugMessage('   Faces: ' + faces);
                    const indexes = [];
                    for (let i = 0; i < faces; ++i) {
                        indexes.push(chunk.readWord(), chunk.readWord(), chunk.readWord());
                        chunk.readWord();
                    }
                    console.log("index count", indexes.length);
                    let materialIndex = 0;
                    let start = 0;
                    let newIndexes = [];
                    while (!chunk.endOfChunk) {
                        const subchunk = chunk.readChunk();
                        if (subchunk.id === MSH_MAT_GROUP) {
                            this.debugMessage('      Material Group');
                            const group = this.readMaterialGroup(subchunk);
                            const groupIndexCount = group.index.length;
                            console.log("jea", groupIndexCount);
                            for (let i = 0; i < groupIndexCount; ++i) {
                                const triangleIndex = group.index[i];
                                newIndexes.push(indexes[triangleIndex * 3]);
                                newIndexes.push(indexes[triangleIndex * 3 + 1]);
                                newIndexes.push(indexes[triangleIndex * 3 + 2]);
                                indexes[triangleIndex * 3] = null;
                                indexes[triangleIndex * 3 + 1] = null;
                                indexes[triangleIndex * 3 + 2] = null;
                            }
                            const count = groupIndexCount * 3;
                            mesh.geometry.addGroup(start, count, materialIndex);
                            start += count;
                            materialIndex++;
                            const material = this.materials[group.name];
                            if (Array.isArray(mesh.material) === false)
                                mesh.material = [];
                            if (material !== undefined) {
                                mesh.material.push(material);
                            }
                        }
                        else {
                            this.debugMessage('      Unknown face array chunk: ' + subchunk.hexId);
                        }
                    }
                    for (let i = 0; i < indexes.length; ++i) {
                        const index = indexes[i];
                        if (index != null) {
                            newIndexes.push(index);
                        }
                    }
                    console.log(newIndexes);
                    mesh.geometry.setIndex(newIndexes);
                    if (mesh.material.length === 1)
                        mesh.material = mesh.material[0];
                }
                readMap(chunk, path) {
                    let next = chunk.readChunk();
                    let texture = null;
                    const loader = new TextureLoader(this.manager);
                    loader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);
                    while (next) {
                        if (next.id === MAT_MAPNAME) {
                            const name = next.readString();
                            texture = loader.load(name);
                            this.debugMessage('      File: ' + path + name);
                        }
                        else {
                            if (texture == null) {
                                texture = new Texture();
                            }
                            if (next.id === MAT_MAP_UOFFSET) {
                                texture.offset.x = next.readFloat();
                                this.debugMessage('      OffsetX: ' + texture.offset.x);
                            }
                            else if (next.id === MAT_MAP_VOFFSET) {
                                texture.offset.y = next.readFloat();
                                this.debugMessage('      OffsetY: ' + texture.offset.y);
                            }
                            else if (next.id === MAT_MAP_USCALE) {
                                texture.repeat.x = next.readFloat();
                                this.debugMessage('      RepeatX: ' + texture.repeat.x);
                            }
                            else if (next.id === MAT_MAP_VSCALE) {
                                texture.repeat.y = next.readFloat();
                                this.debugMessage('      RepeatY: ' + texture.repeat.y);
                            }
                            else {
                                this.debugMessage('      Unknown map chunk: ' + next.hexId);
                            }
                        }
                        next = chunk.readChunk();
                    }
                    return texture;
                }
                readMaterialGroup(chunk) {
                    const name = chunk.readString();
                    const numFaces = chunk.readWord();
                    this.debugMessage('         Name: ' + name);
                    this.debugMessage('         Faces: ' + numFaces);
                    const index = [];
                    for (let i = 0; i < numFaces; ++i) {
                        index.push(chunk.readWord());
                    }
                    return { name: name, index: index };
                }
                readColor(chunk) {
                    const subChunk = chunk.readChunk();
                    const color = new Color();
                    if (subChunk.id === COLOR_24 || subChunk.id === LIN_COLOR_24) {
                        const r = subChunk.readByte();
                        const g = subChunk.readByte();
                        const b = subChunk.readByte();
                        color.setRGB(r / 255, g / 255, b / 255);
                        this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
                    }
                    else if (subChunk.id === COLOR_F || subChunk.id === LIN_COLOR_F) {
                        const r = subChunk.readFloat();
                        const g = subChunk.readFloat();
                        const b = subChunk.readFloat();
                        color.setRGB(r, g, b);
                        this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
                    }
                    else {
                        this.debugMessage('      Unknown color chunk: ' + subChunk.hexId);
                    }
                    return color;
                }
                readPercentage(chunk) {
                    const subChunk = chunk.readChunk();
                    switch (subChunk.id) {
                        case INT_PERCENTAGE:
                            return (subChunk.readShort() / 100);
                        case FLOAT_PERCENTAGE:
                            return subChunk.readFloat();
                        default:
                            this.debugMessage('      Unknown percentage chunk: ' + subChunk.hexId);
                            return 0;
                    }
                }
                debugMessage(message) {
                    if (this.debug) {
                        console.log(message);
                    }
                }
            }
            resources.Loader3DS = Loader3DS;
            class Object3DS {
                name;
                mesh;
                geometry;
                matrix;
                geometryVertices;
                parent_index;
                containsAnimationData;
                pivot;
                position;
                rotation;
                scale;
                constructor(name) {
                    this.name = name;
                    this.mesh = null;
                    this.geometry = null;
                    this.matrix = new Matrix3DS();
                    this.geometryVertices = [];
                    this.parent_index = null;
                    this.containsAnimationData = false;
                    this.pivot = new Vector3DS();
                    this.position = new Vector3DS();
                    this.rotation = new Vector4DS();
                    this.scale = new Vector3DS();
                }
            }
            class Vector3DS {
                x;
                y;
                z;
                constructor(x = 0.0, y = 0.0, z = 0.0) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
            }
            class Vector4DS {
                x;
                y;
                z;
                w;
                constructor(x = 0.0, y = 0.0, z = 0.0, w = 0.0) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    this.w = w;
                }
            }
            class Matrix3DS {
                a;
                e;
                i;
                b;
                f;
                j;
                c;
                g;
                k;
                d;
                h;
                l;
                constructor() {
                    this.a = 0.0;
                    this.e = 0.0;
                    this.i = 0.0;
                    this.b = 0.0;
                    this.f = 0.0;
                    this.j = 0.0;
                    this.c = 0.0;
                    this.g = 0.0;
                    this.k = 0.0;
                    this.d = 0.0;
                    this.h = 0.0;
                    this.l = 0.0;
                }
            }
            class Chunk {
                data;
                offset;
                position;
                debugMessage;
                id;
                size;
                end;
                constructor(data, position, debugMessage) {
                    this.data = data;
                    this.offset = position;
                    this.position = position;
                    this.debugMessage = debugMessage;
                    if (this.debugMessage instanceof Function) {
                        this.debugMessage = function () {
                        };
                    }
                    this.id = this.readWord();
                    this.size = this.readDWord();
                    this.end = this.offset + this.size;
                    if (this.end > data.byteLength) {
                        this.debugMessage('Bad chunk size for chunk at ' + position);
                    }
                }
                readChunk() {
                    if (this.endOfChunk) {
                        return null;
                    }
                    try {
                        const next = new Chunk(this.data, this.position, this.debugMessage);
                        this.position += next.size;
                        return next;
                    }
                    catch (e) {
                        this.debugMessage('Unable to read chunk at ' + this.position);
                        return null;
                    }
                }
                get hexId() {
                    return this.id.toString(16);
                }
                get endOfChunk() {
                    return this.position >= this.end;
                }
                readByte() {
                    const v = this.data.getUint8(this.position);
                    this.position += 1;
                    return v;
                }
                readFloat() {
                    try {
                        const v = this.data.getFloat32(this.position, true);
                        this.position += 4;
                        return v;
                    }
                    catch (e) {
                        this.debugMessage(e + ' ' + this.position + ' ' + this.data.byteLength);
                        return 0;
                    }
                }
                readInt() {
                    const v = this.data.getInt32(this.position, true);
                    this.position += 4;
                    return v;
                }
                readShort() {
                    const v = this.data.getInt16(this.position, true);
                    this.position += 2;
                    return v;
                }
                readDWord() {
                    const v = this.data.getUint32(this.position, true);
                    this.position += 4;
                    return v;
                }
                readWord() {
                    const v = this.data.getUint16(this.position, true);
                    this.position += 2;
                    return v;
                }
                readString() {
                    let s = '';
                    let c = this.readByte();
                    while (c) {
                        s += String.fromCharCode(c);
                        c = this.readByte();
                    }
                    return s;
                }
            }
        })(resources = engine.resources || (engine.resources = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
var gameengine;
(function (gameengine) {
    var engine;
    (function (engine) {
        var resources;
        (function (resources) {
            var GameObject = gameengine.gameObject.GameObject;
            var MeshRenderer = gameengine.engine.components.MeshRenderer;
            var Mesh = THREE.Mesh;
            var Transform3D = gameengine.engine.components.Transform3D;
            class MeshLoader {
                static loader3DS = new resources.Loader3DS();
                static loaderFBX = new FBXLoader();
                static loadMesh(type, url, callback) {
                    const meshObject = new GameObject();
                    meshObject.addComponent(Transform3D).setNewObject3D();
                    switch (type) {
                        case "3ds":
                            this.loader3DS.load(url, (object3d) => this.onObjectsLoaded(object3d, meshObject, callback), undefined, this.onError);
                            break;
                        case "fbx":
                            this.loaderFBX.load(url, (object3d) => this.onObjectsLoaded(object3d, meshObject, callback), undefined, this.onError);
                            break;
                    }
                }
                static onObjectsLoaded(object3d, gameObject, callback) {
                    this.traverseAndBuildTree(object3d, gameObject);
                    callback(gameObject);
                }
                static traverseAndBuildTree(parent3d, mainObject) {
                    parent3d.traverse((object3d) => {
                        if (object3d == parent3d)
                            return;
                        const gameObject = new GameObject();
                        mainObject.addChild(gameObject);
                        if (object3d instanceof Mesh) {
                            const meshRenderer = gameObject.addComponent(MeshRenderer);
                            meshRenderer.initGeometry(object3d.geometry);
                        }
                        else {
                            gameObject.addComponent(Transform3D).setObject3D(object3d);
                        }
                        this.traverseAndBuildTree(object3d, gameObject);
                    });
                }
                static onError(error) {
                    throw new Error(String(error));
                }
            }
            resources.MeshLoader = MeshLoader;
        })(resources = engine.resources || (engine.resources = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
const int = (value) => {
    return Math.floor(Number(value));
};
//# sourceMappingURL=lib.js.map