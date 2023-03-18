import glm = require("gl-matrix");
import { gl } from "./gl"
import { VertexArrayObject } from "./VertexArrayObject";
import { VertexBufferObject } from "./VertexBufferObject";
import { VertexLayout } from "./VertexLayout";

export class Sphere {
    private _x: number;
    private _y: number;
    private _z: number;
    private _radius: number;
    private _elementCount: number;
    private _currentColor: string;

    private _vao: VertexArrayObject;
    private _vbo: VertexBufferObject;
    constructor() {
        this._y = 0;
        this._x = 0;
        this._z = 0;
        this._radius = 0;
        this._elementCount = 0;
        this._currentColor = "white";

    }

    public init(center_x: number, center_y: number, center_z: number, radius: number, lats: number = 32, longs: number = 32): void {
        if (this._vao != undefined) this._vao.cleanUp();
        if (this._vbo != undefined) this._vbo.cleanUp();
        let translateLeft = glm.mat4.create(), translateRight = glm.mat4.create(), translateTop = glm.mat4.create();
        let leftPosition = glm.vec4.fromValues(0, 0, 0, 0);
        let rightPosition = glm.vec4.fromValues(0, 0, 0, 0);
        let topPosition = glm.vec4.fromValues(0, 0, 0, 0);
        this._x = center_x;
        this._y = center_y;
        this._z = center_z;
        this._radius = radius;

        //Construction of level 1 sphere
        let vertCoord = new Array<[number, number, number]>(); //Stores coordinates of a vertex
        let vertNormal = new Array<[number, number, number]>(); //Stores normal of the corresponding vertex

        for (let i = 0; i <= lats; i++) {
            let lat0 = Math.PI * (-0.5 + (i - 1) / lats);
            let z0 = Math.sin(lat0);
            let zr0 = Math.cos(lat0);

            let lat1 = Math.PI * (-0.5 + i / lats);
            let z1 = Math.sin(lat1);
            let zr1 = Math.cos(lat1);
            for (let j = 0; j <= longs; j++) {
                let lng = 2 * Math.PI * j / longs;
                let x = Math.cos(lng);
                let y = Math.sin(lng);

                vertCoord.push([this._x + radius * x * zr1, this._y + radius * y * zr1, this._z + radius * z1]);
                vertNormal.push([x * zr1, y * zr1, z1]);

                vertCoord.push([this._x + radius * x * zr0, this._y + radius * y * zr0, this._z + radius * z0]);
                vertNormal.push([x * zr0, y * zr0, z0]);
            }
        }
        this._elementCount = vertCoord.length;

        //The flattened array contains total (1+2+3)*_elementCount vertices and each vertex contains total 6 floats (position , normal).
        let allDatatTyped = new Float32Array((1 + 2 + 3) * this._elementCount * (3 + 3));
        let currentOffset = 0;
        for (let i = 0; i < this._elementCount; i++) {
            allDatatTyped[currentOffset + 0] = vertCoord[i][0];
            allDatatTyped[currentOffset + 1] = vertCoord[i][1];
            allDatatTyped[currentOffset + 2] = vertCoord[i][2];
            allDatatTyped[currentOffset + 3] = vertNormal[i][0];
            allDatatTyped[currentOffset + 4] = vertNormal[i][1];
            allDatatTyped[currentOffset + 5] = vertNormal[i][2];
            currentOffset += 6;
        }
        //construction of level 2 sphere
        let displacement = (2 * radius) / 3.0;
        let secondVertCoord = new Array<[number, number, number]>(); //Stores coordinates of a vertex
        let secondVertNormal = new Array<[number, number, number]>();

        glm.mat4.translate(translateLeft, translateLeft, [-displacement, 0, 0]);
        glm.mat4.translate(translateRight, translateRight, [displacement, 0, 0]);

        for (let i = 0; i < this._elementCount; i++) {
            let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
            let normal: [number, number, number] = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];

            glm.vec4.transformMat4(leftPosition, position, translateLeft);
            glm.vec4.transformMat4(rightPosition, position, translateRight);
            secondVertCoord.splice(i, 0, [leftPosition[0], leftPosition[1], leftPosition[2]]);
            secondVertNormal.splice(i, 0, normal);
            secondVertCoord.push([rightPosition[0], rightPosition[1], rightPosition[2]]);
            secondVertNormal.push(normal);
        }
        for (let i = 0; i < secondVertCoord.length; i++) {
            allDatatTyped[currentOffset + 0] = secondVertCoord[i][0];
            allDatatTyped[currentOffset + 1] = secondVertCoord[i][1];
            allDatatTyped[currentOffset + 2] = secondVertCoord[i][2];
            allDatatTyped[currentOffset + 3] = secondVertNormal[i][0];
            allDatatTyped[currentOffset + 4] = secondVertNormal[i][1];
            allDatatTyped[currentOffset + 5] = secondVertNormal[i][2];
            currentOffset += 6;
        }
        //construction of level 3 sphere
        let thirdVertCoord = new Array<[number, number, number]>(); //Stores coordinates of a vertex
        let thirdVertNormal = new Array<[number, number, number]>();
        translateTop = glm.mat4.create(); translateLeft = glm.mat4.create(); translateRight = glm.mat4.create();
        glm.mat4.translate(translateTop, translateTop, [0, radius, 0]);
        glm.mat4.translate(translateLeft, translateLeft, [-radius * Math.cos(Math.PI / 6), -0.5 * radius, 0]);
        glm.mat4.translate(translateRight, translateRight, [radius * Math.cos(Math.PI / 6), -0.5 * radius, 0]);

        for (let i = 0; i < this._elementCount; i++) {
            let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
            let normal: [number, number, number] = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];

            glm.vec4.transformMat4(leftPosition, position, translateLeft);
            glm.vec4.transformMat4(rightPosition, position, translateRight);
            thirdVertCoord.splice(i, 0, [leftPosition[0], leftPosition[1], leftPosition[2]]);
            thirdVertNormal.splice(i, 0, normal);
            thirdVertCoord.push([rightPosition[0], rightPosition[1], rightPosition[2]]);
            thirdVertNormal.push(normal);
        }
        for (let i = 0; i < this._elementCount; i++) {
            let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
            let normal: [number, number, number] = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];

            glm.vec4.transformMat4(topPosition, position, translateTop);
            thirdVertCoord.push([topPosition[0], topPosition[1], topPosition[2]]);
            thirdVertNormal.push(normal);
        }
        for (let i = 0; i < thirdVertCoord.length; i++) {
            allDatatTyped[currentOffset + 0] = thirdVertCoord[i][0];
            allDatatTyped[currentOffset + 1] = thirdVertCoord[i][1];
            allDatatTyped[currentOffset + 2] = thirdVertCoord[i][2];
            allDatatTyped[currentOffset + 3] = thirdVertNormal[i][0];
            allDatatTyped[currentOffset + 4] = thirdVertNormal[i][1];
            allDatatTyped[currentOffset + 5] = thirdVertNormal[i][2];
            currentOffset += 6;
        }
        this._vao = new VertexArrayObject();
        this._vbo = new VertexBufferObject(allDatatTyped);
        let layout = new VertexLayout();
        layout.addLayout(gl.FLOAT, 3, false); //Layout for vertex coordinate
        layout.addLayout(gl.FLOAT, 3, false); //Layout for vertex normal
        this._vao.setVertexBuffer(this._vbo, layout);
        
    }
    public get getColor(): string {
        return this._currentColor;
    }
    public set setColor(color: string) {
        this._currentColor = color;
    }

    public draw(level: number): void {
        let offset = 0;
        if (level == 2) offset = this._elementCount;
        else if (level == 3) offset = 3 * this._elementCount;
        this._vao.bind();
        for (let i = 0; i < this._vao.numAttr; i++) {
            gl.enableVertexAttribArray(i);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, this._elementCount * level);
        for (let i = 0; i < this._vao.numAttr; i++) {
            gl.disableVertexAttribArray(i);
        }
        this._vao.unbind();
    }

    public cleanUp(): void {
        this._vbo.cleanUp();
        this._vao.cleanUp();
    }
}