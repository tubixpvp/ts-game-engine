import {Component} from "../components/Component";

export interface IGameObject
{
    /**
     * Create and add new component to the object
     * @param type Class type of component
     * @return Component instance
     */
    addComponent<T extends Component>(type: { new(): T ;} ) : T;

    /**
     * Is object has attached component
     * @param type Class type of component
     * @return {boolean}
     */
    hasComponent<T extends Component>(type: { new(): T ;} ) : boolean;

    /**
     * Get attached component by type
     * @param type Class type of component
     * @return Component instance or null if component is not found
     */
    getComponent<T extends Component>(type: { new(): T ;} ) : T;

    /**
     * Get component attached to one of the children
     * @param type Class type of component
     * @return Component instance or null if component is not found
     */
    getComponentInChildren<T extends Component>(type: { new(): T ;} ) : T;

    /**
     * Get components attached to the children
     * @param type Class type of component
     * @return Component instances array
     */
    getComponentsInChildren<T extends Component>(type: { new(): T ;} ) : T[];

    /**
     * Get component attached to the parent
     * @param type Class type of component
     * @return Component instance or null if component is not found
     */
    getComponentInParent<T extends Component>(type: { new(): T ;} ) : T;

    /**
     * Add child object
     * @param gameObject Object to add
     */
    addChild(gameObject:IGameObject) : void;

    /**
     * Remove object from children
     * @param gameObject Object to remove
     */
    removeChild(gameObject:IGameObject) : void;

    /**
     * Has object in children
     * @param gameObject Object to check
     * @return {boolean}
     */
    hasChild(gameObject:IGameObject) : boolean;

    /**
     * Get parent of the object
     */
    get parent() : IGameObject;
}