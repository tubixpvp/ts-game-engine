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

        public static loadMesh(type:"3ds", url:string, callback:(meshObject:IGameObject)=>void) : void
        {
            const meshObject:IGameObject = new GameObject();

            const meshRenderer:MeshRenderer = meshObject.addComponent(MeshRenderer);

            switch (type)
            {
                case "3ds":
                    this.parser3ds.load(url,(objects:Mesh[])=>this.onObjectsLoaded(objects,meshRenderer),undefined,this.onError);
                    break;
            }

            callback(meshObject);
        }
        private static onObjectsLoaded(objects:Mesh[], meshRenderer:MeshRenderer) : void
        {
            const mesh:Mesh = objects[0]; //TODO: rewrite 3dsLoader. it not load parent tree
            console.log(mesh);
            console.log(mesh.geometry);

            meshRenderer.initGeometry(mesh.geometry);
        }
        private static onError(error:unknown) : void
        {
            throw new Error(String(error));
        }
    }
}