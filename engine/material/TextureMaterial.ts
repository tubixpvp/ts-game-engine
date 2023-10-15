///<reference path="Material.ts"/>
module gameengine.engine.material
{
    export class TextureMaterial extends Material
    {
        public static readonly MESH_BASIC:string = "meshBasic";

        private _type:string;

        private _texture:THREE.Texture;

        private _material:THREE.Material;

        public constructor(type:string, data:HTMLImageElement) {
            super();
            this._type = type;
            this._texture = new THREE.Texture(data);

            if(type == TextureMaterial.MESH_BASIC)
            {
                const meshBasicMaterial:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial();
                this._material = meshBasicMaterial;
                meshBasicMaterial.map = this._texture;
            }
            else
            {
                throw new Error("unsupported type: " + type);
            }
        }

        public override dispose() : void
        {
            this._type = null;
            this._material.dispose();
            this._material = null;
            this._texture.dispose();
            this._texture = null;
        }

        public override get material() : THREE.Material | THREE.Material[]
        {
            return this._material;
        }
    }
}