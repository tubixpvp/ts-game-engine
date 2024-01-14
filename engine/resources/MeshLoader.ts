///<reference path="Loader3DS.ts"/>

module gameengine.engine.resources
{
    import IGameObject = gameengine.gameObject.IGameObject;
    import GameObject = gameengine.gameObject.GameObject;
    import MeshRenderer = gameengine.engine.components.MeshRenderer;
    import Object3D = THREE.Object3D;
    import Mesh = THREE.Mesh;
    import Group = THREE.Group;
    import Transform3D = gameengine.engine.components.Transform3D;
    import ObjectLoader = THREE.ObjectLoader;

    export class MeshLoader
    {
        private static readonly loader3DS:Loader3DS = new Loader3DS();
        private static readonly loaderFBX:FBXLoader = new FBXLoader();

        public static loadMesh(type:"3ds"|"fbx", url:string, callback:(meshObject:IGameObject)=>void) : void
        {
            const meshObject:IGameObject = new GameObject();
            meshObject.addComponent(Transform3D).setNewObject3D();

            switch (type)
            {
                case "3ds":
                    this.loader3DS.load(url,(object3d:Object3D)=>this.onObjectsLoaded(object3d,meshObject,callback),undefined,this.onError);
                    break;
                case "fbx":
                    this.loaderFBX.load(url, (object3d:Object3D)=>this.onObjectsLoaded(object3d,meshObject,callback),undefined,this.onError);
                    break;
            }
        }
        private static onObjectsLoaded(object3d:Object3D, gameObject:IGameObject, callback:(meshObject:IGameObject)=>void) : void {

            this.traverseAndBuildTree(object3d, gameObject);

            callback(gameObject);
        }

        private static traverseAndBuildTree(parent3d:Object3D, mainObject:IGameObject) : void
        {
            parent3d.traverse((object3d:Object3D):void => {
                if(object3d == parent3d) //I don't know is Object3D.traverse returns object itself
                    return;

                const gameObject:IGameObject = new GameObject();

                mainObject.addChild(gameObject);

                if(object3d instanceof Mesh)
                {
                    const meshRenderer:MeshRenderer = gameObject.addComponent(MeshRenderer);
                    meshRenderer.initGeometry(object3d.geometry);
                }
                else
                {
                    gameObject.addComponent(Transform3D).setObject3D(object3d);
                }

                this.traverseAndBuildTree(object3d, gameObject);
            });
        }

        private static onError(error:unknown) : void
        {
            throw new Error(String(error));
        }
    }
}