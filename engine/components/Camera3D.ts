import {Component} from "../../components/Component";
import {IGameObject} from "../../gameObject/IGameObject";
import {PerspectiveCamera} from "three";
import {Transform3D} from "./Transform3D";

export class Camera3D extends Component
{
    private _camera:PerspectiveCamera;

    public override attached(gameObject: IGameObject) : void
    {
        this._camera = new PerspectiveCamera(60,1,1,100000);
        Transform3D.init(gameObject, this._camera);
    }

    public get fov() : number
    {
        return this._camera.fov;
    }
    public set fov(value:number)
    {
        this._camera.fov = value;
    }

    public get nearDistance() : number
    {
        return this._camera.near;
    }
    public set nearDistance(value:number)
    {
        this._camera.near = value;
    }

    public get farDistance() : number
    {
        return this._camera.far;
    }
    public set farDistance(value:number)
    {
        this._camera.far = value;
    }

    public updateAspect(height:number, width:number) : void
    {
        this._camera.aspect = height / width;
        this._camera.updateProjectionMatrix();
    }
}