import {gl} from "./gl"
export class IndexBufferObject {
    private _iboOBJ: WebGLBuffer;
    private _count: number;

    constructor(data: Uint16Array) {
        if (this._iboOBJ != undefined) gl.deleteBuffer(this._iboOBJ);
        this._iboOBJ = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        this._count = data.length;
    }

    public bind(): void {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
    }
    public unbind(): void {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    public cleanUp(): void {
        if (this._iboOBJ !== undefined) {
            gl.deleteBuffer(this._iboOBJ);
            this._iboOBJ = undefined;
            this._count = 0;
        }
    }
    public loadNewBuffer(data: Uint16Array): void {
        this.cleanUp();
        this._iboOBJ = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        this._count = data.length;
    }
    public get getCount(): number {
        return this._count;
    }
}