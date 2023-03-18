import { gl } from "./gl";
export class VertexLayout {
    private _allLayouts: Array<[type: number, count: number, normalized: boolean]>;
    private _stride: number;

    constructor() {
        this._stride = 0;
        this._allLayouts = [];
    }
    public addLayout(type: number, count: number, normalized: boolean): void {
        this._allLayouts.push([type, count, normalized]);
        this._stride += count * VertexLayout.getSize(type);
    }
    public static getSize(type: number): number {
        switch (type) {
            case gl.FLOAT, gl.INT, gl.UNSIGNED_INT: return 4;
            case gl.SHORT, gl.UNSIGNED_SHORT: return 2;
            case gl.BYTE, gl.UNSIGNED_BYTE: return 1;
            default: return 4;
        }
    }
    public get getStride(): number { return this._stride; }
    public get getNumLayout(): number { return this._allLayouts.length; }
    public get getLayouts(): Array<[type: number, count: number, normalized: boolean]> { return this._allLayouts; }

}