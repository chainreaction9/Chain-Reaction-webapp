import { gl } from "./gl"
import { VertexBufferObject } from "./VertexBufferObject";
import { VertexLayout } from "./VertexLayout";
import { IndexBufferObject } from "./IndexBufferObject";

export class VertexArrayObject {
    private _vaoObj: WebGLVertexArrayObject;
    private _numAttributes: number;
    private _numIndices: number;
    constructor() {
        this._vaoObj = gl.createVertexArray();
        this._numIndices = 0;
        this._numAttributes = 1;
    }
    public bind(): void {
        gl.bindVertexArray(this._vaoObj);
    }
    public unbind(): void {
        gl.bindVertexArray(null);
    }
    public get numAttr(): number {
        return this._numAttributes;
    }
    public get numIndices(): number {
        return this._numIndices;
    }
    public cleanUp(): void {
        if (this._vaoObj !== undefined) {
            gl.deleteVertexArray(this._vaoObj);
            this._vaoObj = undefined;
            this._numAttributes = 1;
            this._numIndices = 0;
        }
    }
    public setVertexBuffer(vb: VertexBufferObject, layout: VertexLayout): void {
        this.bind();
        vb.bind();
        this._numAttributes = layout.getNumLayout;
        let layoutList = layout.getLayouts;
        let offset = 0;
        for (var i = 0; i < layoutList.length; i++) {
            let _layoutEntry = layoutList[i];
            gl.enableVertexAttribArray(i);
            gl.vertexAttribPointer(i, _layoutEntry[1], _layoutEntry[0], _layoutEntry[2], layout.getStride, offset);
            offset += _layoutEntry[1] * VertexLayout.getSize(_layoutEntry[0]);
            gl.disableVertexAttribArray(i);
        }
    }
    public setIndexBuffer(ib: IndexBufferObject): void {
        this.bind();
        ib.bind();
        this.unbind();
        ib.unbind();
        this._numIndices = ib.getCount;
    }
}