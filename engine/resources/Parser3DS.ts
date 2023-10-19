module gameengine.engine.resources {
    /*
    Original file at https://tankidemo.motsgar.fi/js/engine/addons/Parser3DS.js
     */
    import FileLoader = THREE.FileLoader;
    import Vector3 = THREE.Vector3;
    import Mesh = THREE.Mesh;
    import Object3D = THREE.Object3D;
    import Material = THREE.Material;

    const CHUNK_MAIN: int = 19789;

    const CHUNK_VERSION: int = 2;

    const CHUNK_SCENE: int = 15677;

    const CHUNK_ANIMATION: int = 45056;

    const CHUNK_OBJECT: int = 16384;

    const CHUNK_TRIMESH: int = 16640;

    const CHUNK_VERTICES: int = 16656;

    const CHUNK_FACES: int = 16672;

    const CHUNK_FACESMATERIAL: int = 16688;

    const CHUNK_FACESSMOOTH: int = 16720;

    const CHUNK_MAPPINGCOORDS: int = 16704;

    const CHUNK_TRANSFORMATION: int = 16736;

    const CHUNK_MATERIAL: int = 45055;

    function bytesAvailable(data: any): number {
        return data.byteLength - data.position;
    }

    export class Parser3DS {
        private objectDatas: any;

        private animationDatas: any[];

        private materialDatas: any;

        private objects: Mesh[];

        private parents: Mesh[];

        private materials: Material[];

        private textureMaterials: Material[];

        private data: any;

        private dataView: DataView;

        public constructor() {
            this.objectDatas = {};

            this.animationDatas = [];

            this.materialDatas = {};

            this.objects = [];

            this.parents = [];

            this.materials = [];

            this.textureMaterials = [];
        }

        public load(url: string,
                    onLoad: (objects: Object3D[]) => void,
                    onProgress?: (data: (ProgressEvent<EventTarget>)) => void,
                    onError?: (error: unknown) => void): void {
            const loader: FileLoader = new FileLoader();
            loader.setResponseType('arraybuffer');
            loader.load(
                url,
                data => {
                    onLoad(this.parse(data));
                },
                onProgress,
                onError
            );
        }

        public parse(data: any): Mesh[] {
            data.position = 0;
            if (bytesAvailable(data) < 6) return;

            this.data = data;
            this.dataView = new DataView(data);
            this.parse3DSChunk(data.position, bytesAvailable(data));
            this.objects = [];
            this.parents = [];
            this.materials = [];
            this.textureMaterials = [];
            this.buildContent();
            data = null;
            this.objectDatas = null;
            this.animationDatas = null;
            this.materialDatas = null;
            return this.objects;
        }

        private parse3DSChunk(dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo: any = this.readChunkInfo(dataPosition);
            this.data.position = dataPosition;
            switch (chunkInfo.id) {
                case CHUNK_MAIN:
                    this.parseMainChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
            }
            this.parse3DSChunk(chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private readChunkInfo(dataPosition: number): any {
            this.data.position = dataPosition;
            const chunkInfo: any = {};
            chunkInfo.id = this.dataView.getUint16(this.data.position, true);
            this.data.position += 2;
            chunkInfo.size = this.dataView.getUint32(this.data.position, true);
            this.data.position += 4;
            chunkInfo.dataSize = chunkInfo.size - 6;
            chunkInfo.dataPosition = this.data.position;
            chunkInfo.nextChunkPosition = dataPosition + chunkInfo.size;
            return chunkInfo;
        }

        private parseMainChunk(dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case CHUNK_VERSION:
                    break;
                case CHUNK_SCENE:
                    this.parse3DChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
                    break;
                case CHUNK_ANIMATION:
                    this.parseAnimationChunk(chunkInfo.dataPosition, chunkInfo.dataSize);
            }
            this.parseMainChunk(chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parse3DChunk(dataPosition: number, bytesAvailable: number): void {
            let chunkInfo: any;
            let material: any;
            while (bytesAvailable >= 6) {
                chunkInfo = this.readChunkInfo(dataPosition);
                switch (chunkInfo.id) {
                    case CHUNK_MATERIAL:
                        material = {};
                        this.parseMaterialChunk(material, chunkInfo.dataPosition, chunkInfo.dataSize);
                        break;
                    case CHUNK_OBJECT:
                        this.parseObject(chunkInfo);
                }
                dataPosition = chunkInfo.nextChunkPosition;
                bytesAvailable = bytesAvailable - chunkInfo.size;
            }
        }

        private parseMaterialChunk(material: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case 40960:
                    this.parseMaterialName(material);
                    break;
                case 40992:
                    this.data.position = chunkInfo.dataPosition + 6;
                    material.color =
                        (this.dataView.getUint8(this.data.position) << 16) +
                        (this.dataView.getUint8(this.data.position + 2) << 8) +
                        this.dataView.getUint8(this.data.position + 4);
                    this.data.position += 6;
                    break;
                case 41024:
                    this.data.position = chunkInfo.dataPosition + 6;
                    material.glossiness = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    break;
                case 41025:
                    this.data.position = chunkInfo.dataPosition + 6;
                    material.specular = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    break;
                case 41040:
                    this.data.position = chunkInfo.dataPosition + 6;
                    material.transparency = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    break;
                case 41472:
                    material.diffuseMap = {
                        scaleU: 1,
                        scaleV: 1,
                        offsetU: 0,
                        offsetV: 0,
                        rotation: 0
                    };
                    this.parseMapChunk(material.name, material.diffuseMap, chunkInfo.dataPosition, chunkInfo.dataSize);
                    break;
                case 41488:
                    material.opacityMap = {
                        scaleU: 1,
                        scaleV: 1,
                        offsetU: 0,
                        offsetV: 0,
                        rotation: 0
                    };
                    this.parseMapChunk(material.name, material.opacityMap, chunkInfo.dataPosition, chunkInfo.dataSize);
                    break;
                case 41504:
            }
            this.parseMaterialChunk(material, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parseMaterialName(material: any): void {
            if (this.materialDatas == null) this.materialDatas = {};

            material.name = this.getString(this.data.position);
            this.materialDatas[material.name] = material;
        }

        private getString(index: number): string {
            let charCode: number = 0;
            this.data.position = index;
            let res: string = '';
            while (this.dataView.getInt8(this.data.position) !== 0) {
                charCode = this.dataView.getInt8(this.data.position);
                this.data.position++;
                res += String.fromCharCode(charCode);
            }
            this.data.position++;
            return res;
        }

        private parseMapChunk(materialName: string, map: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case 41728:
                    map.filename = this.getString(chunkInfo.dataPosition).toLowerCase();
                    break;
                case 41812:
                    map.scaleU = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    break;
                case 41814:
                    map.scaleV = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    break;
                case 41816:
                    map.offsetU = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    break;
                case 41818:
                    map.offsetV = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
                    break;
                case 41820:
                    map.rotation = this.dataView.getFloat32(this.data.position, true);
                    this.data.position += 4;
            }
            this.parseMapChunk(materialName, map, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parseObject(chunkInfo: any): void {
            if (this.objectDatas == null) this.objectDatas = {};

            const object: any = {};
            object.name = this.getString(chunkInfo.dataPosition);
            this.objectDatas[object.name] = object;
            const offset = object.name.length + 1;
            this.parseObjectChunk(object, chunkInfo.dataPosition + offset, chunkInfo.dataSize - offset);
        }

        private parseObjectChunk(object: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case CHUNK_TRIMESH:
                    this.parseMeshChunk(object, chunkInfo.dataPosition, chunkInfo.dataSize);
                    break;
                case 18176:
            }
            this.parseObjectChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parseMeshChunk(object: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case CHUNK_VERTICES:
                    this.parseVertices(object);
                    break;
                case CHUNK_MAPPINGCOORDS:
                    this.parseUVs(object);
                    break;
                case CHUNK_TRANSFORMATION:
                    this.parseMatrix(object);
                    break;
                case CHUNK_FACES:
                    this.parseFaces(object, chunkInfo);
            }

            this.parseMeshChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parseVertices(object: any): void {
            const num: number = this.dataView.getUint16(this.data.position, true);
            this.data.position += 2;
            object.vertices = new Float32Array(num * 3);
            let j: number = 0;
            for (let i: number = 0; i < num; i++) {
                object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                this.data.position += 4;
                object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                this.data.position += 4;
                object.vertices[j++] = this.dataView.getFloat32(this.data.position, true);
                this.data.position += 4;
            }
        }

        private parseUVs(object: any): void {
            const num = this.dataView.getUint16(this.data.position, true);
            this.data.position += 2;
            object.uvs = new Float32Array(num * 2);
            let j = 0;
            for (let i = 0; i < num; i++) {
                object.uvs[j++] = this.dataView.getFloat32(this.data.position, true);
                this.data.position += 4;
                object.uvs[j++] = this.dataView.getFloat32(this.data.position, true);
                this.data.position += 4;
            }
        }

        private parseMatrix(object: any): void {
            object.a = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.e = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.i = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.b = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.f = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.j = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.c = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.g = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.k = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.d = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.h = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
            object.l = this.dataView.getFloat32(this.data.position, true);
            this.data.position += 4;
        }

        private parseFaces(object: any, chunkInfo: any): void {
            const num: number = this.dataView.getUint16(this.data.position, true);
            this.data.position += 2;
            object.faces = [];
            object.smoothingGroups = [];
            let j: number = 0;
            for (let i: number = 0; i < num; i++) {
                object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                this.data.position += 2;
                object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                this.data.position += 2;
                object.faces[j++] = this.dataView.getUint16(this.data.position, true);
                this.data.position += 4;
            }
            const offset: number = 2 + 8 * num;
            this.parseFacesChunk(object, chunkInfo.dataPosition + offset, chunkInfo.dataSize - offset);
        }

        private parseFacesChunk(object: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case CHUNK_FACESMATERIAL:
                    this.parseSurface(object);
                    break;
                case CHUNK_FACESSMOOTH:
                    this.parseSmoothingGroups(object);
            }
            this.parseFacesChunk(object, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private parseSurface(object: any): void {
            if (object.surfaces == null) object.surfaces = {};

            const surface = [];
            object.surfaces[this.getString(this.data.position)] = surface;
            const num = this.dataView.getUint16(this.data.position, true);
            this.data.position += 2;
            for (let i = 0; i < num; i++) {
                surface[i] = this.dataView.getUint16(this.data.position, true);
                this.data.position += 2;
            }
        }

        private parseSmoothingGroups(object: any): void {
            const len = object.faces.length / 3;
            for (let i = 0; i < len; i++) {
                object.smoothingGroups[i] = this.dataView.getUint32(this.data.position, true);
            }
        }

        private parseAnimationChunk(dataPosition: number, bytesAvailable: number): void {
            let chunkInfo: any;
            let animation: any;
            while (bytesAvailable >= 6) {
                chunkInfo = this.readChunkInfo(dataPosition);
                switch (chunkInfo.id) {
                    case 45057:
                    case 45058:
                    case 45059:
                    case 45060:
                    case 45061:
                    case 45062:
                    case 45063:
                        if (this.animationDatas == null) {
                            this.animationDatas = [];
                        }
                        animation = {};
                        this.animationDatas.push(animation);
                        this.parseObjectAnimationChunk(animation, chunkInfo.dataPosition, chunkInfo.dataSize);
                        break;
                    case 45064:
                }
                dataPosition = chunkInfo.nextChunkPosition;
                bytesAvailable = bytesAvailable - chunkInfo.size;
            }
        }

        private parseObjectAnimationChunk(animation: any, dataPosition: number, bytesAvailable: number): void {
            if (bytesAvailable < 6) return;

            const chunkInfo = this.readChunkInfo(dataPosition);
            switch (chunkInfo.id) {
                case 45072:
                    animation.objectName = this.getString(this.data.position);
                    this.data.position += 4;
                    animation.parentIndex = this.dataView.getUint16(this.data.position, true);
                    this.data.position += 2;
                    break;
                case 45073:
                    animation.objectName = this.getString(this.data.position);
                    break;
                case 45075:
                    animation.pivot = new THREE.Vector3(
                        this.dataView.getFloat32(this.data.position, true),
                        this.dataView.getFloat32(this.data.position + 4, true),
                        this.dataView.getFloat32(this.data.position + 8, true)
                    );
                    this.data.position += 12;
                    break;
                case 45088:
                    this.data.position = this.data.position + 20;
                    animation.position = new THREE.Vector3(
                        this.dataView.getFloat32(this.data.position, true),
                        this.dataView.getFloat32(this.data.position + 4, true),
                        this.dataView.getFloat32(this.data.position + 8, true)
                    );
                    this.data.position += 12;
                    break;
                case 45089:
                    this.data.position = this.data.position + 20;
                    animation.rotation = this.getRotationFrom3DSAngleAxis(
                        this.dataView.getFloat32(this.data.position, true),
                        this.dataView.getFloat32(this.data.position + 4, true),
                        this.dataView.getFloat32(this.data.position + 8, true),
                        this.dataView.getFloat32(this.data.position + 12, true)
                    );
                    this.data.position += 16;
                    break;
                case 45090:
                    this.data.position = this.data.position + 20;
                    animation.scale = new THREE.Vector3(
                        this.dataView.getFloat32(this.data.position, true),
                        this.dataView.getFloat32(this.data.position + 4, true),
                        this.dataView.getFloat32(this.data.position + 8, true)
                    );
                    this.data.position += 12;
            }
            this.parseObjectAnimationChunk(animation, chunkInfo.nextChunkPosition, bytesAvailable - chunkInfo.size);
        }

        private getRotationFrom3DSAngleAxis(angle: number, x: number, z: number, y: number): Vector3 {
            let half: number;
            const res: Vector3 = new Vector3();
            const s: number = Math.sin(angle);
            const c: number = Math.cos(angle);
            const t: number = 1 - c;
            const k: number = x * y * t + z * s;
            if (k >= 1) {
                half = angle / 2;
                res.z = -2 * Math.atan2(x * Math.sin(half), Math.cos(half));
                res.y = -Math.PI / 2;
                res.x = 0;
                return res;
            }
            if (k <= -1) {
                half = angle / 2;
                res.z = 2 * Math.atan2(x * Math.sin(half), Math.cos(half));
                res.y = Math.PI / 2;
                res.x = 0;
                return res;
            }
            res.z = -Math.atan2(y * s - x * z * t, 1 - (y * y + z * z) * t);
            res.y = -Math.asin(x * y * t + z * s);
            res.x = -Math.atan2(x * s - y * z * t, 1 - (x * x + z * z) * t);
            return res;
        }

        private buildContent(): void {
            let objectName: string = null;
            let objectData: any = null;
            let object: Mesh = null;
            let i: number = 0;
            let length: number = 0;
            let animationData: any = null;
            let j: number = 0;
            let nameCounter: number = 0;
            let animationData2 = null;
            let newObjectData = null;
            let newName = null;

            if (this.animationDatas[0] !== undefined) {
                if (this.objectDatas !== null) {
                    length = this.animationDatas.length;
                    for (i = 0; i < length; i++) {
                        animationData = this.animationDatas[i];
                        objectName = animationData.objectName;
                        objectData = this.objectDatas[objectName];
                        if (objectData !== null) {
                            for (j = i + 1, nameCounter = 1; j < length; j++) {
                                animationData2 = this.animationDatas[j];
                                if (!animationData2.isInstance && objectName == animationData2.objectName) {
                                    newObjectData = {};
                                    newName = objectName + nameCounter++;
                                    newObjectData.name = newName;
                                    this.objectDatas[newName] = newObjectData;
                                    animationData2.objectName = newName;
                                    newObjectData.vertices = objectData.vertices;
                                    newObjectData.uvs = objectData.uvs;
                                    newObjectData.faces = objectData.faces;
                                    newObjectData.smoothingGroups = objectData.smoothingGroups;
                                    newObjectData.surfaces = objectData.surfaces;
                                    newObjectData.a = objectData.a;
                                    newObjectData.b = objectData.b;
                                    newObjectData.c = objectData.c;
                                    newObjectData.d = objectData.d;
                                    newObjectData.e = objectData.e;
                                    newObjectData.f = objectData.f;
                                    newObjectData.g = objectData.g;
                                    newObjectData.h = objectData.h;
                                    newObjectData.i = objectData.i;
                                    newObjectData.j = objectData.j;
                                    newObjectData.k = objectData.k;
                                    newObjectData.l = objectData.l;
                                }
                            }
                        }
                        if (objectData !== null && objectData.vertices !== null) {
                            object = new Mesh();
                            this.buildMesh(object, objectData, animationData);
                        } else {
                            object = new Mesh();
                        }

                        object.name = objectName;
                        animationData.object = object;
                        if (animationData.position !== null) {
                            object.position.x = animationData.position.x;
                            object.position.y = animationData.position.y;
                            object.position.z = animationData.position.z;
                        }
                        if (animationData.rotation !== null) {
                            object.rotation.x = animationData.rotation.x;
                            object.rotation.y = animationData.rotation.y;
                            object.rotation.z = animationData.rotation.z;
                        }
                        if (animationData.scale !== null) {
                            object.scale.x = animationData.scale.x;
                            object.scale.y = animationData.scale.y;
                            object.scale.z = animationData.scale.z;
                        }
                        this.objects.push(object);//(animationData);
                        //if (animationData.parentIndex == 65535) this.parents.push(animationData.object);
                    }
                    /*
                    let currentTarget = [];

                    for (i = 0; i < length; i++) {
                        if (this.animationDatas[i].parentIndex == 65535) {
                            console.log(this.animationDatas[i]);
                            this.parents.push(this.animationDatas[i].object);
                            currentTarget = [];
                            continue;
                        }
                        if (this.animationDatas[i - 1].parentIndex == 65535) {
                            this.parents[this.parents.length - 1].add(this.animationDatas[i].object);
                            currentTarget.push(this.parents[this.parents.length - 1].children.length - 1);
                            continue;
                        }
                        if (this.animationDatas[i - 1].parentIndex == this.animationDatas[i].parentIndex) {
                            let addTarget = this.parents[this.parents.length - 1];
                            console.log(i);
                            for (let j = 0; j < currentTarget.length - 1; j++) {
                                addTarget = addTarget.children[currentTarget[j]];
                                console.log(addTarget);
                            }
                            addTarget.add(this.animationDatas[i].object);
                        }
                        if (this.animationDatas[i - 1].parentIndex < this.animationDatas[i].parentIndex) {
                            let addTarget = this.parents[this.parents.length - 1];
                            console.log(i);
                            let currentTargetLength = currentTarget.length;
                            for (let j = 0; j < currentTargetLength; j++) {
                                addTarget = addTarget.children[currentTarget[j]];
                                console.log(addTarget);
                                currentTarget.push(addTarget.children.length);
                            }

                            let addTarget = this.parents[this.parents.length - 1];
                            console.log(i);
                            for (let j = 0; j < currentTarget.length - 1; j++) {
                                addTarget = addTarget.children[currentTarget[j]];
                                console.log(addTarget);
                            }
                            addTarget.add(this.animationDatas[i].object);

                        }
                    }
                    console.log(this.parents);
                    */
                }
            } else {
                for (objectName in this.objectDatas) {
                    objectData = this.objectDatas[objectName];
                    if (objectData.vertices !== null) {
                        object = new Mesh();
                        object.name = objectName;
                        this.buildMesh(object, objectData, null);
                        this.objects.push(object);
                    }
                }
            }
        }

        private buildMesh(mesh: Mesh, objectData: any, animationData: any): void {
            let geometry = new THREE.BufferGeometry();
            let material = new THREE.MeshBasicMaterial({color: 0xffffff});
            mesh.geometry = geometry;
            mesh.material = material;
            let n: number = 0;
            let m: number = 0;
            let len: number = 0;
            let a: number;
            let b: number;
            let c: number;
            let d: number;
            let e: number;
            let f: number;
            let g: number;
            let h: number;
            let i: number;
            let j: number;
            let k: number;
            let l: number;
            let det: number;
            let x: number;
            let y: number;
            let z: number;
            let vertices: number[] = [];
            let uvs: number[] = [];
            let correct: boolean = false;
            if (animationData !== null) {
                a = objectData.a;
                b = objectData.b;
                c = objectData.c;
                d = objectData.d;
                e = objectData.e;
                f = objectData.f;
                g = objectData.g;
                h = objectData.h;
                i = objectData.i;
                j = objectData.j;
                k = objectData.k;
                l = objectData.l;
                det = 1 / (-c * f * i + b * g * i + c * e * j - a * g * j - b * e * k + a * f * k);
                objectData.a = (-g * j + f * k) * det;
                objectData.b = (c * j - b * k) * det;
                objectData.c = (-c * f + b * g) * det;
                objectData.d = (d * g * j - c * h * j - d * f * k + b * h * k + c * f * l - b * g * l) * det;
                objectData.e = (g * i - e * k) * det;
                objectData.f = (-c * i + a * k) * det;
                objectData.g = (c * e - a * g) * det;
                objectData.h = (c * h * i - d * g * i + d * e * k - a * h * k - c * e * l + a * g * l) * det;
                objectData.i = (-f * i + e * j) * det;
                objectData.j = (b * i - a * j) * det;
                objectData.k = (-b * e + a * f) * det;
                objectData.l = (d * f * i - b * h * i - d * e * j + a * h * j + b * e * l - a * f * l) * det;
                if (animationData.pivot !== null) {
                    objectData.d = objectData.d - animationData.pivot.x;
                    objectData.h = objectData.h - animationData.pivot.y;
                    objectData.l = objectData.l - animationData.pivot.z;
                }
                correct = true;
            }
            if (objectData.vertices !== null) {
                n = 0;
                m = 0;
                len = objectData.vertices.length;
                while (n < len) {
                    if (correct) {
                        x = objectData.vertices[n++];
                        y = objectData.vertices[n++];
                        z = objectData.vertices[n++];

                        vertices.push(objectData.a * x + objectData.b * y + objectData.c * z + objectData.d);
                        vertices.push(objectData.e * x + objectData.f * y + objectData.g * z + objectData.h);
                        vertices.push(objectData.i * x + objectData.j * y + objectData.k * z + objectData.l);
                    } else {
                        vertices.push(objectData.vertices[n++]);
                        vertices.push(objectData.vertices[n++]);
                        vertices.push(objectData.vertices[n++]);
                    }

                    if (objectData.uvs) {
                        uvs.push(objectData.uvs[m++]);
                        uvs.push(1 - objectData.uvs[m++]);
                    }
                }
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            }

            if (objectData.faces !== null) {
                n = 0;
                m = 0;
                len = objectData.faces.length;
                let index = [];
                while (n < len) {
                    index.push(objectData.faces[n++], objectData.faces[n++], objectData.faces[n++]);
                    mesh.geometry.setIndex(index);
                }
            }
            //geometry.computeFaceNormals();
            geometry.computeVertexNormals();
        }

    }
}