import {IGameObject} from "../gameObject/IGameObject";

export abstract class Component
{
    /**
     * Calls when component is attached
     * @param {IGameObject} gameObject The object that the component is attached
     */
    public attached(gameObject:IGameObject) : void
    {
    }

    /**
     * Calls before first frame update. Does not do anything. Override if need
     * */
    public init() : void
    {
    }

    /**
     * Calls every frame update. Does not do anything. Override if need
     *
     * @param {number} deltaMs Number of milliseconds that have passed since the last update
     * */
    public update(deltaMs:number) : void
    {
    }
}