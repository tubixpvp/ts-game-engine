module gameengine.engine.material
{
    export abstract class Material
    {

        public abstract get material():THREE.Material | THREE.Material[];
    }
}