///<reference path="../../components/Component.ts"/>
///<reference path="../../gameObject/IGameObject.ts"/>
///<reference path="Transform3D.ts"/>
///<reference path="../material/TextureMaterial.ts"/>
module gameengine.engine.components
{
    import Component = gameengine.components.Component;
    import Mesh = THREE.Mesh;
    import IGameObject = gameengine.gameObject.IGameObject;
    import BufferGeometry = THREE.BufferGeometry;
    import Material = gameengine.engine.material.Material;
    import TextureMaterial = gameengine.engine.material.TextureMaterial;

    export class MeshRenderer extends Component
    {
        private static readonly DUMMY_MATERIAL:Material = new TextureMaterial(TextureMaterial.MESH_BASIC, new Image(1,1));

        private _mesh:Mesh;

        private _geometry:BufferGeometry;

        private _material:Material;

        public override attached(gameObject: IGameObject):void
        {
            this._geometry = new BufferGeometry();
            this._mesh = new Mesh(this._geometry);
            this.material = MeshRenderer.DUMMY_MATERIAL;

            Transform3D.init(gameObject, this._mesh);
        }

        public get material() : Material
        {
            return this._material;
        }
        public set material(value:Material)
        {
            this._material = value;
            this._mesh.material = value.material;
        }
    }
}