module gameengine.engine.resources
{
    import IGameObject = gameengine.gameObject.IGameObject;
    import GameObject = gameengine.gameObject.GameObject;
    import MeshRenderer = gameengine.engine.components.MeshRenderer;

    export class MeshLoader
    {
        public static loadMesh(type:"fbx", url:string, callback:(meshObject:IGameObject)=>void) : void
        {
            const meshObject:IGameObject = new GameObject();

            const meshRenderer:MeshRenderer = meshObject.addComponent(MeshRenderer);

            //TODO

            callback(meshObject);
        }
    }
}