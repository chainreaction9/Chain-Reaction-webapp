import OBJ = require("webgl-obj-loader");
import { gl } from "./gl"
import { IndexBufferObject } from "./IndexBufferObject";
import { VertexArrayObject } from "./VertexArrayObject";
import { VertexBufferObject } from "./VertexBufferObject";
import { VertexLayout } from "./VertexLayout";
import { Shader } from "./Shader";


class MeshEntry {
    private _defaultMaterial: OBJ.Material = <OBJ.Material>{};
    private _indexBuffer: IndexBufferObject;
    public setMaterial(material: OBJ.Material): void { Object.assign(this._defaultMaterial, material); }
    public render(vao: VertexArrayObject, shaderProgram: Shader, applyMaterial?: boolean) {
        if (applyMaterial !== false) shaderProgram.applyMaterial(this._defaultMaterial);
        vao.setIndexBuffer(this._indexBuffer);
        vao.bind();
        for (let i = 0; i < vao.numAttr; i++) {
            gl.enableVertexAttribArray(i);
        }
        gl.drawElements(gl.TRIANGLES, vao.numIndices, gl.UNSIGNED_SHORT, 0);
        for (let i = 0; i < vao.numAttr; i++) {
            gl.disableVertexAttribArray(i);
        }
        vao.unbind();
    }
    constructor(indices: number[], material?: OBJ.Material) {
        if (material) Object.assign(this._defaultMaterial, material);
        let rawData: Uint16Array = new Uint16Array(indices);
        this._indexBuffer = new IndexBufferObject(rawData);
    }
    public cleanUp() {
        if (this._indexBuffer) {
            this._indexBuffer.cleanUp();
            this._indexBuffer = undefined;
        }
    }
}

export class MeshData {
    private _vao: VertexArrayObject;
    private _vbo: VertexBufferObject;
    private _meshName: string;
    private _meshList: Array<MeshEntry> = Array<MeshEntry>();

    constructor(meshObject: OBJ.Mesh) {
        if (meshObject.vertices.length !== meshObject.vertexNormals.length) { //If the mesh data does not contain same number of vertices and normals, handle error
            alert("Recieved corrupted mesh object '" + meshObject.name + "'. Number of vertices and normals do not match.");
            throw new Error("Recieved corrupted mesh object '" + meshObject.name + "'. Number of vertices and normals do not match.");
        }
        this._meshName = meshObject.name;
        let totalNumberOfMesh: number = meshObject.indicesPerMaterial.length; //Create a new mesh for each material
        for (let i = 0; i < totalNumberOfMesh; i++) {
            let rawIndexBuffer: number[] = meshObject.indicesPerMaterial[i];
            let rawMaterial: OBJ.Material = meshObject.materialsByIndex[i];
            if (rawMaterial === undefined) {//If no material was set, assign a default one.
                rawMaterial = <OBJ.Material>{};
                rawMaterial.ambient = [0, 0, 0];
                rawMaterial.diffuse = [0.8, 0, 0.002118];
                rawMaterial.specular = [1, 1, 1];
                rawMaterial.specularExponent = 233.3333333;
            }
            let meshEntry = new MeshEntry(rawIndexBuffer, rawMaterial);
            this._meshList.push(meshEntry);
        }
        this._vao = new VertexArrayObject();
        let layout = new VertexLayout();
        layout.addLayout(gl.FLOAT, 3, false); //Vertex position
        layout.addLayout(gl.FLOAT, 3, false); //Vertex normal
        let numberOfVertex = Math.floor(meshObject.vertices.length / 3); //meshObject.vertices is a flattened array. Actual number of vertices is therefore int(totalLenght/3).
        let texStride: number = 0;
        if (meshObject.textures.length != 0) { //If the mesh data contains texture coordinate, add the info to the layout.
            texStride = meshObject.textureStride;
        }
        else { //Otherwise add some default 0. This is done only to make the mesh data compatible with a generic shader code which assumes that all three vertex attributes exist (position, normal, texCoord)
            texStride = 2;
            for (let index = 0; index < 2 * numberOfVertex; index++) {
                meshObject.textures.push(0);
            }
        }
        layout.addLayout(gl.FLOAT, texStride, false); //Always add Texture Coordinate
        //Buffer to contain all vertex data (e.g., position, normal, texCoord) in an interleaved array.
        let allVertexData = new Float32Array(meshObject.vertices.length + meshObject.vertexNormals.length + texStride * numberOfVertex);        
        let currentOffset = 0;
        for (let index = 0; index < numberOfVertex; index++) {
            let vertX = meshObject.vertices[3 * index];
            let vertY = meshObject.vertices[3 * index + 1];
            let vertZ = meshObject.vertices[3 * index + 2];
            let normalX = meshObject.vertexNormals[3 * index];
            let normalY = meshObject.vertexNormals[3 * index + 1];
            let normalZ = meshObject.vertexNormals[3 * index + 2];
            allVertexData[currentOffset] = vertX; allVertexData[currentOffset + 1] = vertY; allVertexData[currentOffset + 2] = vertZ; //place vertex position in interleaved array
            allVertexData[currentOffset + 3] = normalX; allVertexData[currentOffset + 4] = normalY; allVertexData[currentOffset + 5] = normalZ; //place vertex position in interleaved array
            for (let texIndex = 0; texIndex < texStride; texIndex++) {
                allVertexData[currentOffset + 6 + texIndex] = meshObject.textures[texStride * index + texIndex];
            }
            currentOffset += texStride; // update offset due to texture coordinate
            currentOffset += 6; //update offset due to vertex position and normals.
        }
        //The interleaved data `allVertexData` is ready to be uploaded to the GPU
        this._vbo = new VertexBufferObject(allVertexData);
        this._vao.setVertexBuffer(this._vbo, layout); //Save the information of vertex buffer and layout to the vertex array object.
        this._vao.unbind();
    }
    public render(shaderProgram: Shader, applyMaterial?: boolean) {
        for (let meshEntry of this._meshList) {
            meshEntry.render(this._vao, shaderProgram, applyMaterial);
        }
    }
    public cleanUp() {
        if (this._vao) {
            this._vao.cleanUp();
            this._vao = undefined;
        }
        if (this._vbo) {
            this._vbo.cleanUp();
            this._vbo = undefined;
        }
        for (let entry of this._meshList) {
            entry.cleanUp();
        }
        this._meshList = [];
    }
}