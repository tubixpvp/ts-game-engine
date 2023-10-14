export class Vector2
{
    public x:number = 0;
    public y:number = 0;

    public copyFrom(vec:Vector2) : void
    {
        this.x = vec.x;
        this.y = vec.y;
    }
}