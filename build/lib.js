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
        var Scene = THREE.Scene;
        class GameScene extends GameObject {
            constructor() {
                super(...arguments);
                this._running = false;
                this._enterFrameBind = this.enterFrame.bind(this);
                this._lastUpdateTime = 0;
                this._scene = new Scene();
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
            TextureMaterial.MESH_BASIC = "meshBasic";
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
            MeshRenderer.DUMMY_MATERIAL = new TextureMaterial(TextureMaterial.MESH_BASIC, new Image(1, 1));
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
        var resources;
        (function (resources) {
            var FileLoader = THREE.FileLoader;
            var Vector3 = THREE.Vector3;
            var Mesh = THREE.Mesh;
            const CHUNK_MAIN = 19789;
            const CHUNK_VERSION = 2;
            const CHUNK_SCENE = 15677;
            const CHUNK_ANIMATION = 45056;
            const CHUNK_OBJECT = 16384;
            const CHUNK_TRIMESH = 16640;
            const CHUNK_VERTICES = 16656;
            const CHUNK_FACES = 16672;
            const CHUNK_FACESMATERIAL = 16688;
            const CHUNK_FACESSMOOTH = 16720;
            const CHUNK_MAPPINGCOORDS = 16704;
            const CHUNK_TRANSFORMATION = 16736;
            const CHUNK_MATERIAL = 45055;
            function bytesAvailable(data) {
                return data.byteLength - data.position;
            }
            class Parser3DS {
                constructor() {
                    this.objectDatas = {};
                    this.animationDatas = [];
                    this.materialDatas = {};
                    this.objects = [];
                    this.parents = [];
                    this.materials = [];
                    this.textureMaterials = [];
                }
                load(url, onLoad, onProgress, onError) {
                    const loader = new FileLoader();
                    loader.setResponseType('arraybuffer');
                    loader.load(url, data => {
                        onLoad(this.parse(data));
                    }, onProgress, onError);
                }
                parse(data) {
                    data.position = 0;
                    if (bytesAvailable(data) < 6)
                        return;
                    this.data = data;
                    this.dataView = new DataView(data);
                    this.parse3DSChunk(data.position, bytesAvailable(data));
                    this.objects = [];
                    this.parents = [];
                    this.materials = [];
                    this.textureMaterials = [];
                    this.buildContent();
                    data = null;
                    this.objectDatas = null;
                    this.animationDatas = null;
                    this.materialDatas = null;
                    return this.objects;
                }
                parse3DSChunk(dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    this.data.position = dataPosition;
                    switch (chunkInfo.id) {
                        case CHUNK_MAIN:
                            this.parseMainChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
                    }
                    this.parse3DSChunk(chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                readChunkInfo(dataPosition) {
                    this.data.position = dataPosition;
                    const chunkInfo = {};
                    chunkInfo.id = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    chunkInfo.size = this.dataView.getUint32(this.data.position, true);
                    this.data.position += 4;
                    chunkInfo.dataSize = chunkInfo.size - 6;
                    chunkInfo.dataPosition = this.data.position;
                    chunkInfo.nextChunkPosition = dataPosition + chunkInfo.size;
                    return chunkInfo;
                }
                parseMainChunk(dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case CHUNK_VERSION:
                            break;
                        case CHUNK_SCENE:
                            this.parse3DChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
                            break;
                        case CHUNK_ANIMATION:
                            this.parseAnimationChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
                    }
                    this.parseMainChunk(chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parse3DChunk(dataPosition, bytesAvailable) {
                    let chunkInfo;
                    let material;
                    while (bytesAvailable >= 6) {
                        chunkInfo = this.readChunkInfo(dataPosition);
                        switch (chunkInfo.id) {
                            case CHUNK_MATERIAL:
                                material = {};
                                this.parseMaterialChunk(material, chunkInfo.dataPosition, chunkInfo.dataSize);
                                break;
                            case CHUNK_OBJECT:
                                this.parseObject(chunkInfo);
                        }
                        dataPosition = chunkInfo.nextChunkPosition;
                        bytesAvailable = bytesAvailable - chunkInfo.size;
                    }
                }
                parseMaterialChunk(material, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case 40960:
                            this.parseMaterialName(material);
                            break;
                        case 40992:
                            this.data.position = chunkInfo.dataPosition + 6;
                            material.color =
                                (this.dataView.getUint8(this.data.position) << 16) +
                                    (this.dataView.getUint8(this.data.position + 2) << 8) +
                                    this.dataView.getUint8(this.data.position + 4);
                            this.data.position += 6;
                            break;
                        case 41024:
                            this.data.position = chunkInfo.dataPosition + 6;
                            material.glossiness = this.dataView.getUint16(this.data.position, true);
                            this.data.position += 2;
                            break;
                        case 41025:
                            this.data.position = chunkInfo.dataPosition + 6;
                            material.specular = this.dataView.getUint16(this.data.position, true);
                            this.data.position += 2;
                            break;
                        case 41040:
                            this.data.position = chunkInfo.dataPosition + 6;
                            material.transparency = this.dataView.getUint16(this.data.position, true);
                            this.data.position += 2;
                            break;
                        case 41472:
                            material.diffuseMap = {
                                scaleU: 1,
                                scaleV: 1,
                                offsetU: 0,
                                offsetV: 0,
                                rotation: 0
                            };
                            this.parseMapChunk(material.name, material.diffuseMap, chunkInfo.dataPosition, chunkInfo.dataSize);
                            break;
                        case 41488:
                            material.opacityMap = {
                                scaleU: 1,
                                scaleV: 1,
                                offsetU: 0,
                                offsetV: 0,
                                rotation: 0
                            };
                            this.parseMapChunk(material.name, material.opacityMap, chunkInfo.dataPosition, chunkInfo.dataSize);
                            break;
                        case 41504:
                    }
                    this.parseMaterialChunk(material, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parseMaterialName(material) {
                    if (this.materialDatas == null)
                        this.materialDatas = {};
                    material.name = this.getString(this.data.position);
                    this.materialDatas[material.name] = material;
                }
                getString(index) {
                    let charCode = 0;
                    this.data.position = index;
                    let res = '';
                    while (this.dataView.getInt8(this.data.position) !== 0) {
                        charCode = this.dataView.getInt8(this.data.position);
                        this.data.position++;
                        res += String.fromCharCode(charCode);
                    }
                    this.data.position++;
                    return res;
                }
                parseMapChunk(materialName, map, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case 41728:
                            map.filename = this.getString(chunkInfo.dataPosition).toLowerCase();
                            break;
                        case 41812:
                            map.scaleU = this.dataView.getFloat32(this.data.position, true);
                            this.data.position += 4;
                            break;
                        case 41814:
                            map.scaleV = this.dataView.getFloat32(this.data.position, true);
                            this.data.position += 4;
                            break;
                        case 41816:
                            map.offsetU = this.dataView.getFloat32(this.data.position, true);
                            this.data.position += 4;
                            break;
                        case 41818:
                            map.offsetV = this.dataView.getFloat32(this.data.position, true);
                            this.data.position += 4;
                            break;
                        case 41820:
                            map.rotation = this.dataView.getFloat32(this.data.position, true);
                            this.data.position += 4;
                    }
                    this.parseMapChunk(materialName, map, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parseObject(chunkInfo) {
                    if (this.objectDatas == null)
                        this.objectDatas = {};
                    const object = {};
                    object.name = this.getString(chunkInfo.dataPosition);
                    this.objectDatas[object.name] = object;
                    const offset = object.name.length + 1;
                    this.parseObjectChunk(object, chunkInfo.dataPosition + offset, chunkInfo.dataSize - offset);
                }
                parseObjectChunk(object, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case CHUNK_TRIMESH:
                            this.parseMeshChunk(object, chunkInfo.dataPosition, chunkInfo.dataSize);
                            break;
                        case 18176:
                    }
                    this.parseObjectChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parseMeshChunk(object, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case CHUNK_VERTICES:
                            this.parseVertices(object);
                            break;
                        case CHUNK_MAPPINGCOORDS:
                            this.parseUVs(object);
                            break;
                        case CHUNK_TRANSFORMATION:
                            this.parseMatrix(object);
                            break;
                        case CHUNK_FACES:
                            this.parseFaces(object, chunkInfo);
                    }
                    this.parseMeshChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parseVertices(object) {
                    const num = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    object.vertices = new Float32Array(num * 3);
                    let j = 0;
                    for (let i = 0; i < num; i++) {
                        object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                        this.data.position += 4;
                        object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                        this.data.position += 4;
                        object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                        this.data.position += 4;
                    }
                }
                parseUVs(object) {
                    const num = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    object.uvs = new Float32Array(num * 2);
                    let j = 0;
                    for (let i = 0; i < num; i++) {
                        object.uvs[j++] = this.dataView.getFloat32(this.data.position, true);
                        this.data.position += 4;
                        object.uvs[j++] = this.dataView.getFloat32(this.data.position, true);
                        this.data.position += 4;
                    }
                }
                parseMatrix(object) {
                    object.a = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.e = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.i = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.b = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.f = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.j = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.c = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.g = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.k = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.d = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.h = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    object.l = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                }
                parseFaces(object, chunkInfo) {
                    const num = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    object.faces = [];
                    object.smoothingGroups = [];
                    let j = 0;
                    for (let i = 0; i < num; i++) {
                        object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                        this.data.position += 2;
                        object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                        this.data.position += 2;
                        object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                        this.data.position += 4;
                    }
                    const offset = 2 + 8 * num;
                    this.parseFacesChunk(object, chunkInfo.dataPosition + offset, chunkInfo.dataSize - offset);
                }
                parseFacesChunk(object, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case CHUNK_FACESMATERIAL:
                            this.parseSurface(object);
                            break;
                        case CHUNK_FACESSMOOTH:
                            this.parseSmoothingGroups(object);
                    }
                    this.parseFacesChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                parseSurface(object) {
                    if (object.surfaces == null)
                        object.surfaces = {};
                    const surface = [];
                    object.surfaces[this.getString(this.data.position)] = surface;
                    const num = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    for (let i = 0; i < num; i++) {
                        surface[i] = this.dataView.getUint16(this.data.position, true);
                        this.data.position += 2;
                    }
                }
                parseSmoothingGroups(object) {
                    const len = object.faces.length / 3;
                    for (let i = 0; i < len; i++) {
                        object.smoothingGroups[i] = this.dataView.getUint32(this.data.position, true);
                    }
                }
                parseAnimationChunk(dataPosition, bytesAvailable) {
                    let chunkInfo;
                    let animation;
                    while (bytesAvailable >= 6) {
                        chunkInfo = this.readChunkInfo(dataPosition);
                        switch (chunkInfo.id) {
                            case 45057:
                            case 45058:
                            case 45059:
                            case 45060:
                            case 45061:
                            case 45062:
                            case 45063:
                                if (this.animationDatas == null) {
                                    this.animationDatas = [];
                                }
                                animation = {};
                                this.animationDatas.push(animation);
                                this.parseObjectAnimationChunk(animation, chunkInfo.dataPosition, chunkInfo.dataSize);
                                break;
                            case 45064:
                        }
                        dataPosition = chunkInfo.nextChunkPosition;
                        bytesAvailable = bytesAvailable - chunkInfo.size;
                    }
                }
                parseObjectAnimationChunk(animation, dataPosition, bytesAvailable) {
                    if (bytesAvailable < 6)
                        return;
                    const chunkInfo = this.readChunkInfo(dataPosition);
                    switch (chunkInfo.id) {
                        case 45072:
                            animation.objectName = this.getString(this.data.position);
                            this.data.position += 4;
                            animation.parentIndex = this.dataView.getUint16(this.data.position, true);
                            this.data.position += 2;
                            break;
                        case 45073:
                            animation.objectName = this.getString(this.data.position);
                            break;
                        case 45075:
                            animation.pivot = new THREE.Vector3(this.dataView.getFloat32(this.data.position, true), this.dataView.getFloat32(this.data.position + 4, true), this.dataView.getFloat32(this.data.position + 8, true));
                            this.data.position += 12;
                            break;
                        case 45088:
                            this.data.position = this.data.position + 20;
                            animation.position = new THREE.Vector3(this.dataView.getFloat32(this.data.position, true), this.dataView.getFloat32(this.data.position + 4, true), this.dataView.getFloat32(this.data.position + 8, true));
                            this.data.position += 12;
                            break;
                        case 45089:
                            this.data.position = this.data.position + 20;
                            animation.rotation = this.getRotationFrom3DSAngleAxis(this.dataView.getFloat32(this.data.position, true), this.dataView.getFloat32(this.data.position + 4, true), this.dataView.getFloat32(this.data.position + 8, true), this.dataView.getFloat32(this.data.position + 12, true));
                            this.data.position += 16;
                            break;
                        case 45090:
                            this.data.position = this.data.position + 20;
                            animation.scale = new THREE.Vector3(this.dataView.getFloat32(this.data.position, true), this.dataView.getFloat32(this.data.position + 4, true), this.dataView.getFloat32(this.data.position + 8, true));
                            this.data.position += 12;
                    }
                    this.parseObjectAnimationChunk(animation, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
                }
                getRotationFrom3DSAngleAxis(angle, x, z, y) {
                    let half;
                    const res = new Vector3();
                    const s = Math.sin(angle);
                    const c = Math.cos(angle);
                    const t = 1 - c;
                    const k = x * y * t + z * s;
                    if (k >= 1) {
                        half = angle / 2;
                        res.z = -2 * Math.atan2(x * Math.sin(half), Math.cos(half));
                        res.y = -Math.PI / 2;
                        res.x = 0;
                        return res;
                    }
                    if (k <= -1) {
                        half = angle / 2;
                        res.z = 2 * Math.atan2(x * Math.sin(half), Math.cos(half));
                        res.y = Math.PI / 2;
                        res.x = 0;
                        return res;
                    }
                    res.z = -Math.atan2(y * s - x * z * t, 1 - (y * y + z * z) * t);
                    res.y = -Math.asin(x * y * t + z * s);
                    res.x = -Math.atan2(x * s - y * z * t, 1 - (x * x + z * z) * t);
                    return res;
                }
                buildContent() {
                    let objectName = null;
                    let objectData = null;
                    let object = null;
                    let i = 0;
                    let length = 0;
                    let animationData = null;
                    let j = 0;
                    let nameCounter = 0;
                    let animationData2 = null;
                    let newObjectData = null;
                    let newName = null;
                    if (this.animationDatas[0] !== undefined) {
                        if (this.objectDatas !== null) {
                            length = this.animationDatas.length;
                            for (i = 0; i < length; i++) {
                                animationData = this.animationDatas[i];
                                objectName = animationData.objectName;
                                objectData = this.objectDatas[objectName];
                                if (objectData !== null) {
                                    for (j = i + 1, nameCounter = 1; j < length; j++) {
                                        animationData2 = this.animationDatas[j];
                                        if (!animationData2.isInstance && objectName == animationData2.objectName) {
                                            newObjectData = {};
                                            newName = objectName + nameCounter++;
                                            newObjectData.name = newName;
                                            this.objectDatas[newName] = newObjectData;
                                            animationData2.objectName = newName;
                                            newObjectData.vertices = objectData.vertices;
                                            newObjectData.uvs = objectData.uvs;
                                            newObjectData.faces = objectData.faces;
                                            newObjectData.smoothingGroups = objectData.smoothingGroups;
                                            newObjectData.surfaces = objectData.surfaces;
                                            newObjectData.a = objectData.a;
                                            newObjectData.b = objectData.b;
                                            newObjectData.c = objectData.c;
                                            newObjectData.d = objectData.d;
                                            newObjectData.e = objectData.e;
                                            newObjectData.f = objectData.f;
                                            newObjectData.g = objectData.g;
                                            newObjectData.h = objectData.h;
                                            newObjectData.i = objectData.i;
                                            newObjectData.j = objectData.j;
                                            newObjectData.k = objectData.k;
                                            newObjectData.l = objectData.l;
                                        }
                                    }
                                }
                                if (objectData !== null && objectData.vertices !== null) {
                                    object = new Mesh();
                                    this.buildMesh(object, objectData, animationData);
                                }
                                else {
                                    object = new Mesh();
                                }
                                object.name = objectName;
                                animationData.object = object;
                                if (animationData.position !== null) {
                                    object.position.x = animationData.position.x;
                                    object.position.y = animationData.position.y;
                                    object.position.z = animationData.position.z;
                                }
                                if (animationData.rotation !== null) {
                                    object.rotation.x = animationData.rotation.x;
                                    object.rotation.y = animationData.rotation.y;
                                    object.rotation.z = animationData.rotation.z;
                                }
                                if (animationData.scale !== null) {
                                    object.scale.x = animationData.scale.x;
                                    object.scale.y = animationData.scale.y;
                                    object.scale.z = animationData.scale.z;
                                }
                                this.objects.push(object);
                            }
                        }
                    }
                    else {
                        for (objectName in this.objectDatas) {
                            objectData = this.objectDatas[objectName];
                            if (objectData.vertices !== null) {
                                object = new Mesh();
                                object.name = objectName;
                                this.buildMesh(object, objectData, null);
                                this.objects.push(object);
                            }
                        }
                    }
                }
                buildMesh(mesh, objectData, animationData) {
                    let geometry = new THREE.BufferGeometry();
                    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    mesh.geometry = geometry;
                    mesh.material = material;
                    let n = 0;
                    let m = 0;
                    let len = 0;
                    let a;
                    let b;
                    let c;
                    let d;
                    let e;
                    let f;
                    let g;
                    let h;
                    let i;
                    let j;
                    let k;
                    let l;
                    let det;
                    let x;
                    let y;
                    let z;
                    let vertices = [];
                    let uvs = [];
                    let correct = false;
                    if (animationData !== null) {
                        a = objectData.a;
                        b = objectData.b;
                        c = objectData.c;
                        d = objectData.d;
                        e = objectData.e;
                        f = objectData.f;
                        g = objectData.g;
                        h = objectData.h;
                        i = objectData.i;
                        j = objectData.j;
                        k = objectData.k;
                        l = objectData.l;
                        det = 1 / (-c * f * i + b * g * i + c * e * j - a * g * j - b * e * k + a * f * k);
                        objectData.a = (-g * j + f * k) * det;
                        objectData.b = (c * j - b * k) * det;
                        objectData.c = (-c * f + b * g) * det;
                        objectData.d = (d * g * j - c * h * j - d * f * k + b * h * k + c * f * l - b * g * l) * det;
                        objectData.e = (g * i - e * k) * det;
                        objectData.f = (-c * i + a * k) * det;
                        objectData.g = (c * e - a * g) * det;
                        objectData.h = (c * h * i - d * g * i + d * e * k - a * h * k - c * e * l + a * g * l) * det;
                        objectData.i = (-f * i + e * j) * det;
                        objectData.j = (b * i - a * j) * det;
                        objectData.k = (-b * e + a * f) * det;
                        objectData.l = (d * f * i - b * h * i - d * e * j + a * h * j + b * e * l - a * f * l) * det;
                        if (animationData.pivot !== null) {
                            objectData.d = objectData.d - animationData.pivot.x;
                            objectData.h = objectData.h - animationData.pivot.y;
                            objectData.l = objectData.l - animationData.pivot.z;
                        }
                        correct = true;
                    }
                    if (objectData.vertices !== null) {
                        n = 0;
                        m = 0;
                        len = objectData.vertices.length;
                        while (n < len) {
                            if (correct) {
                                x = objectData.vertices[n++];
                                y = objectData.vertices[n++];
                                z = objectData.vertices[n++];
                                vertices.push(objectData.a * x + objectData.b * y + objectData.c * z + objectData.d);
                                vertices.push(objectData.e * x + objectData.f * y + objectData.g * z + objectData.h);
                                vertices.push(objectData.i * x + objectData.j * y + objectData.k * z + objectData.l);
                            }
                            else {
                                vertices.push(objectData.vertices[n++]);
                                vertices.push(objectData.vertices[n++]);
                                vertices.push(objectData.vertices[n++]);
                            }
                            if (objectData.uvs) {
                                uvs.push(objectData.uvs[m++]);
                                uvs.push(1 - objectData.uvs[m++]);
                            }
                        }
                        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                    }
                    if (objectData.faces !== null) {
                        n = 0;
                        m = 0;
                        len = objectData.faces.length;
                        let index = [];
                        while (n < len) {
                            index.push(objectData.faces[n++], objectData.faces[n++], objectData.faces[n++]);
                            mesh.geometry.setIndex(index);
                        }
                    }
                    geometry.computeVertexNormals();
                }
            }
            resources.Parser3DS = Parser3DS;
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
            var ObjectLoader = THREE.ObjectLoader;
            class MeshLoader {
                static loadMesh(type, url, callback) {
                    const meshObject = new GameObject();
                    switch (type) {
                        case "3ds":
                            this.parser3ds.load(url, (objects) => this.onObjectsLoaded(objects, meshObject, callback), undefined, this.onError);
                            break;
                        default:
                            this.objectLoader.load(url, (object) => this.onObjectsLoaded([object], meshObject, callback));
                            break;
                    }
                }
                static onObjectsLoaded(objects, gameObject, callback) {
                    let mainReady = false;
                    for (let object of objects) {
                        if (object instanceof Mesh) {
                            if (!mainReady) {
                                this.createMeshRendererFromMesh3D(gameObject, object);
                            }
                            else {
                                this.createChildGameObjectFromMesh(gameObject, object);
                            }
                        }
                        object.traverse((child) => {
                            if (child != object && child instanceof Mesh) {
                                this.createChildGameObjectFromMesh(gameObject, child);
                            }
                        });
                    }
                    callback(gameObject);
                }
                static createChildGameObjectFromMesh(parentObject, mesh) {
                    const childObject = new GameObject();
                    parentObject.addChild(childObject);
                    this.createMeshRendererFromMesh3D(childObject, mesh);
                }
                static createMeshRendererFromMesh3D(object3d, mesh) {
                    const meshRenderer = object3d.addComponent(MeshRenderer);
                    meshRenderer.initGeometry(mesh.geometry);
                }
                static onError(error) {
                    throw new Error(String(error));
                }
            }
            MeshLoader.parser3ds = new resources.Parser3DS();
            MeshLoader.objectLoader = new ObjectLoader();
            resources.MeshLoader = MeshLoader;
        })(resources = engine.resources || (engine.resources = {}));
    })(engine = gameengine.engine || (gameengine.engine = {}));
})(gameengine || (gameengine = {}));
const int = (value) => {
    return Math.floor(Number(value));
};
//# sourceMappingURL=lib.js.map