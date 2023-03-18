import { gl } from "./gl";
export class VertexBufferObject {
    private _vboObj: WebGLBuffer;
    private _size: number;

    constructor(data: ArrayBuffer) {
        this._vboObj = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboObj);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        this._size = data.byteLength;
    }

    public bind(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboObj);
    }
    public unbind(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    public get getSize(): number {
        return this._size;
    }
    public cleanUp(): void {
        if (this._vboObj !== undefined) {
            gl.deleteBuffer(this._vboObj);
            this._vboObj = undefined;
            this._size = 0;
        }
    }
    public loadNewBuffer(data: ArrayBuffer) {
        this.cleanUp();
        this._vboObj = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboObj);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        this._size = data.byteLength;
    }
}