declare class FBXLoader extends THREE.Loader<THREE.Group> {
    constructor(manager?: THREE.LoadingManager);

    parse(FBXBuffer: ArrayBuffer | string, path: string): THREE.Group;
}
