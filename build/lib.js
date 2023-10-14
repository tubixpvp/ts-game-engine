var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("gameObject/IGameObject", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("components/Component", [], function (exports_2, context_2) {
    "use strict";
    var Component;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            Component = /** @class */ (function () {
                function Component() {
                }
                /**
                 * Calls when component is attached
                 * @param {IGameObject} gameObject The object that the component is attached
                 */
                Component.prototype.attached = function (gameObject) {
                };
                /**
                 * Calls before first frame update. Does not do anything. Override if need
                 * */
                Component.prototype.init = function () {
                };
                /**
                 * Calls every frame update. Does not do anything. Override if need
                 *
                 * @param {number} deltaMs Number of milliseconds that have passed since the last update
                 * */
                Component.prototype.update = function (deltaMs) {
                };
                return Component;
            }());
            exports_2("Component", Component);
        }
    };
});
System.register("engine/components/ITransform", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/math/Vector2", [], function (exports_4, context_4) {
    "use strict";
    var Vector2;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            Vector2 = /** @class */ (function () {
                function Vector2() {
                    this.x = 0;
                    this.y = 0;
                }
                Vector2.prototype.copyFrom = function (vec) {
                    this.x = vec.x;
                    this.y = vec.y;
                };
                return Vector2;
            }());
            exports_4("Vector2", Vector2);
        }
    };
});
System.register("engine/components/Transform2D", ["components/Component", "engine/math/Vector2"], function (exports_5, context_5) {
    "use strict";
    var Component_1, Vector2_1, Transform2D;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (Component_1_1) {
                Component_1 = Component_1_1;
            },
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            }
        ],
        execute: function () {
            Transform2D = /** @class */ (function (_super) {
                __extends(Transform2D, _super);
                function Transform2D() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position = new Vector2_1.Vector2();
                    _this.rotation = new Vector2_1.Vector2();
                    return _this;
                }
                return Transform2D;
            }(Component_1.Component));
            exports_5("Transform2D", Transform2D);
        }
    };
});
System.register("engine/components/Transform3D", ["components/Component", "three"], function (exports_6, context_6) {
    "use strict";
    var Component_2, three_1, Transform3D;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (Component_2_1) {
                Component_2 = Component_2_1;
            },
            function (three_1_1) {
                three_1 = three_1_1;
            }
        ],
        execute: function () {
            Transform3D = /** @class */ (function (_super) {
                __extends(Transform3D, _super);
                function Transform3D() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position = new three_1.Vector3();
                    _this.rotation = new three_1.Vector3();
                    return _this;
                }
                Transform3D.prototype.setObject3D = function (object3d) {
                    this.object3d = object3d;
                };
                Transform3D.prototype.update = function (deltaMs) {
                    this.object3d.position.copy(this.position);
                    this.object3d.rotation.x = this.rotation.x;
                    this.object3d.rotation.y = this.rotation.y;
                    this.object3d.rotation.z = this.rotation.z;
                };
                Transform3D.init = function (gameObject, object3d) {
                    var transform3 = gameObject.getComponent(Transform3D);
                    if (transform3 == null) {
                        transform3 = gameObject.addComponent(Transform3D);
                    }
                    transform3.setObject3D(object3d);
                };
                return Transform3D;
            }(Component_2.Component));
            exports_6("Transform3D", Transform3D);
        }
    };
});
System.register("gameObject/GameObject", [], function (exports_7, context_7) {
    "use strict";
    var GameObject;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            GameObject = /** @class */ (function () {
                function GameObject() {
                    this._components = new Array();
                    this._newComponents = new Array();
                    this._children = new Array();
                    this._parent = null;
                    this._enabled = true;
                }
                Object.defineProperty(GameObject.prototype, "enabled", {
                    get: function () {
                        return this._enabled;
                    },
                    set: function (value) {
                        this._enabled = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(GameObject.prototype, "parent", {
                    get: function () {
                        return this._parent;
                    },
                    enumerable: false,
                    configurable: true
                });
                GameObject.prototype.addChild = function (gameObject) {
                    if (this.hasChild(gameObject)) {
                        throw new Error("Object already attached as child");
                    }
                    if (this == gameObject) {
                        throw new Error("You cannot attach object to itself");
                    }
                    this._children.push(gameObject);
                    gameObject._parent = this;
                };
                GameObject.prototype.removeChild = function (gameObject) {
                    if (!this.hasChild(gameObject)) {
                        throw new Error("Object bust be a child");
                    }
                    this._children.splice(this._children.indexOf(gameObject), 1);
                    gameObject._parent = null;
                };
                GameObject.prototype.hasChild = function (gameObject) {
                    return this._children.indexOf(gameObject) != -1;
                };
                GameObject.prototype.addComponent = function (type) {
                    if (this.hasComponent(type)) {
                        throw new Error("Component has been already added");
                    }
                    var component = new type();
                    this._components.push(component);
                    this._newComponents.push(component);
                    component.attached(this);
                    return component;
                };
                GameObject.prototype.hasComponent = function (type) {
                    for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                        var component = _a[_i];
                        if (component instanceof type)
                            return true;
                    }
                    return false;
                };
                GameObject.prototype.getComponent = function (type) {
                    for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                        var component = _a[_i];
                        if (component instanceof type)
                            return component;
                    }
                    return null;
                };
                GameObject.prototype.getComponentInChildren = function (type) {
                    for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
                        var child = _a[_i];
                        if (child.hasComponent(type)) {
                            return child.getComponent(type);
                        }
                    }
                    return null;
                };
                GameObject.prototype.getComponentsInChildren = function (type) {
                    var result = [];
                    for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
                        var child = _a[_i];
                        if (child.hasComponent(type)) {
                            result.push(child.getComponent(type));
                        }
                    }
                    return result;
                };
                GameObject.prototype.getComponentInParent = function (type) {
                    if (this._parent == null) {
                        return null;
                    }
                    if (this._parent.hasComponent(type)) {
                        return this._parent.getComponent(type);
                    }
                    return this._parent.getComponentInParent(type);
                };
                GameObject.prototype.sceneUpdate = function (deltaMs) {
                    while (this._newComponents.length > 0) {
                        this._newComponents.shift().init();
                    }
                    if (!this._enabled) {
                        return;
                    }
                    for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                        var component = _a[_i];
                        component.update(deltaMs);
                    }
                };
                return GameObject;
            }());
            exports_7("GameObject", GameObject);
        }
    };
});
System.register("scenes/GameScene", ["gameObject/GameObject"], function (exports_8, context_8) {
    "use strict";
    var GameObject_1, GameScene;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (GameObject_1_1) {
                GameObject_1 = GameObject_1_1;
            }
        ],
        execute: function () {
            GameScene = /** @class */ (function (_super) {
                __extends(GameScene, _super);
                function GameScene() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    //scene updating is running
                    _this._running = false;
                    //enterFrame() function bind to 'this'
                    _this._enterFrameBind = _this.enterFrame.bind(_this);
                    //last enterFrame() call time
                    _this._lastUpdateTime = 0;
                    return _this;
                }
                /**
                 * Start frame updating. Will be ignored if already running
                 */
                GameScene.prototype.start = function () {
                    if (!this._running) {
                        this._running = true;
                        this._lastUpdateTime = 0;
                        requestAnimationFrame(this._enterFrameBind);
                    }
                };
                /**
                 * Stop frame updating. Will be ignored if not running
                 */
                GameScene.prototype.stop = function () {
                    this._running = false;
                };
                GameScene.prototype.enterFrame = function () {
                    if (!this._running) {
                        return;
                    }
                    if (this._enabled) {
                        var deltaMs = void 0;
                        var currTime = Date.now();
                        if (this._lastUpdateTime == 0) {
                            deltaMs = 0;
                        }
                        else {
                            deltaMs = currTime - this._lastUpdateTime;
                        }
                        this._lastUpdateTime = currTime;
                        for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
                            var child = _a[_i];
                            child.sceneUpdate(deltaMs);
                        }
                    }
                    requestAnimationFrame(this._enterFrameBind);
                };
                return GameScene;
            }(GameObject_1.GameObject));
            exports_8("GameScene", GameScene);
        }
    };
});
System.register("engine/components/Camera3D", ["components/Component", "three", "engine/components/Transform3D"], function (exports_9, context_9) {
    "use strict";
    var Component_3, three_2, Transform3D_1, Camera3D;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (Component_3_1) {
                Component_3 = Component_3_1;
            },
            function (three_2_1) {
                three_2 = three_2_1;
            },
            function (Transform3D_1_1) {
                Transform3D_1 = Transform3D_1_1;
            }
        ],
        execute: function () {
            Camera3D = /** @class */ (function (_super) {
                __extends(Camera3D, _super);
                function Camera3D() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Camera3D.prototype.attached = function (gameObject) {
                    this._camera = new three_2.PerspectiveCamera(60, 1, 1, 100000);
                    Transform3D_1.Transform3D.init(gameObject, this._camera);
                };
                Object.defineProperty(Camera3D.prototype, "fov", {
                    get: function () {
                        return this._camera.fov;
                    },
                    set: function (value) {
                        this._camera.fov = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Camera3D.prototype, "nearDistance", {
                    get: function () {
                        return this._camera.near;
                    },
                    set: function (value) {
                        this._camera.near = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Camera3D.prototype, "farDistance", {
                    get: function () {
                        return this._camera.far;
                    },
                    set: function (value) {
                        this._camera.far = value;
                    },
                    enumerable: false,
                    configurable: true
                });
                Camera3D.prototype.updateAspect = function (height, width) {
                    this._camera.aspect = height / width;
                    this._camera.updateProjectionMatrix();
                };
                return Camera3D;
            }(Component_3.Component));
            exports_9("Camera3D", Camera3D);
        }
    };
});
//# sourceMappingURL=lib.js.map