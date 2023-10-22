///<reference path="Parser3DS.ts"/>
module gameengine.engine.resources
{
    import IGameObject = gameengine.gameObject.IGameObject;
    import GameObject = gameengine.gameObject.GameObject;
    import MeshRenderer = gameengine.engine.components.MeshRenderer;
    import Object3D = THREE.Object3D;
    import Mesh = THREE.Mesh;

    export class MeshLoader
    {
        private static readonly parser3ds:Parser3DS = new Parser3DS();
        private static readonly parserFBX:FBXLoader;

        public static loadMesh(type:"3ds"|"fbx", url:string, callback:(meshObject:IGameObject)=>void) : void
        {
            const meshObject:IGameObject = new GameObject();

            switch (type)
            {
                case "3ds":
                    this.parser3ds.load(url,(objects:Mesh[])=>this.onObjectsLoaded(objects,meshObject,callback),undefined,this.onError);
                    break;
                case "fbx":
                    this.objectLoader.load(url, (object:Object3D)=>this.onObjectsLoaded([object],meshObject,callback));
                    break;
            }
        }
        private static onObjectsLoaded(objects:Object3D[], gameObject:IGameObject, callback:(meshObject:IGameObject)=>void) : void {

            //TODO: rewrite 3dsLoader. it not load parent tree

            let mainReady:boolean = false;

            for(let object of objects)
            {
                if(object instanceof Mesh)
                {
                    if(!mainReady)
                    {
                        this.createMeshRendererFromMesh3D(gameObject, object);
                    }
                    else
                    {
                        this.createChildGameObjectFromMesh(gameObject, object);
                    }
                }
                object.traverse((child:Object3D)=>{
                   if(child != object && child instanceof Mesh)
                   {
                        this.createChildGameObjectFromMesh(gameObject, child);
                   }
                });
            }

            callback(gameObject);
        }

        private static createChildGameObjectFromMesh(parentObject:IGameObject, mesh:Mesh) : void
        {
            const childObject:IGameObject = new GameObject();
            parentObject.addChild(childObject);
            this.createMeshRendererFromMesh3D(childObject, mesh as Mesh);
        }
        private static createMeshRendererFromMesh3D(object3d:IGameObject, mesh:Mesh) : void
        {
            const meshRenderer:MeshRenderer = object3d.addComponent(MeshRenderer);
            meshRenderer.initGeometry(mesh.geometry);
        }

        private static onError(error:unknown) : void
        {
            throw new Error(String(error));
        }
    }
}