import {Component} from "../../components/Component";
import {ITransform} from "./ITransform";
import {Object3D, Vector3} from "three";
import {IGameObject} from "../../gameObject/IGameObject";

export class Transform3D extends Component implements ITransform
{
    public readonly position:Vector3 = new Vector3();

    public readonly rotation:Vector3 = new Vector3();

    private object3d:Object3D;

    public setObject3D(object3d:Object3D) : void
    {
        this.object3d = object3d;
    }

    public override update(deltaMs:number) : void
    {
        this.object3d.position.copy(this.position);
        this.object3d.rotation.x = this.rotation.x;
        this.object3d.rotation.y = this.rotation.y;
        this.object3d.rotation.z = this.rotation.z;
    }

    public static init(gameObject:IGameObject, object3d:Object3D) : void
    {
        let transform3:Transform3D = gameObject.getComponent(Transform3D);
        if(transform3 == null)
        {
            transform3 = gameObject.addComponent(Transform3D);
        }
        transform3.setObject3D(object3d);
    }
}