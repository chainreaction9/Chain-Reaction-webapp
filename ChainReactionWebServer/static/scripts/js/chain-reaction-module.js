define("gl", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.glUtilities = exports.gl = void 0;
    class glUtilities {
        static intialize(parentID, menubarID, elementID) {
            let canvas;
            if (elementID !== undefined) {
                canvas = document.getElementById(elementID);
                if (!canvas || canvas === undefined) {
                    alert("Could not locate html canvas element with ID: " + elementID);
                    throw new Error("Could not find canvas element with ID: " + elementID);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.getElementById(parentID).appendChild(canvas);
            }
            exports.gl = canvas.getContext("webgl2");
            if (exports.gl === undefined) {
                alert("Unable to initialize WebGL 2. Please check if your browser supports this context!");
                throw new Error("Unable to initialize WebGL 2. Your browser may not support it.");
            }
            else {
                exports.gl.clearColor(0, 0, 0, 1);
                exports.gl.clearDepth(1.0);
            }
            let w = $("#" + parentID).width();
            let h = $("#" + parentID).height();
            canvas.setAttribute("width", w.toString());
            canvas.setAttribute("height", h.toString());
            if ($(window).width() <= 600) {
                $("#" + menubarID).attr("data-state", "0");
            }
            return canvas;
        }
    }
    exports.glUtilities = glUtilities;
});
define("IndexBufferObject", ["require", "exports", "gl"], function (require, exports, gl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexBufferObject = void 0;
    class IndexBufferObject {
        constructor(data) {
            if (this._iboOBJ != undefined)
                gl_1.gl.deleteBuffer(this._iboOBJ);
            this._iboOBJ = gl_1.gl.createBuffer();
            gl_1.gl.bindBuffer(gl_1.gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
            gl_1.gl.bufferData(gl_1.gl.ELEMENT_ARRAY_BUFFER, data, gl_1.gl.STATIC_DRAW);
            this._count = data.length;
        }
        bind() {
            gl_1.gl.bindBuffer(gl_1.gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
        }
        unbind() {
            gl_1.gl.bindBuffer(gl_1.gl.ELEMENT_ARRAY_BUFFER, null);
        }
        cleanUp() {
            if (this._iboOBJ !== undefined) {
                gl_1.gl.deleteBuffer(this._iboOBJ);
                this._iboOBJ = undefined;
                this._count = 0;
            }
        }
        loadNewBuffer(data) {
            this.cleanUp();
            this._iboOBJ = gl_1.gl.createBuffer();
            gl_1.gl.bindBuffer(gl_1.gl.ELEMENT_ARRAY_BUFFER, this._iboOBJ);
            gl_1.gl.bufferData(gl_1.gl.ELEMENT_ARRAY_BUFFER, data, gl_1.gl.STATIC_DRAW);
            this._count = data.length;
        }
        get getCount() {
            return this._count;
        }
    }
    exports.IndexBufferObject = IndexBufferObject;
});
define("VertexBufferObject", ["require", "exports", "gl"], function (require, exports, gl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VertexBufferObject = void 0;
    class VertexBufferObject {
        constructor(data) {
            this._vboObj = gl_2.gl.createBuffer();
            gl_2.gl.bindBuffer(gl_2.gl.ARRAY_BUFFER, this._vboObj);
            gl_2.gl.bufferData(gl_2.gl.ARRAY_BUFFER, data, gl_2.gl.STATIC_DRAW);
            this._size = data.byteLength;
        }
        bind() {
            gl_2.gl.bindBuffer(gl_2.gl.ARRAY_BUFFER, this._vboObj);
        }
        unbind() {
            gl_2.gl.bindBuffer(gl_2.gl.ARRAY_BUFFER, null);
        }
        get getSize() {
            return this._size;
        }
        cleanUp() {
            if (this._vboObj !== undefined) {
                gl_2.gl.deleteBuffer(this._vboObj);
                this._vboObj = undefined;
                this._size = 0;
            }
        }
        loadNewBuffer(data) {
            this.cleanUp();
            this._vboObj = gl_2.gl.createBuffer();
            gl_2.gl.bindBuffer(gl_2.gl.ARRAY_BUFFER, this._vboObj);
            gl_2.gl.bufferData(gl_2.gl.ARRAY_BUFFER, data, gl_2.gl.STATIC_DRAW);
            this._size = data.byteLength;
        }
    }
    exports.VertexBufferObject = VertexBufferObject;
});
define("VertexLayout", ["require", "exports", "gl"], function (require, exports, gl_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VertexLayout = void 0;
    class VertexLayout {
        constructor() {
            this._stride = 0;
            this._allLayouts = [];
        }
        addLayout(type, count, normalized) {
            this._allLayouts.push([type, count, normalized]);
            this._stride += count * VertexLayout.getSize(type);
        }
        static getSize(type) {
            switch (type) {
                case gl_3.gl.FLOAT, gl_3.gl.INT, gl_3.gl.UNSIGNED_INT: return 4;
                case gl_3.gl.SHORT, gl_3.gl.UNSIGNED_SHORT: return 2;
                case gl_3.gl.BYTE, gl_3.gl.UNSIGNED_BYTE: return 1;
                default: return 4;
            }
        }
        get getStride() { return this._stride; }
        get getNumLayout() { return this._allLayouts.length; }
        get getLayouts() { return this._allLayouts; }
    }
    exports.VertexLayout = VertexLayout;
});
define("VertexArrayObject", ["require", "exports", "gl", "VertexLayout"], function (require, exports, gl_4, VertexLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VertexArrayObject = void 0;
    class VertexArrayObject {
        constructor() {
            this._vaoObj = gl_4.gl.createVertexArray();
            this._numIndices = 0;
            this._numAttributes = 1;
        }
        bind() {
            gl_4.gl.bindVertexArray(this._vaoObj);
        }
        unbind() {
            gl_4.gl.bindVertexArray(null);
        }
        get numAttr() {
            return this._numAttributes;
        }
        get numIndices() {
            return this._numIndices;
        }
        cleanUp() {
            if (this._vaoObj !== undefined) {
                gl_4.gl.deleteVertexArray(this._vaoObj);
                this._vaoObj = undefined;
                this._numAttributes = 1;
                this._numIndices = 0;
            }
        }
        setVertexBuffer(vb, layout) {
            this.bind();
            vb.bind();
            this._numAttributes = layout.getNumLayout;
            let layoutList = layout.getLayouts;
            let offset = 0;
            for (var i = 0; i < layoutList.length; i++) {
                let _layoutEntry = layoutList[i];
                gl_4.gl.enableVertexAttribArray(i);
                gl_4.gl.vertexAttribPointer(i, _layoutEntry[1], _layoutEntry[0], _layoutEntry[2], layout.getStride, offset);
                offset += _layoutEntry[1] * VertexLayout_1.VertexLayout.getSize(_layoutEntry[0]);
                gl_4.gl.disableVertexAttribArray(i);
            }
        }
        setIndexBuffer(ib) {
            this.bind();
            ib.bind();
            this.unbind();
            ib.unbind();
            this._numIndices = ib.getCount;
        }
    }
    exports.VertexArrayObject = VertexArrayObject;
});
define("Shader", ["require", "exports", "gl"], function (require, exports, gl_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Shader = void 0;
    class Shader {
        constructor() {
            this._currentMaterial = {};
            this._uniformList = new Map();
        }
        compile(VertSource, FragSource) {
            this._VertexShader = VertSource;
            this._FragmentShader = FragSource;
            this._VertObj = gl_5.gl.createShader(gl_5.gl.VERTEX_SHADER);
            gl_5.gl.shaderSource(this._VertObj, this._VertexShader);
            gl_5.gl.compileShader(this._VertObj);
            let isCompiled = gl_5.gl.getShaderParameter(this._VertObj, gl_5.gl.COMPILE_STATUS);
            if (!isCompiled) {
                let msg = gl_5.gl.getShaderInfoLog(this._VertObj);
                gl_5.gl.deleteShader(this._VertObj);
                throw new Error("Failed to compile vertex shader: " + msg);
            }
            this._FragObj = gl_5.gl.createShader(gl_5.gl.FRAGMENT_SHADER);
            gl_5.gl.shaderSource(this._FragObj, this._FragmentShader);
            gl_5.gl.compileShader(this._FragObj);
            isCompiled = gl_5.gl.getShaderParameter(this._FragObj, gl_5.gl.COMPILE_STATUS);
            if (!isCompiled) {
                let msg = gl_5.gl.getShaderInfoLog(this._FragObj);
                gl_5.gl.deleteShader(this._VertObj);
                gl_5.gl.deleteShader(this._FragObj);
                throw new Error("Failed to compile fragment shader: " + msg);
            }
            if (this._programObj !== undefined)
                gl_5.gl.deleteProgram(this._programObj);
            this._programObj = gl_5.gl.createProgram();
            gl_5.gl.attachShader(this._programObj, this._VertObj);
            gl_5.gl.attachShader(this._programObj, this._FragObj);
            gl_5.gl.linkProgram(this._programObj);
            let isLinked = gl_5.gl.getProgramParameter(this._programObj, gl_5.gl.LINK_STATUS);
            if (!isLinked) {
                let msg = gl_5.gl.getProgramInfoLog(this._programObj);
                gl_5.gl.detachShader(this._programObj, this._VertObj);
                gl_5.gl.detachShader(this._programObj, this._FragObj);
                gl_5.gl.deleteProgram(this._programObj);
                gl_5.gl.deleteShader(this._VertObj);
                gl_5.gl.deleteShader(this._FragObj);
                throw new Error("Failed to link program: " + msg);
            }
            gl_5.gl.detachShader(this._programObj, this._VertObj);
            gl_5.gl.detachShader(this._programObj, this._FragObj);
            gl_5.gl.deleteShader(this._VertObj);
            gl_5.gl.deleteShader(this._FragObj);
            this._VertObj = undefined;
            this._FragObj = undefined;
            this._detectUniforms();
            return true;
        }
        /**
        * Updates the uniform variables associated with material
        * properties (e.g., diffuse color, ambient color, specular color, specular exponent etc.) in the fragment shader.
        * Assumes that the fragment (or vertex) shader contains the
        * following uniform variables:
        * 	1. `vDiffuse` (diffuse color, type: vec3<float>),
        * 	2. `vSpecular` (specular color, type: vec3<float>),
        * 	3. `vSpecularExponent` (specular exponent, type: float).
        * @param {obj::Material} material: a Material object containing associated material properties.
        * @returns true if at least one material property is updated, false otherwise.
        */
        applyMaterial(material) {
            if ((this._currentMaterial.name) && (this._currentMaterial.name === material.name)) {
                return true;
            }
            let success = false;
            this.bind();
            let location = this.getUniformLocation("vDiffuse");
            if (location !== -1) {
                gl_5.gl.uniform3f(location, material.diffuse[0], material.diffuse[1], material.diffuse[2]);
                success = true;
            }
            location = this.getUniformLocation("vSpecular");
            if (location !== -1) {
                gl_5.gl.uniform3f(location, material.specular[0], material.specular[1], material.specular[2]);
                success = true;
            }
            location = this.getUniformLocation("vSpecularExponent");
            if (location !== -1) {
                gl_5.gl.uniform1f(location, material.specularExponent);
                success = true;
            }
            Object.assign(this._currentMaterial, material);
            return success;
        }
        bind() {
            gl_5.gl.useProgram(this._programObj);
        }
        unbind() {
            gl_5.gl.useProgram(null);
        }
        get getProgram() {
            return this._programObj;
        }
        getUniformLocation(uniformName) {
            if (this._uniformList.has(uniformName))
                return this._uniformList.get(uniformName);
            else {
                return -1;
            }
        }
        cleanUp() {
            if (this._VertObj != undefined) {
                gl_5.gl.detachShader(this._programObj, this._VertObj);
                gl_5.gl.deleteShader(this._VertObj);
                this._VertObj = undefined;
            }
            if (this._FragObj != undefined) {
                gl_5.gl.detachShader(this._programObj, this._FragObj);
                gl_5.gl.deleteShader(this._FragObj);
                this._FragObj = undefined;
            }
            if (this._programObj !== undefined) {
                gl_5.gl.deleteProgram(this._programObj);
                this._programObj = undefined;
            }
        }
        _detectUniforms() {
            let totalUniformNum = gl_5.gl.getProgramParameter(this._programObj, gl_5.gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < totalUniformNum; i++) {
                let uniformInfo = gl_5.gl.getActiveUniform(this._programObj, i);
                let location = gl_5.gl.getUniformLocation(this._programObj, uniformInfo.name);
                if (location != -1)
                    this._uniformList.set(uniformInfo.name, location);
            }
        }
    }
    exports.Shader = Shader;
});
define("MeshContainer", ["require", "exports", "gl", "IndexBufferObject", "VertexArrayObject", "VertexBufferObject", "VertexLayout"], function (require, exports, gl_6, IndexBufferObject_1, VertexArrayObject_1, VertexBufferObject_1, VertexLayout_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeshData = void 0;
    class MeshEntry {
        constructor(indices, material) {
            this._defaultMaterial = {};
            if (material)
                Object.assign(this._defaultMaterial, material);
            let rawData = new Uint16Array(indices);
            this._indexBuffer = new IndexBufferObject_1.IndexBufferObject(rawData);
        }
        setMaterial(material) { Object.assign(this._defaultMaterial, material); }
        render(vao, shaderProgram, applyMaterial) {
            if (applyMaterial !== false)
                shaderProgram.applyMaterial(this._defaultMaterial);
            vao.setIndexBuffer(this._indexBuffer);
            vao.bind();
            for (let i = 0; i < vao.numAttr; i++) {
                gl_6.gl.enableVertexAttribArray(i);
            }
            gl_6.gl.drawElements(gl_6.gl.TRIANGLES, vao.numIndices, gl_6.gl.UNSIGNED_SHORT, 0);
            for (let i = 0; i < vao.numAttr; i++) {
                gl_6.gl.disableVertexAttribArray(i);
            }
            vao.unbind();
        }
        cleanUp() {
            if (this._indexBuffer) {
                this._indexBuffer.cleanUp();
                this._indexBuffer = undefined;
            }
        }
    }
    class MeshData {
        constructor(meshObject) {
            this._meshList = Array();
            if (meshObject.vertices.length !== meshObject.vertexNormals.length) { //If the mesh data does not contain same number of vertices and normals, handle error
                alert("Recieved corrupted mesh object '" + meshObject.name + "'. Number of vertices and normals do not match.");
                throw new Error("Recieved corrupted mesh object '" + meshObject.name + "'. Number of vertices and normals do not match.");
            }
            this._meshName = meshObject.name;
            let totalNumberOfMesh = meshObject.indicesPerMaterial.length; //Create a new mesh for each material
            for (let i = 0; i < totalNumberOfMesh; i++) {
                let rawIndexBuffer = meshObject.indicesPerMaterial[i];
                let rawMaterial = meshObject.materialsByIndex[i];
                if (rawMaterial === undefined) { //If no material was set, assign a default one.
                    rawMaterial = {};
                    rawMaterial.ambient = [0, 0, 0];
                    rawMaterial.diffuse = [0.8, 0, 0.002118];
                    rawMaterial.specular = [1, 1, 1];
                    rawMaterial.specularExponent = 233.3333333;
                }
                let meshEntry = new MeshEntry(rawIndexBuffer, rawMaterial);
                this._meshList.push(meshEntry);
            }
            this._vao = new VertexArrayObject_1.VertexArrayObject();
            let layout = new VertexLayout_2.VertexLayout();
            layout.addLayout(gl_6.gl.FLOAT, 3, false); //Vertex position
            layout.addLayout(gl_6.gl.FLOAT, 3, false); //Vertex normal
            let numberOfVertex = Math.floor(meshObject.vertices.length / 3); //meshObject.vertices is a flattened array. Actual number of vertices is therefore int(totalLenght/3).
            let texStride = 0;
            if (meshObject.textures.length != 0) { //If the mesh data contains texture coordinate, add the info to the layout.
                texStride = meshObject.textureStride;
            }
            else { //Otherwise add some default 0. This is done only to make the mesh data compatible with a generic shader code which assumes that all three vertex attributes exist (position, normal, texCoord)
                texStride = 2;
                for (let index = 0; index < 2 * numberOfVertex; index++) {
                    meshObject.textures.push(0);
                }
            }
            layout.addLayout(gl_6.gl.FLOAT, texStride, false); //Always add Texture Coordinate
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
                allVertexData[currentOffset] = vertX;
                allVertexData[currentOffset + 1] = vertY;
                allVertexData[currentOffset + 2] = vertZ; //place vertex position in interleaved array
                allVertexData[currentOffset + 3] = normalX;
                allVertexData[currentOffset + 4] = normalY;
                allVertexData[currentOffset + 5] = normalZ; //place vertex position in interleaved array
                for (let texIndex = 0; texIndex < texStride; texIndex++) {
                    allVertexData[currentOffset + 6 + texIndex] = meshObject.textures[texStride * index + texIndex];
                }
                currentOffset += texStride; // update offset due to texture coordinate
                currentOffset += 6; //update offset due to vertex position and normals.
            }
            //The interleaved data `allVertexData` is ready to be uploaded to the GPU
            this._vbo = new VertexBufferObject_1.VertexBufferObject(allVertexData);
            this._vao.setVertexBuffer(this._vbo, layout); //Save the information of vertex buffer and layout to the vertex array object.
            this._vao.unbind();
        }
        render(shaderProgram, applyMaterial) {
            for (let meshEntry of this._meshList) {
                meshEntry.render(this._vao, shaderProgram, applyMaterial);
            }
        }
        cleanUp() {
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
    exports.MeshData = MeshData;
});
define("Sphere", ["require", "exports", "gl-matrix", "gl", "VertexArrayObject", "VertexBufferObject", "VertexLayout"], function (require, exports, glm, gl_7, VertexArrayObject_2, VertexBufferObject_2, VertexLayout_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sphere = void 0;
    class Sphere {
        constructor() {
            this._y = 0;
            this._x = 0;
            this._z = 0;
            this._radius = 0;
            this._elementCount = 0;
            this._currentColor = "white";
        }
        init(center_x, center_y, center_z, radius, lats = 32, longs = 32) {
            if (this._vao != undefined)
                this._vao.cleanUp();
            if (this._vbo != undefined)
                this._vbo.cleanUp();
            let translateLeft = glm.mat4.create(), translateRight = glm.mat4.create(), translateTop = glm.mat4.create();
            let leftPosition = glm.vec4.fromValues(0, 0, 0, 0);
            let rightPosition = glm.vec4.fromValues(0, 0, 0, 0);
            let topPosition = glm.vec4.fromValues(0, 0, 0, 0);
            this._x = center_x;
            this._y = center_y;
            this._z = center_z;
            this._radius = radius;
            //Construction of level 1 sphere
            let vertCoord = new Array(); //Stores coordinates of a vertex
            let vertNormal = new Array(); //Stores normal of the corresponding vertex
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
            let secondVertCoord = new Array(); //Stores coordinates of a vertex
            let secondVertNormal = new Array();
            glm.mat4.translate(translateLeft, translateLeft, [-displacement, 0, 0]);
            glm.mat4.translate(translateRight, translateRight, [displacement, 0, 0]);
            for (let i = 0; i < this._elementCount; i++) {
                let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
                let normal = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];
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
            let thirdVertCoord = new Array(); //Stores coordinates of a vertex
            let thirdVertNormal = new Array();
            translateTop = glm.mat4.create();
            translateLeft = glm.mat4.create();
            translateRight = glm.mat4.create();
            glm.mat4.translate(translateTop, translateTop, [0, radius, 0]);
            glm.mat4.translate(translateLeft, translateLeft, [-radius * Math.cos(Math.PI / 6), -0.5 * radius, 0]);
            glm.mat4.translate(translateRight, translateRight, [radius * Math.cos(Math.PI / 6), -0.5 * radius, 0]);
            for (let i = 0; i < this._elementCount; i++) {
                let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
                let normal = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];
                glm.vec4.transformMat4(leftPosition, position, translateLeft);
                glm.vec4.transformMat4(rightPosition, position, translateRight);
                thirdVertCoord.splice(i, 0, [leftPosition[0], leftPosition[1], leftPosition[2]]);
                thirdVertNormal.splice(i, 0, normal);
                thirdVertCoord.push([rightPosition[0], rightPosition[1], rightPosition[2]]);
                thirdVertNormal.push(normal);
            }
            for (let i = 0; i < this._elementCount; i++) {
                let position = glm.vec4.fromValues(vertCoord[i][0], vertCoord[i][1], vertCoord[i][2], 1);
                let normal = [vertNormal[i][0], vertNormal[i][1], vertNormal[i][2]];
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
            this._vao = new VertexArrayObject_2.VertexArrayObject();
            this._vbo = new VertexBufferObject_2.VertexBufferObject(allDatatTyped);
            let layout = new VertexLayout_3.VertexLayout();
            layout.addLayout(gl_7.gl.FLOAT, 3, false); //Layout for vertex coordinate
            layout.addLayout(gl_7.gl.FLOAT, 3, false); //Layout for vertex normal
            this._vao.setVertexBuffer(this._vbo, layout);
        }
        get getColor() {
            return this._currentColor;
        }
        set setColor(color) {
            this._currentColor = color;
        }
        draw(level) {
            let offset = 0;
            if (level == 2)
                offset = this._elementCount;
            else if (level == 3)
                offset = 3 * this._elementCount;
            this._vao.bind();
            for (let i = 0; i < this._vao.numAttr; i++) {
                gl_7.gl.enableVertexAttribArray(i);
            }
            gl_7.gl.drawArrays(gl_7.gl.TRIANGLE_STRIP, offset, this._elementCount * level);
            for (let i = 0; i < this._vao.numAttr; i++) {
                gl_7.gl.disableVertexAttribArray(i);
            }
            this._vao.unbind();
        }
        cleanUp() {
            this._vbo.cleanUp();
            this._vao.cleanUp();
        }
    }
    exports.Sphere = Sphere;
});
define("offlineMaingame", ["require", "exports", "gl-matrix", "gl", "IndexBufferObject", "Shader", "Sphere", "VertexArrayObject", "VertexBufferObject", "VertexLayout"], function (require, exports, glm, gl_8, IndexBufferObject_2, Shader_1, Sphere_1, VertexArrayObject_3, VertexBufferObject_3, VertexLayout_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainGame = exports.colorList = void 0;
    exports.colorList = new Map([
        ["red", [1, 0, 0]],
        ["green", [0, 1, 0]],
        ["blue", [0.1, 0.3, 1]],
        ["yellow", [1, 1, 0]],
        ["cyan", [0, 1, 1]],
        ["purple", [0.58, 0, 0.83]],
        ["violet", [0.431, 0.392, 1]],
        ["pink", [1, 0.412, 0.706]],
        ["orange", [1, 0.27, 0]],
        ["brown", [0.706, 0.314, 0.196]],
        ["maroon", [0.70, 0.18, 0.36]],
        ["grey", [0.67, 0.67, 0.67]]
    ]);
    class MainGame {
        constructor(config) {
            this._blastSound = undefined;
            this._cameraPosition = [0, 0, 0];
            this._cameraTarget = [0, 0, 1];
            this._cameraUp = [0, 1, 0];
            this._lightDirLatitude = 0.0;
            this._lightDirLongitude = 0.0;
            if (config.AudioElementID) {
                this._blastSound = document.getElementById(config.AudioElementID);
                if (this._blastSound === undefined)
                    throw new Error(`Could not find html audio element with id: ${config.AudioElementID}`);
                else
                    this._initDefaults();
            }
            else
                throw new Error("AudioElementID in the configuration setting does not point to a valid HTMLAudioElement in the html document.");
            if (config.CurrentPlayerLabelElementID) {
                let htmlElement = document.getElementById(config.CurrentPlayerLabelElementID);
                if (!htmlElement)
                    throw new Error(`Could not find html label element with id: ${config.CurrentPlayerLabelElementID}`);
                this._currentPlayerLabelElement = htmlElement;
            }
            else
                throw new Error("CurrentPlayerLabelElementID in the configuration setting does not point to a valid HTMLLabelElement in the html document.");
            if (config.CurrentPlayerLabelMobileElementID) {
                let htmlElement = document.getElementById(config.CurrentPlayerLabelMobileElementID);
                if (!htmlElement)
                    throw new Error(`Could not find html label element with id: ${config.CurrentPlayerLabelMobileElementID}`);
                this._currentPlayerMobileLabelElement = htmlElement;
            }
            else
                throw new Error("CurrentPlayerLabelMobileElementID in the configuration setting does not point to a valid HTMLLabelElement in the html document.");
        }
        //***************************************************************************************************** */
        //************************************** Private methods ***********************************************
        //***************************************************************************************************** */
        _applyGridShaderSettings() {
            let grid_data = this._createGridData(this._ROW_DIV, this._COL_DIV, this._CUBE_WIDTH);
            this._GRID_VAO = new Map([
                [MainGame.cantorValue(this._ROW_DIV, this._COL_DIV), grid_data[0]]
            ]);
            this._GRID_VBO = new Map([
                [MainGame.cantorValue(this._ROW_DIV, this._COL_DIV), grid_data[1]]
            ]);
            this._GRID_IBO = new Map([
                [MainGame.cantorValue(this._ROW_DIV, this._COL_DIV), grid_data[2]]
            ]);
            let vertGridSource = "#version 300 es\n\
                              layout(location = 0) in vec3 vertexPosition;\n\
                              layout(location = 1) in float isVertexBackface;\n\
                              out float isVertexPartOfBackface;\n\
                              uniform mat4 transform;\n\
                              void main() {\n\
                              	gl_Position = transform * vec4(vertexPosition, 1.0);\n\
                                isVertexPartOfBackface = isVertexBackface;\n\
                              }";
            let fragGridSource = "#version 300 es\n\
                              precision highp float;\
                              in float isVertexPartOfBackface;\n\
                              out vec4 color;\n\
                              uniform vec4 backsideColor;\n\
                              uniform vec4 frontsideColor;\n\
                              void main() {\n\
                              	color = clamp(isVertexPartOfBackface * backsideColor + (1.0 - isVertexPartOfBackface) * frontsideColor, 0.0, 1.0);\n\
                              }";
            this._gridShaderProgram = new Shader_1.Shader();
            this._gridShaderProgram.compile(vertGridSource, fragGridSource);
            //Initialize uniform variables with default values.
            this._gridShaderProgram.bind();
            let location = this._gridShaderProgram.getUniformLocation("backsideColor");
            if (location != -1)
                gl_8.gl.uniform4f(location, 0, 0.5, 0, 1.0);
            location = this._gridShaderProgram.getUniformLocation("frontsideColor");
            if (location != -1)
                gl_8.gl.uniform4f(location, 0, 1.0, 0, 1.0);
            location = this._gridShaderProgram.getUniformLocation("transform");
            let defaultMatrix = glm.mat4.create();
            if (location != -1)
                gl_8.gl.uniformMatrix4fv(location, false, defaultMatrix);
            this._gridShaderProgram.unbind();
        }
        _applyOrbShaderSettings() {
            //Vertex shader for rendering orbs
            let vertOrbSource = "#version 300 es\n\
            layout(location = 0) in vec3 vertexPosition;\n\
            layout(location = 1) in vec3 vertexNormal;\n\
            layout(location = 2) in vec2 texCoord;\n\
            layout(location = 3) in vec4 vertexColor;\n\
            out highp vec3 normal;\n\
            out highp vec4 vPosition;\
            uniform mat4 projectionView;\n\
            uniform mat4 modelTransform;\n\
            void main() {\n\
            	vPosition = modelTransform * vec4(vertexPosition, 1.0);\n\
            	gl_Position = projectionView * vPosition;\n\
            	normal = normalize(vec3(modelTransform * vec4(vertexNormal, 0)));\n\
            }";
            //Fragment shader for rendering orbs
            let fragOrbSource = "#version 300 es\n\
            precision highp float;\n\
            in highp vec3 normal;\n\
            in highp vec4 vPosition;\
            out highp vec4 outputColor;\n\
            uniform vec3 cameraPosition;\n\
            uniform vec4 orbColor;\n\
            uniform vec3 vDiffuse;\n\
            uniform vec3 vSpecular;\n\
            uniform float vSpecularExponent;\n\
            uniform vec3 lightDirection;\n\
            void main(){\n\
            	vec3 viewDir = normalize(cameraPosition - vPosition.xyz); \n\
                vec3 sunDir = normalize(lightDirection);\n\
                vec3 reflectionVector =  normalize(2.0 * dot(normal, -sunDir) * normal + sunDir);\n\
                float brightness = clamp(1.1 * dot(normal, -sunDir), 0.0, 1.0);\n\
                vec3 modifiedDiffuseColor = orbColor.xyz;\n\
                vec3 specularComponent = clamp(vSpecular * pow(dot(reflectionVector, viewDir), vSpecularExponent), 0.0, 1.0);\n\
                vec3 color = clamp((modifiedDiffuseColor + specularComponent) * brightness, 0.0, 1.0);\n\
                outputColor = vec4(color , 1.0);\n\
            }";
            this._orbShaderProgram = new Shader_1.Shader();
            this._orbShaderProgram.compile(vertOrbSource, fragOrbSource);
            this._orbShaderProgram.bind();
            //Update orbColor uniform variable
            let location = this._orbShaderProgram.getUniformLocation("orbColor");
            let defaultOrbColor = [1.0, 1.0, 1.0, 1.0];
            if (location != -1)
                gl_8.gl.uniform4f(location, defaultOrbColor[0], defaultOrbColor[1], defaultOrbColor[2], defaultOrbColor[3]);
            //***********************************************************
            //Update uniform variable (modelview matrix) in shader
            let defaultMatrix = glm.mat4.create();
            location = this._orbShaderProgram.getUniformLocation("modelTransform");
            if (location != -1)
                gl_8.gl.uniformMatrix4fv(location, false, defaultMatrix);
            //********************************************************************************
            //Update uniform variable (projection matrix) in shader
            location = this._orbShaderProgram.getUniformLocation("projectionView");
            if (location != -1)
                gl_8.gl.uniformMatrix4fv(location, false, defaultMatrix);
            //******************************************************************************
            //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
            let lightDir = this.getGlCompatibleCoordinate(1.0, this._lightDirLatitude, this._lightDirLongitude);
            location = this._orbShaderProgram.getUniformLocation("lightDirection");
            if (location != -1)
                gl_8.gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
            //*************************************************************************
            //Update camera position 
            location = this._orbShaderProgram.getUniformLocation("cameraPosition");
            if (location != -1)
                gl_8.gl.uniform3f(location, this._cameraPosition[0], this._cameraPosition[1], this._cameraPosition[2]); //Update uniform variable (camera position) in shader
            //*************************************************************
            //Update uniform variable (vDiffuse) in shader
            location = this._orbShaderProgram.getUniformLocation("vDiffuse");
            if (location != -1)
                gl_8.gl.uniform3f(location, 0.0, 0.0, 0.0);
            //********************************************************************
            //Update uniform variable (vSpecular) in shader
            location = this._orbShaderProgram.getUniformLocation("vSpecular");
            if (location != -1)
                gl_8.gl.uniform3f(location, 1.0, 1.0, 1.0);
            //************************************************************************
            //Update uniform variable (vSpecularExponent) in shader
            location = this._orbShaderProgram.getUniformLocation("vSpecularExponent");
            if (location != -1)
                gl_8.gl.uniform1f(location, 233.3333);
            //******************************************************************************
            this._orbShaderProgram.unbind();
            //*************************************************************
        }
        _createGridData(numberOfRows, numberOfColumns, cubeWidth, centerX = 0, centerY = 0) {
            let width = numberOfColumns * cubeWidth, height = numberOfRows * cubeWidth;
            let floatSize = VertexLayout_4.VertexLayout.getSize(gl_8.gl.FLOAT);
            let halfRequiredMemory = (numberOfRows + 1) * (numberOfColumns + 1) * (3 * floatSize + 1 * floatSize);
            let buffer = new ArrayBuffer(2 * halfRequiredMemory);
            let offset = 0;
            for (let i = 0; i !== numberOfRows + 1; i++) {
                for (let j = 0; j !== numberOfColumns + 1; j++) {
                    let x = (centerX - 0.5 * width) + j * cubeWidth;
                    let y = (centerY + 0.5 * height) - i * cubeWidth;
                    let z = -0.5 * cubeWidth;
                    let coordViewBack = new Float32Array(buffer, offset, 3);
                    let coordViewFront = new Float32Array(buffer, halfRequiredMemory + offset, 3);
                    coordViewBack[0] = x;
                    coordViewBack[1] = y;
                    coordViewBack[2] = z;
                    coordViewFront[0] = x;
                    coordViewFront[1] = y;
                    coordViewFront[2] = -z;
                    offset += 3 * floatSize;
                    let isVertexBackfaceBackLayer = new Float32Array(buffer, offset, 1);
                    let isVertexBackfaceFrontLayer = new Float32Array(buffer, halfRequiredMemory + offset, 1);
                    isVertexBackfaceFrontLayer[0] = 0.0;
                    isVertexBackfaceBackLayer[0] = 1.0;
                    offset += 1 * floatSize;
                }
            }
            let vb = new VertexBufferObject_3.VertexBufferObject(buffer);
            let layout = new VertexLayout_4.VertexLayout();
            layout.addLayout(gl_8.gl.FLOAT, 3, false);
            layout.addLayout(gl_8.gl.FLOAT, 1, true);
            let va = new VertexArrayObject_3.VertexArrayObject();
            va.setVertexBuffer(vb, layout);
            let indices = new Array();
            for (let i = 0; i !== (numberOfRows + 1); i++) {
                indices.push(i * (numberOfColumns + 1));
                indices.push(i * (numberOfColumns + 1) + numberOfColumns);
                indices.push((numberOfColumns + 1) * (numberOfRows + 1) + i * (numberOfColumns + 1));
                indices.push((numberOfColumns + 1) * (numberOfRows + 1) + i * (numberOfColumns + 1) + numberOfColumns);
            }
            for (let i = 0; i !== (numberOfColumns + 1); i++) {
                indices.push(i);
                indices.push(i + numberOfRows * (numberOfColumns + 1));
                indices.push((numberOfColumns + 1) * (numberOfRows + 1) + i);
                indices.push((numberOfColumns + 1) * (numberOfRows + 1) + i + numberOfRows * (numberOfColumns + 1));
            }
            for (let i = 0; i !== (numberOfColumns + 1) * (numberOfRows + 1); i++) {
                indices.push(i);
                indices.push((numberOfColumns + 1) * (numberOfRows + 1) + i);
            }
            let ib_data = new Uint16Array(indices);
            let ib = new IndexBufferObject_2.IndexBufferObject(ib_data);
            va.setIndexBuffer(ib);
            return [va, vb, ib];
        }
        _drawGrid() {
            this._gridShaderProgram.bind();
            let key = MainGame.cantorValue(this._ROW_DIV, this._COL_DIV);
            let va = this._GRID_VAO.get(key);
            va.bind();
            for (let i = 0; i < va.numAttr; i++) {
                gl_8.gl.enableVertexAttribArray(i);
            }
            gl_8.gl.drawElements(gl_8.gl.LINES, va.numIndices, gl_8.gl.UNSIGNED_SHORT, 0);
            for (let i = 0; i < va.numAttr; i++) {
                gl_8.gl.disableVertexAttribArray(i);
            }
            va.unbind();
            this._gridShaderProgram.unbind();
        }
        _drawOrb(center, axes, angleOfRotation, level, colorName) {
            this._orbShaderProgram.bind();
            let _model = glm.mat4.create();
            if (this._sphere.getColor !== colorName) {
                this._sphere.setColor = colorName;
                let color = exports.colorList.get(colorName);
                let location = this._orbShaderProgram.getUniformLocation("orbColor");
                gl_8.gl.uniform4f(location, color[0], color[1], color[2], 1.0);
            }
            if (level == 1) {
                glm.mat4.translate(_model, _model, [center[0] + Math.random() / 3, center[1] + Math.random() / 3, center[2] + Math.random() / 3]);
                let location = this._orbShaderProgram.getUniformLocation("modelTransform");
                gl_8.gl.uniformMatrix4fv(location, false, _model);
                this._sphere.draw(1);
            }
            else {
                glm.mat4.translate(_model, _model, [center[0], center[1], center[2]]);
                glm.mat4.rotate(_model, _model, angleOfRotation, [axes[0], axes[1], axes[2]]);
                let location = this._orbShaderProgram.getUniformLocation("modelTransform");
                gl_8.gl.uniformMatrix4fv(location, false, _model);
                this._sphere.draw(level);
            }
            this._orbShaderProgram.unbind();
        }
        _eliminatePlayers(updateTurn) {
            if ((this._turn) < (this._players.length)) {
                this._turn++;
                this.updateTurn();
                return;
            }
            for (let player of this._players) {
                if (this._eliminated.indexOf(player) < 0) {
                    let valid = true;
                    for (let key_value of this._BOARD) {
                        if (player == key_value[1].color) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid)
                        this._eliminated.push(player);
                }
            }
            if (updateTurn) {
                let len = this._players.length;
                while (true) {
                    this._turn += 1;
                    let temp = this._players[this._turn % len];
                    if (this._eliminated.indexOf(temp) < 0)
                        break;
                }
                this.updateTurn();
            }
        }
        _getBombNeighbours() {
            let allNeighbours = new Map();
            for (let boardEntry of this._currentBombs) {
                let boardCoordinate = boardEntry[1].boardCoordinate;
                const setOfNeighbours = this._getNeighbours(boardCoordinate[0], boardCoordinate[1]);
                for (let cantorKey of setOfNeighbours) {
                    if (allNeighbours.has(cantorKey)) {
                        let numberOfNeighbours = allNeighbours.get(cantorKey);
                        allNeighbours.set(cantorKey, numberOfNeighbours + 1);
                    }
                    else
                        allNeighbours.set(cantorKey, 1);
                }
            }
            return allNeighbours;
        }
        _getBombs(board) {
            let bombList = new Array();
            for (let key_value of board) {
                let boardCoordinate = key_value[1].boardCoordinate;
                let length = 0;
                if (boardCoordinate[0] + 1 !== this._COL_DIV)
                    length++;
                if (boardCoordinate[0] >= 1)
                    length++;
                if (boardCoordinate[1] + 1 !== this._ROW_DIV)
                    length++;
                if (boardCoordinate[1] >= 1)
                    length++;
                if (length <= key_value[1].level)
                    bombList.push(key_value);
            }
            return bombList;
        }
        _getNeighbours(boardCoordinateX, boardCoordinateY) {
            let output = new Set();
            if (boardCoordinateX + 1 !== this._COL_DIV)
                output.add(MainGame.cantorValue(boardCoordinateX + 1, boardCoordinateY));
            if (boardCoordinateX >= 1)
                output.add(MainGame.cantorValue(boardCoordinateX - 1, boardCoordinateY));
            if (boardCoordinateY + 1 !== this._ROW_DIV)
                output.add(MainGame.cantorValue(boardCoordinateX, boardCoordinateY + 1));
            if (boardCoordinateY >= 1)
                output.add(MainGame.cantorValue(boardCoordinateX, boardCoordinateY - 1));
            return output;
        }
        _getWorldCoordinates(x, y) {
            let viewport = gl_8.gl.getParameter(gl_8.gl.VIEWPORT);
            let projectView = glm.mat4.create();
            let projectViewInv = glm.mat4.create();
            let projectedVert = glm.vec4.fromValues(0, 0, 0, 1);
            glm.mat4.multiply(projectView, this._projection, this._modelview);
            glm.mat4.invert(projectViewInv, projectView);
            glm.vec4.transformMat4(projectedVert, [0, 0, 0.5 * this._CUBE_WIDTH, 1], projectView);
            let x_1 = -1 + 2 * ((x - viewport[0]) / viewport[2]);
            let y_1 = -1 + 2 * (((this._DISPLAY[1] - y) - viewport[1]) / viewport[3]);
            let outVert = glm.vec4.fromValues(0, 0, 0, 0);
            let inVert = glm.vec4.fromValues(projectedVert[3] * x_1, projectedVert[3] * y_1, projectedVert[2], projectedVert[3]);
            glm.vec4.transformMat4(outVert, inVert, projectViewInv);
            return [outVert[0], outVert[1], outVert[2]];
        }
        _initDefaults() {
            this._ROW_DIV = 8;
            this._COL_DIV = 6;
            this._CUBE_WIDTH = 20;
            this._ROTATION_SPEED = 2; // degree/sec rotation speed
            this._players = [];
            this._blastAnimationRunning = false;
            this._undoingBoard = false;
            this._BLAST_TIME = 0.22; //total time to finish one blast in seconds
            this._blastDisplacement = 0;
            this._turn = this._undoTurn = this._rotationAngle = 0;
            this._cameraPosition = [0, 0, 300];
            this._cameraTarget = [0, 0, 0];
            this._cameraUp = [0, 1, 0];
            this._lightDirLatitude = 0.0;
            this._lightDirLongitude = 180.0;
            this._lowerleft = [-0.5 * (this._COL_DIV) * (this._CUBE_WIDTH), -0.5 * (this._ROW_DIV) * (this._CUBE_WIDTH)];
            this._DISPLAY = [510, 680];
            this._modelview = glm.mat4.create();
            this._projection = glm.mat4.create();
            this._players = [];
            this._eliminated = [];
            this._undoEliminated = [];
            this._currentBombs = [];
            this._currentAllNeighbours = new Map();
            this._BOARD = new Map();
            this._undoBoard = new Map();
            //Orb configuration setup
            let radius = (this._CUBE_WIDTH) / 4.5;
            this._sphere = new Sphere_1.Sphere();
            this._sphere.init(0, 0, 0, radius, 50, 50);
            //Orb shader setting
            this._applyOrbShaderSettings();
            //Grid setting
            this._applyGridShaderSettings();
        }
        _runBlastAnimation(deltaTime) {
            let hasGameEnded = false; //boolean flag to detect the end of a game.
            if (this._blastDisplacement == 0)
                this._blastSound.play();
            this._blastDisplacement += ((this._CUBE_WIDTH / this._BLAST_TIME) * deltaTime) / 1000.0;
            if (this._blastDisplacement < this._CUBE_WIDTH) { //A blast animation is still running.
                gl_8.gl.clear(gl_8.gl.COLOR_BUFFER_BIT | gl_8.gl.DEPTH_BUFFER_BIT); //Clear color and depth buffer before rendering new frame.
                //***************** Render board ******************/
                this._drawGrid();
                for (let boardEntry of this._BOARD) {
                    let boardValue = boardEntry[1];
                    let boardCoordinate = boardEntry[1].boardCoordinate;
                    let center = [
                        (boardCoordinate[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                        (boardCoordinate[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                        0
                    ];
                    const color = boardValue.color;
                    let angle = this._rotationAngle % 360.0;
                    if (!this.isExplosive(boardValue))
                        this._drawOrb(center, boardValue.rotationAxes, angle, boardValue.level, color);
                    else {
                        if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0] + 1, boardCoordinate[1]))) {
                            let displacedCenter = [
                                center[0] + this._blastDisplacement,
                                center[1],
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0] - 1, boardCoordinate[1]))) {
                            let displacedCenter = [
                                center[0] - this._blastDisplacement,
                                center[1],
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] + 1))) {
                            let displacedCenter = [
                                center[0],
                                center[1] + this._blastDisplacement,
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] - 1))) {
                            let displacedCenter = [
                                center[0],
                                center[1] - this._blastDisplacement,
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                    }
                }
                //********************************************** */
                this._rotationAngle += ((this._ROTATION_SPEED * deltaTime) / 1000.0);
            }
            else { //A blast is completed. Update board.
                //************************* Update board after an explosion **********/
                let bombValue = this._currentBombs[0][1];
                let bombColor = bombValue.color;
                for (let bomb of this._currentBombs)
                    this._BOARD.delete(bomb[0]);
                for (let key_value of this._currentAllNeighbours) {
                    if (this._BOARD.has(key_value[0])) {
                        let board_value = this._BOARD.get(key_value[0]);
                        let newBoardValue = {};
                        newBoardValue.boardCoordinate = board_value.boardCoordinate;
                        newBoardValue.level = board_value.level + key_value[1];
                        newBoardValue.color = bombColor;
                        newBoardValue.rotationAxes = {};
                        Object.assign(newBoardValue.rotationAxes, board_value.rotationAxes);
                        this._BOARD.set(key_value[0], newBoardValue);
                    }
                    else {
                        let newBoardValue = {};
                        newBoardValue.boardCoordinate = MainGame.inverseCantorValue(key_value[0]);
                        newBoardValue.level = key_value[1];
                        newBoardValue.color = bombColor;
                        let axes = [2 * Math.random() - 1, 6 * Math.random() - 3, 8 * Math.random() - 4];
                        if ((axes[0] == 0) && (axes[1] == 0) && (axes[2] == 0)) {
                            axes[0] += Math.random();
                            axes[1] += Math.random();
                            axes[2] += Math.random();
                        }
                        newBoardValue.rotationAxes = {};
                        Object.assign(newBoardValue.rotationAxes, axes);
                        this._BOARD.set(key_value[0], newBoardValue);
                    }
                }
                //***************************************************************** */
                //Update the current list of explosive sites. If new explosive sites are created after the preceeding blasts, those are processed in the next animation.
                this._currentBombs = this._getBombs(this._BOARD);
                //Update the current list of sites that have an explosive neighbouring site.
                this._currentAllNeighbours = this._getBombNeighbours();
                //Reset the variable for processing the next blast animation.
                this._blastDisplacement = 0;
                //Update the list of eliminated players after a blast. This does not alter the turn variable of the game.
                this._eliminatePlayers(false);
                //Check if game has ended after a blast:
                if (this._eliminated.length == this._players.length - 1) { //Check to see if someone has won.
                    let winnerIndex = 1;
                    let winnerName = "";
                    for (let player of this._players) {
                        if (this._eliminated.indexOf(player) < 0) {
                            winnerName = player;
                            break;
                        }
                        winnerIndex++;
                    }
                    let gameEndingMessage = `Player ${winnerIndex.toString()} (${winnerName}) has won! Game Over.`;
                    alert(gameEndingMessage);
                    hasGameEnded = true;
                }
            }
            return hasGameEnded;
        }
        _setupCamera() {
            gl_8.gl.viewport(0, 0, this._DISPLAY[0], this._DISPLAY[1]);
            let cameraDistance = glm.vec3.length(glm.vec3.fromValues(this._cameraTarget[0] - this._cameraPosition[0], this._cameraTarget[1] - this._cameraPosition[1], this._cameraTarget[2] - this._cameraPosition[2])); //Distance between camera and target
            let focusHeight = 0.5 * (this._ROW_DIV) * (this._CUBE_WIDTH);
            let calibratedDistance = cameraDistance - this._CUBE_WIDTH; //Zoom out the camera to avoid rendering near the screen edges.
            glm.mat4.perspective(this._projection, 2 * Math.atan(focusHeight / calibratedDistance), this._COL_DIV / this._ROW_DIV, 1.0, cameraDistance + 100.0);
            glm.mat4.lookAt(this._modelview, this._cameraPosition, this._cameraTarget, this._cameraUp);
            let final_mat = glm.mat4.create();
            glm.mat4.multiply(final_mat, this._projection, this._modelview);
            let _model = glm.mat4.create();
            let location = this._gridShaderProgram.getUniformLocation("transform");
            this._gridShaderProgram.bind();
            gl_8.gl.uniformMatrix4fv(location, false, final_mat);
            this._gridShaderProgram.unbind();
            this._orbShaderProgram.bind();
            location = this._orbShaderProgram.getUniformLocation("projectionView");
            gl_8.gl.uniformMatrix4fv(location, false, final_mat);
            location = this._orbShaderProgram.getUniformLocation("modelTransform");
            gl_8.gl.uniformMatrix4fv(location, false, _model);
            this._orbShaderProgram.unbind();
        }
        //************************************************************************************************** */
        ///**************************************** Public methods **********************************************
        //************************************************************************************************** */
        static cantorValue(x, y) {
            return Math.round(0.5 * (x + y) * (x + y + 1) + y);
        }
        convertMouseToBoardCoordinate(mouseX, mouseY) {
            let boardCoordinate = [-1, -1];
            return boardCoordinate;
        }
        cleanUp() {
            this.resetGameVariables();
            gl_8.gl.useProgram(null);
            gl_8.gl.bindBuffer(gl_8.gl.ARRAY_BUFFER, null);
            gl_8.gl.bindBuffer(gl_8.gl.ELEMENT_ARRAY_BUFFER, null);
            gl_8.gl.bindVertexArray(null);
            this._sphere.cleanUp();
            this._orbShaderProgram.cleanUp();
            this._gridShaderProgram.cleanUp();
            for (let key_val of this._GRID_VAO) {
                let key = key_val[0];
                let va = key_val[1];
                let vb = this._GRID_VBO.get(key);
                let ib = this._GRID_IBO.get(key);
                va.cleanUp();
                vb.cleanUp();
                ib.cleanUp();
                this._GRID_VAO.delete(key);
                this._GRID_VBO.delete(key);
                this._GRID_IBO.delete(key);
            }
        }
        degrees(radian) { return 180 * radian / Math.PI; }
        drawBoard(deltaTime) {
            if (this.isUndoingBoard)
                return false; //The game board is being undone. Don't draw the board until it is finished.
            let hasGameEnded = false;
            let isEmptyBombList = this._currentBombs.length > 0 ? false : true;
            if (this.isBlastAnimationRunning && isEmptyBombList) {
                this._blastAnimationRunning = false;
                this._eliminatePlayers(true);
            }
            if (!isEmptyBombList) {
                this._blastAnimationRunning = true;
                hasGameEnded = this._runBlastAnimation(deltaTime);
            }
            else {
                gl_8.gl.clear(gl_8.gl.COLOR_BUFFER_BIT | gl_8.gl.DEPTH_BUFFER_BIT);
                this._drawGrid();
                let angle = this._rotationAngle % 360;
                for (let key_value of this._BOARD) {
                    let key = key_value[1].boardCoordinate;
                    let center = [
                        (key[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                        (key[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                        0
                    ];
                    this._drawOrb(center, key_value[1].rotationAxes, angle, key_value[1].level, key_value[1].color);
                }
                if (this._BOARD.size > 0)
                    this._rotationAngle += ((this._ROTATION_SPEED * deltaTime) / 1000.0);
            }
            if (hasGameEnded)
                this.resetGameVariables();
            return hasGameEnded;
        }
        getBoardCoordinates(mouseX, mouseY) {
            let worldCoordinates = this._getWorldCoordinates(mouseX, mouseY);
            if ((Math.abs(worldCoordinates[0]) > 0.5 * (this._COL_DIV) * (this._CUBE_WIDTH)) || (Math.abs(worldCoordinates[1]) > 0.5 * (this._ROW_DIV) * (this._CUBE_WIDTH))) {
                return [-1, -1];
            }
            else {
                let boardCoordinateX = Math.floor((worldCoordinates[0] - (this._lowerleft[0])) / (this._CUBE_WIDTH));
                let boardCoordinateY = Math.floor((worldCoordinates[1] - (this._lowerleft[1])) / (this._CUBE_WIDTH));
                return [boardCoordinateX, boardCoordinateY];
            }
        }
        getGlCompatibleCoordinate(radius, latitudeDegree, longitudeDegree) { return [radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))]; }
        ;
        getPlayerList() {
            let outputPlayerList = [];
            Object.assign(outputPlayerList, this._players);
            return outputPlayerList;
        }
        static inverseCantorValue(z) {
            let w = Math.floor(0.5 * (Math.sqrt(8 * z + 1) - 1));
            let y = Math.round(z - 0.5 * w * (w + 1));
            let x = w - y;
            return [x, y];
        }
        get isBlastAnimationRunning() {
            return this._blastAnimationRunning;
        }
        isEliminated(player) {
            let playerIndex = this._eliminated.indexOf(player);
            return playerIndex < 0 ? false : true;
        }
        isExplosive(value) {
            let isValueFound = false;
            for (const explosive of this._currentBombs) {
                if ((explosive[1].boardCoordinate[0] == value.boardCoordinate[0]) && (explosive[1].boardCoordinate[1] == value.boardCoordinate[1])) {
                    isValueFound = true;
                    break;
                }
            }
            return isValueFound;
        }
        get isUndoingBoard() {
            return this._undoingBoard;
        }
        processPlayerInput(boardCoordinateX, boardCoordinateY) {
            if (this.isUndoingBoard)
                return false; //The game board is being undone. Don't process new inputs until it is finished.
            if (this.isBlastAnimationRunning)
                return false; //Current board has bombs which needs to be taken care of before processing any input.
            if ((boardCoordinateX < 0) || (boardCoordinateY < 0))
                return false;
            let key = MainGame.cantorValue(boardCoordinateX, boardCoordinateY);
            let numPlayer = this._players.length;
            if (!(this._BOARD.has(key))) {
                this._undoBoard.clear();
                for (let key_value of this._BOARD) {
                    let key = key_value[0];
                    let value = {};
                    Object.assign(value, key_value[1]);
                    this._undoBoard.set(key, value);
                }
                this._undoTurn = this._turn;
                this._undoEliminated.length = 0;
                this._eliminated.forEach((playerColor, index) => this._undoEliminated.push(playerColor));
                let rot_axes = [Math.random(), 6 * Math.random() - 3, 8 * Math.random() - 4];
                if ((rot_axes[0] == 0) && (rot_axes[1] == 0) && (rot_axes[2] == 0)) {
                    rot_axes[0] += Math.random();
                    rot_axes[1] += Math.random();
                    rot_axes[2] += Math.random();
                }
                let color = this._players[this._turn % numPlayer];
                let newBoardValue = {};
                newBoardValue.boardCoordinate = [boardCoordinateX, boardCoordinateY];
                newBoardValue.color = color;
                newBoardValue.rotationAxes = {};
                Object.assign(newBoardValue.rotationAxes, rot_axes);
                newBoardValue.level = 1;
                this._BOARD.set(key, newBoardValue);
            }
            else {
                let color = this._players[this._turn % numPlayer];
                let boardValue = this._BOARD.get(key);
                if (color !== boardValue.color)
                    return false;
                this._undoBoard.clear();
                this._undoBoard.clear();
                for (let key_value of this._BOARD) {
                    let key = key_value[0];
                    let value = {};
                    Object.assign(value, key_value[1]);
                    this._undoBoard.set(key, value);
                }
                this._undoTurn = this._turn;
                this._undoEliminated = [];
                this._eliminated.forEach((playerColor, index) => this._undoEliminated.push(playerColor));
                boardValue.level += 1;
                this._BOARD.set(key, boardValue);
                this._currentBombs = this._getBombs(this._BOARD);
                this._currentAllNeighbours = this._getBombNeighbours();
            }
            if (this._currentBombs.length == 0)
                this._eliminatePlayers(true);
            return true;
        }
        radians(degree) { return Math.PI * degree / 180; }
        resetGameVariables() {
            this._BOARD.clear();
            this._undoBoard.clear();
            this._eliminated = [];
            this._undoEliminated = [];
            this._currentBombs = [];
            this._currentAllNeighbours.clear();
            this._turn = 0;
            this._undoTurn = 0;
            this._rotationAngle = 0;
            this._blastAnimationRunning = false;
            this._blastDisplacement = 0;
        }
        setAttribute(numberOfRows, numberOfColumns, playerList) {
            this._ROW_DIV = numberOfRows;
            this._COL_DIV = numberOfColumns;
            this._players = [];
            playerList.forEach(player => {
                this._players.push(player.toLowerCase());
            });
            this._lowerleft[0] = -0.5 * (this._COL_DIV) * (this._CUBE_WIDTH);
            this._lowerleft[1] = -0.5 * (this._ROW_DIV) * (this._CUBE_WIDTH);
            let key = MainGame.cantorValue(this._ROW_DIV, this._COL_DIV);
            if (!this._GRID_VAO.has(key)) {
                let grid_data = this._createGridData(this._ROW_DIV, this._COL_DIV, this._CUBE_WIDTH);
                this._GRID_VAO.set(key, grid_data[0]);
                this._GRID_VBO.set(key, grid_data[1]);
                this._GRID_IBO.set(key, grid_data[2]);
            }
        }
        setCanvasSize(width, height) {
            this._DISPLAY[0] = width;
            this._DISPLAY[1] = height;
            this._setupCamera();
        }
        setColorOfBacksideGrid(colorR, colorG, colorB) {
            this._gridShaderProgram.bind();
            let location = this._gridShaderProgram.getUniformLocation("backsideColor");
            if (location != -1)
                gl_8.gl.uniform4f(location, colorR, colorG, colorB, 255);
            this._gridShaderProgram.unbind();
        }
        setColorOfFrontsideGrid(colorR, colorG, colorB) {
            this._gridShaderProgram.bind();
            let location = this._gridShaderProgram.getUniformLocation("frontsideColor");
            if (location != -1)
                gl_8.gl.uniform4f(location, colorR, colorG, colorB, 255);
            this._gridShaderProgram.unbind();
        }
        updateTurn() {
            let curPlayer = 1 + (this._turn % this._players.length);
            let playerColor = this._players[curPlayer - 1];
            let colorVal = exports.colorList.get(playerColor);
            let colorR = Math.round(255 * colorVal[0]);
            let colorG = Math.round(255 * colorVal[1]);
            let colorB = Math.round(255 * colorVal[2]);
            this._currentPlayerLabelElement.innerHTML = `Player ${curPlayer}`;
            this._currentPlayerLabelElement.style.background = `rgb(${colorR}, ${colorG}, ${colorB})`;
            this._currentPlayerMobileLabelElement.innerHTML = `Player ${curPlayer}`;
            this._currentPlayerMobileLabelElement.style.background = `rgb(${colorR}, ${colorG}, ${colorB})`;
            this.setColorOfFrontsideGrid(colorVal[0], colorVal[1], colorVal[2]);
            this.setColorOfBacksideGrid(0.5 * colorVal[0], 0.5 * colorVal[1], 0.5 * colorVal[2]);
        }
        undo() {
            this._undoingBoard = true; //Indicate the engine that the board is being undone, don't process new inputs until it is finished.
            let currentTurn = this._turn;
            this._BOARD.clear();
            for (let key_val of this._undoBoard) {
                this._BOARD.set(key_val[0], key_val[1]);
            }
            this._turn = this._undoTurn;
            if (currentTurn != this._undoTurn) {
                this.updateTurn();
            }
            this._eliminated = [];
            for (let val of this._undoEliminated) {
                this._eliminated.push(val);
            }
            this._undoingBoard = false;
        }
    }
    exports.MainGame = MainGame;
});
define("Text", ["require", "exports", "gl-matrix", "gl"], function (require, exports, glm, gl_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextObject = void 0;
    class TextObject {
        /**
        * Default constructor for Text object.
        * @param {number} fontSize: size of the font.
        * @param {number} width: space between each letter.
        * @param {number} height: space between each line.
        * @param {Map<string, MeshMap>} alphabetMeshMap: a map between 26 alphabet names (in capital letter) and their MeshData.
        */
        constructor(fontSize, width, height, alphabetMeshMap) {
            this._fontSize = 0;
            this._width = 0;
            this._height = 0;
            this._fontData = []; //Contains mesh data of 26 alphabets ordered as in a-z;
            this._fontSize = fontSize;
            this._width = width;
            this._height = height;
            let alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let index = 0; index < 26; index++) {
                let mesh = alphabetMeshMap.get(alphabets.charAt(index));
                this._fontData.push(mesh);
            }
        }
        cleanUp() {
            while (this._fontData.length > 0) {
                let mesh = this._fontData.pop();
                mesh.cleanUp();
            }
        }
        /**
        * A constant method which draws a sentence without line break.
        * @param {Shader} shaderProgram: reference to the Shaders object which handles the text rendering. It is eventually passed on to the MeshData object associated with each of the alphabets for handling material properties.
        * @param {WebGLUniformLocation} modelMatrixUniformLocation: location of modelMatrix uniform variable in the Shader program specified by shaderProgram parameter.
        * @param {string} text: a text for rendering which does not contain new line characters.
        * @param {glm.vec3} position: position of the text object in 3D OpenGL world.
        * @param {glm.vec3} rotation: angle of rotation with respect to x-axis, y-axis and z-axis, respectively.
        * @param {string} horizontalAlign: possible values: 'right', 'center', 'left'. Text alignment depends on the given value.
        */
        drawText(shaderProgram, modelMatrixUniformLocation, text, position, rotation, horizontalAlign, applyMaterial) {
            let sampleModel = glm.mat4.create();
            glm.mat4.translate(sampleModel, sampleModel, position);
            glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[0] / 180.0), [1, 0, 0]);
            glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[1] / 180.0), [0, 1, 0]);
            glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[2] / 180.0), [0, 0, 1]);
            let scaledModel = glm.mat4.scale(sampleModel, sampleModel, [this._fontSize, this._fontSize, this._fontSize]);
            if (horizontalAlign !== "right") {
                if (horizontalAlign == "center")
                    glm.mat4.translate(scaledModel, scaledModel, [-0.5 * this._width * (text.length - 1), 0, 0]);
                for (let i = 0; i < text.length; i++) {
                    if (text.charAt(i) === ' ') {
                        glm.mat4.translate(scaledModel, scaledModel, [0.7 * this._width, 0, 0]);
                        continue;
                    }
                    let characterAscii = text.charAt(i).toUpperCase().charCodeAt(0);
                    gl_9.gl.uniformMatrix4fv(modelMatrixUniformLocation, false, scaledModel);
                    this._fontData[characterAscii - 65].render(shaderProgram, applyMaterial); //Add the shader argument here.
                    glm.mat4.translate(scaledModel, scaledModel, [this._width, 0, 0]);
                }
            }
            else {
                for (let i = text.length - 1; i >= 0; i--) {
                    if (text.charAt(i) == ' ') {
                        glm.mat4.translate(scaledModel, scaledModel, [-0.7 * this._width, 0, 0]);
                        continue;
                    }
                    let characterAscii = text.charAt(i).toUpperCase().charCodeAt(0);
                    gl_9.gl.uniformMatrix4fv(modelMatrixUniformLocation, false, scaledModel);
                    this._fontData[characterAscii - 65].render(shaderProgram, applyMaterial); //Add the shader argument here.
                    glm.mat4.translate(scaledModel, scaledModel, [-this._width, 0, 0]);
                }
            }
        }
        /**
        * A constant method which draws a sentence containing multiple line breaks.
        * @param {Shader} shaderProgram: reference to the Shaders object which handles the text rendering. It is eventually passed on to the MeshData object associated with each of the alphabets for handling material properties.
        * @param {WebGLUniformLocation} modelMatrixUniformLocation: <GLint> location of modelMatrix uniform variable in the Shader program specified by shaderProgram parameter.
        * @param {string} text: a text for rendering which must contain at least one new line character.
        * @param {glm.vec3} position: position of the text object in 3D OpenGL world.
        * @param {glm.vec3} rotation: angle of rotation with respect to x-axis, y-axis and z-axis, respectively.
        * @param {string} horizontalAlign: possible values: 'right', 'center', 'left'. Has a default value of 'center'. Text alignment depends on the given value.
        * @param {string} verticalAlign: possible values: 'top', 'center', 'bottom'. Has a default value of 'center'. Text alignment depends on the given value.
        */
        drawLine(shaderProgram, modelMatrixUniformLocation, textWithMultipleLines, position, rotation, horizontalAlign, verticalAlign, applyMaterial) {
            let x = position[0];
            let y = position[1];
            let z = position[2];
            let lineList = textWithMultipleLines.split(/\r?\n/); //Splits the string in new line characters. 
            if (verticalAlign === "center") {
                y += 0.3 * this._height * (lineList.length - 1);
                for (let i = 0; i < lineList.length; i++) {
                    let line = lineList[i];
                    if (line.length > 0)
                        this.drawText(shaderProgram, modelMatrixUniformLocation, line, glm.vec3.fromValues(x, y, z), rotation, horizontalAlign, applyMaterial);
                    y -= 0.6 * this._height;
                }
            }
            else if (verticalAlign === "top") {
                for (let i = 0; i < lineList.length; i++) {
                    let line = lineList[i];
                    if (line.length > 0)
                        this.drawText(shaderProgram, modelMatrixUniformLocation, line, glm.vec3.fromValues(x, y, z), rotation, horizontalAlign, applyMaterial);
                    y -= 0.6 * this._height;
                }
            }
            else {
                for (let i = (lineList.length - 1); i >= 0; i--) {
                    let line = lineList[i];
                    if (line.length > 0)
                        this.drawText(shaderProgram, modelMatrixUniformLocation, line, glm.vec3.fromValues(x, y, z), rotation, horizontalAlign, applyMaterial);
                    y += 0.6 * this._height;
                }
            }
        }
    }
    exports.TextObject = TextObject;
});
define("offlineEngine", ["require", "exports", "jquery", "gl-matrix", "webgl-obj-loader", "gl", "offlineMaingame", "Shader", "Sphere", "Text", "MeshContainer"], function (require, exports, $, glm, OBJ, gl_10, offlineMaingame_1, Shader_2, Sphere_2, Text_1, MeshContainer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OfflineEngine = void 0;
    ;
    class OfflineEngine {
        constructor(config) {
            this._beginFrame = 0;
            this._currentMouseX = 0;
            this._currentMouseY = 0;
            this._endFrame = 0;
            this._fpsRate = 65;
            this._frameCount = 0;
            this._isDragging = false;
            this._isEngineRunning = false;
            this._mouseDown = false;
            //******************************* Settings for canvas scence (Brownian particles) outside of a game  *************************** */
            this._alphabetMeshData = new Map();
            this._boundingBox = 30;
            this._cameraDistance = 30;
            this._cameraLatitude = 0; //in degree
            this._cameraLongitude = 0; // in degree
            this._cameraRotationSpeed = 360.0; //Speed (degree / mouse_increment / sec) at which camera rotates while dragging mouse pointer.
            this._cameraTarget = [0, 0, 0];
            this._cameraUp = [0, 1, 0];
            this._defaultParticleMaterial = {};
            this._defaultProj = null;
            this._defaultView = null;
            this._lightDirLatitude = 0.0; //Latitude and longitude determine the direction, not the light position. Light Direction == target position - light position
            this._lightDirLongitude = 180.0;
            this._mNumParticles = 30;
            this._particleData = null;
            this._particleShader = null;
            this._sampleSphere = null;
            this._textObject = null;
            this._textShader = null;
            //********************************************************************************* */
            this._canvas = null;
            this._configuration = null;
            this._game = null;
            this._gameData = {
                isGameRunning: false,
                quitCurrentGame: false,
                startNewGame: false,
                isMouseDataProcessed: true,
                mouseX: null,
                mouseY: null
            };
            this._isDestroyed = null;
            this.configure(config);
            if (!this.isConfigured()) {
                alert("Failed to configure engine instance. Perhaps forgot to specify all properties correctly?");
                throw new Error("Engine was not configured correctly.");
            }
            if (config.NumberOfBrownianParticles)
                this._mNumParticles = config.NumberOfBrownianParticles;
        }
        //***********************************************************************************************/
        //*************************************** Private methods definitions ***************************/
        //***********************************************************************************************/
        _applyTextShaderSettings() {
            //******************* Text-shader setup
            this._textShader = new Shader_2.Shader();
            let vertTextShader = "#version 300 es\n\
                            layout(location=0) in vec3 vertexPosition;\n\
                            layout(location=1) in vec3 vertexNormal;\n\
                            layout(location=2) in vec2 texCoord;\n\
                            out highp vec3 normal;\n\
                            out highp vec4 vPosition;\n\
                            uniform mat4 projectionView;\n\
                            uniform mat4 modelTransform;\n\
                            void main(){\n\
                                vPosition = modelTransform * vec4(vertexPosition, 1.0);\n\
                            	normal = normalize(vec3(modelTransform * vec4(vertexNormal, 0.0)));\n\
                            	gl_Position = projectionView * vPosition;\n\
                            }";
            let fragTextShader = "#version 300 es\n\
                            precision highp float;\n\
                            precision highp int;\n\
                            in highp vec3 normal;\n\
                            in highp vec4 vPosition;\n\
                            out highp vec4 outputColor;\n\
                            uniform vec3 cameraPosition;\n\
                            uniform vec3 vDiffuse;\n\
                            uniform vec3 vSpecular;\n\
                            uniform float vSpecularExponent;\n\
                            uniform vec3 lightDirection;\n\
                            void main(){\n\
                                vec3 viewDir = normalize(cameraPosition - vPosition.xyz); \n\
                            	vec3 sunDir = normalize(lightDirection);\n\
                            	vec3 reflectionVector =  normalize(2.0 * dot(normal, -sunDir) * normal + sunDir);\n\
                            	float brightness = clamp(dot(normal, -sunDir), 0.0, 1.0);\n\
                            	vec3 modifiedDiffuseColor = vSpecular;\n\
                            	vec3 specularComponent = clamp(vSpecular * pow(dot(reflectionVector, viewDir), vSpecularExponent), 0.0, 1.0);\n\
                            	vec3 color = clamp(modifiedDiffuseColor + specularComponent, 0.0, 1.0);\n\
                            	outputColor = vec4(color * brightness, 1.0);\n\
                            }";
            this._textShader.compile(vertTextShader, fragTextShader);
            let final_mat = glm.mat4.create();
            glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
            let _model = glm.mat4.create();
            this._textShader.bind();
            //Update uniform variable (projection matrix) in shader
            let location = this._textShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, final_mat);
            //**********************************************************
            //Update uniform variable (modelView matrix) in shader
            location = this._textShader.getUniformLocation("modelTransform");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, _model);
            //*********************************************************
            //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
            let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
            location = this._textShader.getUniformLocation("lightDirection");
            if (location !== -1)
                gl_10.gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
            //*******************************************************************************
            // //Update uniform variable (camera position) in shader
            location = this._textShader.getUniformLocation("cameraPosition");
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            if (location != -1)
                gl_10.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //*********************************************************************************
            //Update uniform variable (vDiffuse) in shader
            location = this._textShader.getUniformLocation("vDiffuse");
            if (location != -1)
                gl_10.gl.uniform3f(location, 0.8, 0, 0.002118);
            //***************************************************
            //Update uniform variable (vSpecular) in shader
            location = this._textShader.getUniformLocation("vSpecular");
            if (location != -1)
                gl_10.gl.uniform3f(location, 1.0, 1.0, 1.0);
            //********************************************************
            //Update uniform variable (vSpecularExponent) in shader
            location = this._textShader.getUniformLocation("vSpecularExponent");
            if (location != -1)
                gl_10.gl.uniform1f(location, 233.333333);
            this._textShader.unbind();
            //********************************************************************
        }
        _applyParticleShaderSettings() {
            //*************************** Brownian-particle-shader setup
            this._particleShader = new Shader_2.Shader();
            let vertParticleSource = "#version 300 es\n\
            layout(location = 0) in vec3 vertexPosition;\n\
            layout(location = 1) in vec3 vertexNormal;\n\
            layout(location = 2) in vec2 texCoord;\n\
            layout(location = 3) in vec4 vertexColor;\n\
            out highp vec3 normal;\n\
            out highp vec4 vPosition;\
            uniform mat4 projectionView;\n\
            uniform mat4 modelTransform;\n\
            void main() {\n\
            	vPosition = modelTransform * vec4(vertexPosition, 1.0);\n\
            	gl_Position = projectionView * vPosition;\n\
            	normal = normalize(vec3(modelTransform * vec4(vertexNormal, 0)));\n\
            }";
            //Fragment shader for rendering brownian particles
            let fragParticleSource = "#version 300 es\n\
            precision highp float;\n\
            in highp vec3 normal;\n\
            in highp vec4 vPosition;\
            out highp vec4 outputColor;\n\
            uniform vec3 cameraPosition;\n\
            uniform vec4 particleColor;\n\
            uniform float angle;\n\
            uniform float isFlickering;\n\
            uniform vec3 vDiffuse;\n\
            uniform vec3 vSpecular;\n\
            uniform float vSpecularExponent;\n\
            uniform vec3 lightDirection;\n\
            float randomExponent(vec2 config) {\n\
                return fract(sin(dot(config.xy, vec2(12.9898, 78.233))) * 43758.5453);\n\
            }\n\
            void main(){\n\
            	vec3 viewDir = normalize(cameraPosition - vPosition.xyz); \n\
                vec3 sunDir = normalize(lightDirection);\n\
                vec3 reflectionVector =  normalize(2.0 * dot(normal, -sunDir) * normal + sunDir);\n\
                float brightness = clamp(1.1 * dot(normal, -sunDir), 0.0, 1.0);\n\
                float exponent = randomExponent(vec2(1.0, pow(angle, 1.5)));\n\
                vec3 randomColor = clamp(vec3(0.5, 0.5, 0.0) + vec3(sin(angle/10.0), cos(angle/20.0 + vPosition.y), sin(vPosition.z)), 0.0, 1.0);\n\
                vec3 modifiedDiffuseColor = (1.0 - isFlickering) * particleColor.xyz + isFlickering * randomColor;\n\
                vec3 specularComponent = clamp(modifiedDiffuseColor * vSpecular * pow(dot(reflectionVector, viewDir), vSpecularExponent), 0.0, 1.0);\n\
                vec3 color = clamp((modifiedDiffuseColor + specularComponent) * brightness, 0.0, 1.0);\n\
                outputColor = vec4( color , 1.0);\n\
            }";
            this._particleShader.compile(vertParticleSource, fragParticleSource);
            let final_mat = glm.mat4.create();
            glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
            let _model = glm.mat4.create();
            this._particleShader.bind();
            //Update uniform variable (projection matrix) in shader
            let location = this._particleShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, final_mat);
            //**********************************************************
            //Update uniform variable (modelView matrix) in shader
            location = this._particleShader.getUniformLocation("modelTransform");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, _model);
            //*********************************************************
            //Update particle color uniform ****************************
            location = this._particleShader.getUniformLocation("particleColor");
            if (location !== -1)
                gl_10.gl.uniform4f(location, 1.0, 1.0, 1.0, 1.0);
            //************************************************************
            //Update angle variable
            location = this._particleShader.getUniformLocation("angle");
            if (location !== -1)
                gl_10.gl.uniform1f(location, this._frameCount % 360);
            //********************************************************************
            //Update flickering variable
            location = this._particleShader.getUniformLocation("isFlickering");
            if (location !== -1)
                gl_10.gl.uniform1f(location, 0.0);
            //********************************************************************
            //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
            let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
            location = this._particleShader.getUniformLocation("lightDirection");
            if (location !== -1)
                gl_10.gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
            //*******************************************************************************
            // //Update uniform variable (camera position) in shader
            location = this._particleShader.getUniformLocation("cameraPosition");
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            if (location != -1)
                gl_10.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //*********************************************************************************
            // Apply default material property
            this._particleShader.applyMaterial(this._defaultParticleMaterial);
            this._particleShader.unbind();
            //**********************************************
        }
        _applyDefaultCanvasSetting() {
            gl_10.gl.enable(gl_10.gl.CULL_FACE);
            gl_10.gl.enable(gl_10.gl.DEPTH_TEST);
            let w = $(`#${this._configuration.CanvasParentID}`).width();
            let h = $(`#${this._configuration.CanvasParentID}`).height();
            if (this._canvas !== null) {
                this._canvas.width = w;
                this._canvas.height = h;
                this._updateCanvasPerspective(w, h);
            }
        }
        _applyDefaultHTMLSettings() {
            //********* Preassign default variables of the HTML document.
            if (this._configuration.DefaultNumberOfColumn) {
                $(`#${this._configuration.NumberOfColumnSelectorID}`).val(this._configuration.DefaultNumberOfColumn.toString()); //Set default number of columns in board.
            }
            if (this._configuration.DefaultNumberOfRow) {
                $(`#${this._configuration.NumberOfRowSelectorID}`).val(this._configuration.DefaultNumberOfRow.toString()); //Set default number of rows in board.
            }
            if (this._configuration.ListOfColorSelectorParentID) {
                for (let i = 0; i < 2; i++) {
                    let parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                    let displayStyle = $(parentID).css('display');
                    if (displayStyle !== undefined && displayStyle !== 'none')
                        $(parentID).attr('data-display', displayStyle);
                    else
                        $(parentID).attr('data-display', 'block');
                }
            }
            if (this._configuration.ListOfColorSelectorID.length > 2) { //Disable all color selectors except the first two.
                for (let i = 2; i < this._configuration.ListOfColorSelectorID.length; i++) {
                    let playerID = `#${this._configuration.ListOfColorSelectorID[i]}`;
                    $(playerID).attr("disabled", 1);
                    $(playerID).css('visibility', 'hidden');
                    if (this._configuration.ListOfColorSelectorParentID) {
                        let parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                        let displayStyle = $(parentID).css('display');
                        if (displayStyle !== undefined && displayStyle !== 'none')
                            $(parentID).attr('data-display', displayStyle);
                        else
                            $(parentID).attr('data-display', 'block');
                        $(parentID).attr("disabled", 1);
                        $(parentID).css('display', 'none');
                    }
                }
                ;
            }
            let menuIDs = [this._configuration.OutsideMenuDivisionID, this._configuration.InsideMenuDivisionID];
            for (let id of menuIDs) {
                if (id) {
                    let displayStyle = $(`#${id}`).css('display');
                    if (displayStyle !== undefined && displayStyle !== 'none')
                        $(`#${id}`).attr('data-display', displayStyle);
                    else
                        $(`#${id}`).attr('data-display', 'block');
                }
            }
            let displayStyle = $(`#${this._configuration.InsideMenuDivisionID}`).css('display');
            if (displayStyle !== undefined && displayStyle !== 'none')
                $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', displayStyle);
            else
                $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', 'block');
            $(`#${this._configuration.InsideMenuDivisionID}`).css('display', 'none');
            displayStyle = $(`#${this._configuration.HorizontalPanelID}`).css('display');
            if (displayStyle !== undefined && displayStyle !== 'none')
                $(`#${this._configuration.HorizontalPanelID}`).attr('data-display', displayStyle);
            else
                $(`#${this._configuration.HorizontalPanelID}`).attr('data-display', 'block');
            $(`#${this._configuration.HorizontalPanelID}`).css("display", 'none');
            let allColors = offlineMaingame_1.colorList.keys(); //Fetch list of all possible color values. Must contain at least ListOfColorSelectorID.length many colors.
            if (offlineMaingame_1.colorList.size < this._configuration.ListOfColorSelectorID.length) {
                alert("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
                throw new Error("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
            }
            for (let i = 0; i < offlineMaingame_1.colorList.size; i++) {
                let color = allColors.next().value;
                color = color.charAt(0).toUpperCase() + color.slice(1);
                for (let id of this._configuration.ListOfColorSelectorID) {
                    let selectObj = $(`#${id}`);
                    selectObj.append($('<option>', {
                        text: color
                    }));
                }
                if (i < this._configuration.ListOfColorSelectorID.length)
                    $(`#${this._configuration.ListOfColorSelectorID[i]}`).val(color);
            }
            $(`#${this._configuration.HtmlMenuButtonID}`).removeAttr('disabled');
            $(`#${this._configuration.HorizontalPanelID}`).css('visibility', 'visible');
            $(`#${this._configuration.UndoButtonMobileID}`).css('visibility', 'visible');
        }
        _bindGameEngineWithHTML() {
            $(window).resize(this, eventObject => { eventObject.data.resize(); });
            $(`#${this._configuration.NumberOfPlayersSelectorID}`).on('change', this._onPlayerSelection.bind(this));
            $(`#${this._configuration.MainmenuButtonID}`).on('click', this._onButtonMainMenu.bind(this));
            $(`#${this._configuration.NewGameButtonID}`).on('click', this._onButtonNewGame.bind(this));
            $(`#${this._configuration.UndoButtonID}`).on('click', this._onButtonUndo.bind(this));
            $(`#${this._configuration.UndoButtonMobileID}`).on('click', this._onButtonUndo.bind(this));
            $(`#${this._configuration.ColorSequenceMenuID}`).on('click', this._onButtonColSeq.bind(this));
            $(`#${this._configuration.StartGameButtonID}`).on('click', this._onButtonStart.bind(this));
            $(`#${this._configuration.HtmlMenuButtonID}`).on('click', this._onMenuButtonClick.bind(this));
            $(this._canvas).on('click', (event => { this._onMouseClickOnCanvas(event.offsetX, event.offsetY); }).bind(this));
            $(this._canvas).on('mousedown', (event => { this._onMouseDown(event.offsetX, event.offsetY); }).bind(this));
            $(this._canvas).on('mousemove', (event => { this._onMouseDragging(event.offsetX, event.offsetY); }).bind(this));
            $(window).on('mouseup', (event => { this._onMouseUp(event.offsetX, event.offsetY); }).bind(this));
        }
        _getGlCompatibleCoordinate(radius, latitudeDegree, longitudeDegree) { return glm.vec3.fromValues(radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))); }
        ;
        _initDefaultVariables() {
            this._defaultView = glm.mat4.create();
            this._defaultProj = glm.mat4.create();
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
            if (this._sampleSphere == null)
                this._sampleSphere = new Sphere_2.Sphere();
            this._sampleSphere.init(0, 0, 0, 1, 50, 50);
            if (!this._defaultParticleMaterial.name) {
                this._defaultParticleMaterial.name = "Plastic";
                this._defaultParticleMaterial.ambient = [1.0, 1.0, 1.0];
                this._defaultParticleMaterial.diffuse = [0.80, 0, 0.002118];
                this._defaultParticleMaterial.specular = [1.0, 1.0, 1.0];
                this._defaultParticleMaterial.specularExponent = 233.3333333;
            }
            //********************************** Brownian particle-data setup
            this._particleData = [];
            for (let i = 0; i < this._mNumParticles; i++) {
                let x = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let y = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let z = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let r = Math.random();
                let g = Math.random();
                let b = Math.random();
                let particle = {};
                particle.position = [x, y, z];
                particle.color = [r, g, b];
                particle.isFlickering = Math.random() > 0.65 ? true : false;
                this._particleData.push(particle);
            }
        }
        _onButtonColSeq() {
            let allPlayers = this._game.getPlayerList();
            let colorSequence = "Current order of players:\n";
            allPlayers.forEach((player, index) => {
                if (!this._game.isEliminated(player))
                    colorSequence += `Player ${index + 1}: ${player}\n`;
            });
            alert(colorSequence);
        }
        _onButtonMainMenu() {
            let result = window.confirm("Current game will be lost. Continue?");
            if (!result)
                return;
            this._gameData.quitCurrentGame = true;
            this._gameData.isGameRunning = false;
            this._gameData.isMouseDataProcessed = true;
        }
        _onButtonNewGame() {
            let result = window.confirm("New game will start. Continue?");
            if (!result)
                return;
            this._gameData.isGameRunning = false;
            this._gameData.isMouseDataProcessed = true;
            this._gameData.startNewGame = true;
        }
        _onButtonStart() {
            let numberOfColumnsString = $(`#${this._configuration.NumberOfColumnSelectorID}`).val();
            let numberOfRowsString = $(`#${this._configuration.NumberOfRowSelectorID}`).val();
            let numberOfPlayersString = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
            let playerList = [];
            let numberOfColumns = Number(numberOfColumnsString);
            let numberOfRows = Number(numberOfRowsString);
            let numberOfPlayers = Number(numberOfPlayersString);
            if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
                alert("Invalid number of players.");
                throw new Error("Invalid number of players.");
            }
            if (numberOfRows === Number.NaN) {
                alert("Invalid number of rows.");
                throw new Error("Invalid number of rows.");
            }
            if (numberOfColumns === Number.NaN) {
                alert("Invalid number of columns.");
                throw new Error("Invalid number of columns.");
            }
            for (let i = 0; i < numberOfPlayers; i++) {
                let playerColor = $(`#${this._configuration.ListOfColorSelectorID[i]}`).val();
                playerList.push(playerColor);
            }
            let playerSet = new Set(playerList);
            if (playerSet.size !== playerList.length) {
                alert("Same colors are not allowed for multiple players!");
                return;
            }
            $(`#${this._configuration.BoardDimLabelID}`).html(`BOARD:&nbsp;${numberOfRowsString}&nbsp; x &nbsp;${numberOfColumnsString}`);
            $(`#${this._configuration.NumberOfPlayersLabelID}`).html(`Players:&nbsp;${numberOfPlayersString}`);
            this._game.setAttribute(numberOfRows, numberOfColumns, playerList);
            this._game.setCanvasSize(this._canvas.width, this._canvas.height);
            this._game.resetGameVariables();
            this._game.updateTurn();
            this._showGamePanel(true);
            this._gameData.isGameRunning = true;
        }
        _onButtonUndo() {
            if (!this._game.isBlastAnimationRunning)
                this._game.undo();
        }
        _offlineGameLoop(deltaTime) {
            if (!this._gameData.isMouseDataProcessed) {
                let boardCoordinate = this._game.getBoardCoordinates(this._gameData.mouseX, this._gameData.mouseY);
                if (boardCoordinate[0] >= 0 && boardCoordinate[1] >= 0)
                    this._game.processPlayerInput(boardCoordinate[0], boardCoordinate[1]);
                this._gameData.isMouseDataProcessed = true;
            }
            let hasGameEnded = this._game.drawBoard(deltaTime);
            if (hasGameEnded) {
                this._game.resetGameVariables();
                this._gameData.isGameRunning = false;
                this._gameData.isMouseDataProcessed = true;
                this._showGamePanel(false);
                this._applyDefaultCanvasSetting();
            }
        }
        _onMenuButtonClick() {
            if ($(`#${this._configuration.VerticalMenubarID}`).attr("data-state") == "0") {
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "1");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
                $(`#${this._configuration.VerticalMenubarID}`).slideDown(300);
                $(`#${this._configuration.BlockViewDivisionID}`).slideDown(300);
            }
            else {
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "0");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9660;");
                $(`#${this._configuration.VerticalMenubarID}`).slideUp(300);
                $(`#${this._configuration.BlockViewDivisionID}`).slideUp(300);
            }
        }
        _onMouseClickOnCanvas(posX, posY) {
            if (this._gameData.isGameRunning && this._gameData.isMouseDataProcessed) {
                this._gameData.mouseX = posX;
                this._gameData.mouseY = posY;
                this._gameData.isMouseDataProcessed = false;
            }
        }
        _onMouseDown(posX, posY) {
            this._mouseDown = true;
            this._isDragging = false;
            this._currentMouseX = posX;
            this._currentMouseY = posY;
        }
        _onMouseDragging(posX, posY) {
            let delta_x = posX - this._currentMouseX;
            let delta_y = posY - this._currentMouseY;
            this._currentMouseX = posX;
            this._currentMouseY = posY;
            this._isDragging = true;
            if (this._isDragging && this._mouseDown) {
                let delta_t = (this._beginFrame - this._endFrame);
                if (delta_x * delta_x + delta_y * delta_y < 10) {
                    if (!(this._gameData === null || this._gameData.isGameRunning)) {
                        this._cameraLatitude += delta_t * this._cameraRotationSpeed * delta_y / 1000.0;
                        this._cameraLongitude += delta_t * this._cameraRotationSpeed * delta_x / 1000.0;
                        this._updateCameraView();
                    }
                }
            }
        }
        _onMouseUp(posX, posY) {
            this._currentMouseX = posX;
            this._currentMouseY = posY;
            this._mouseDown = false;
            this._isDragging = false;
        }
        _onPlayerSelection() {
            let numberOfPlayersString = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
            let numberOfPlayers = Number(numberOfPlayersString);
            if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
                alert("Invalid number of players.");
                throw new Error("Invalid number of players.");
            }
            for (let i = 0; i < this._configuration.ListOfColorSelectorID.length; i++) {
                let id = `#${this._configuration.ListOfColorSelectorID[i]}`;
                let parentID = null;
                if (this._configuration.ListOfColorSelectorParentID)
                    parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                if (i < numberOfPlayers) {
                    $(id).removeAttr('disabled');
                    $(id).css('visibility', 'visible');
                    if (parentID) {
                        $(parentID).removeAttr('disabled');
                        let displayStyle = $(parentID).attr('data-display');
                        if (displayStyle !== undefined)
                            $(parentID).css('display', displayStyle);
                        else
                            $(parentID).css('display', 'block');
                    }
                }
                else {
                    $(id).attr('disabled', 1);
                    $(id).css('visibility', 'hidden');
                    if (parentID) {
                        $(parentID).attr('disabled', 1);
                        $(parentID).css('display', 'none');
                    }
                }
            }
        }
        _showGamePanel(show) {
            if (show) {
                $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", "none");
                let idList = [this._configuration.InsideMenuDivisionID, this._configuration.HorizontalPanelID, this._configuration.UndoButtonMobileID];
                for (let id of idList) {
                    let displayStyle = $(id).attr('data-display');
                    if (displayStyle !== undefined)
                        $(id).css('display', displayStyle);
                    else
                        $(`#${id}`).css("display", 'block');
                }
            }
            else {
                $(`#${this._configuration.InsideMenuDivisionID}`).css("display", "none");
                $(`#${this._configuration.HorizontalPanelID}`).css("display", "none");
                $(`#${this._configuration.UndoButtonMobileID}`).css("display", "none");
                let displayStyle = $(`#${this._configuration.OutsideMenuDivisionID}`).attr('data-display');
                if (displayStyle !== undefined)
                    $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", displayStyle);
                else
                    $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", 'block');
            }
        }
        _startMainLoop() {
            if (!this.isEngineRunning)
                return;
            this._frameCount++;
            let deltaTime = Math.abs(this._beginFrame - this._endFrame);
            this._endFrame = this._beginFrame;
            this._beginFrame = new Date().getTime();
            if (this._configuration.FrameCounterID) {
                $(`#${this._configuration.FrameCounterID}`).html(`Frame: ${this._frameCount}`);
            }
            if (this._gameData.isGameRunning)
                this._offlineGameLoop(deltaTime);
            else if (this._gameData.startNewGame) {
                this._game.resetGameVariables();
                this._gameData.startNewGame = false;
                this._gameData.isGameRunning = true;
                this._gameData.isMouseDataProcessed = true;
                this._game.updateTurn();
            }
            else if (this._gameData.quitCurrentGame) {
                this._game.resetGameVariables();
                this._gameData.isMouseDataProcessed = true;
                this._gameData.startNewGame = false;
                this._gameData.isGameRunning = false;
                this._showGamePanel(false);
                this._applyDefaultCanvasSetting();
                this._gameData.quitCurrentGame = false;
            }
            else
                this._renderDefaultScene(deltaTime);
            requestAnimationFrame(this._startMainLoop.bind(this));
        }
        _renderDefaultScene(deltaTime) {
            gl_10.gl.clear(gl_10.gl.COLOR_BUFFER_BIT | gl_10.gl.DEPTH_BUFFER_BIT);
            let angle = -60 * Math.cos(0.015 * this._frameCount % 360);
            this._textShader.bind();
            let location = this._textShader.getUniformLocation("modelTransform");
            if (location != -1)
                this._textObject.drawLine(this._textShader, location, "WELCOME TO THE WORLD\nOF\nCHAIN REACTION", glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, angle, 0), "center", "center");
            this._textShader.unbind();
            this._particleShader.bind();
            location = this._particleShader.getUniformLocation("angle");
            if (location != -1)
                gl_10.gl.uniform1f(location, angle);
            this._particleShader.unbind();
            this._updateBrownianParticleMotion();
        }
        _updateCanvasPerspective(width, height) {
            gl_10.gl.viewport(0, 0, width, height);
            this._defaultProj = glm.mat4.create();
            glm.mat4.perspective(this._defaultProj, Math.PI * 45.0 / 180.0, width / height, 1.0, 100.0);
        }
        _updateCameraView() {
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
            let final_mat = glm.mat4.multiply(glm.mat4.create(), this._defaultProj, this._defaultView);
            this._textShader.bind();
            //******************************************** Update projection matrix
            let location = this._textShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, final_mat);
            //***********************************************************************
            //**********************************Update uniform variable (camera position) in shader
            location = this._textShader.getUniformLocation("cameraPosition");
            if (location != -1)
                gl_10.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //***************************************************************
            this._textShader.unbind();
            this._particleShader.bind();
            //******************************************** Update projection matrix
            location = this._particleShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_10.gl.uniformMatrix4fv(location, false, final_mat);
            //*****************************************************************************
            //**********************************Update uniform variable (camera position) in shader
            location = this._particleShader.getUniformLocation("cameraPosition");
            if (location != -1)
                gl_10.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //****************************************************************
            this._particleShader.unbind();
        }
        _updateBrownianParticleMotion() {
            this._particleShader.bind();
            let modelTransformlocation = this._particleShader.getUniformLocation("modelTransform");
            let colorLocation = this._particleShader.getUniformLocation("particleColor");
            let flickeringLocation = this._particleShader.getUniformLocation("isFlickering");
            for (let i = 0; i < this._mNumParticles; i++) {
                let model = glm.mat4.create();
                glm.mat4.translate(model, model, this._particleData[i].position);
                if (modelTransformlocation !== -1)
                    gl_10.gl.uniformMatrix4fv(modelTransformlocation, false, model);
                if (flickeringLocation !== -1)
                    gl_10.gl.uniform1f(flickeringLocation, this._particleData[i].isFlickering ? 1.0 : 0.0);
                if (colorLocation != -1)
                    gl_10.gl.uniform4f(colorLocation, this._particleData[i].color[0], this._particleData[i].color[1], this._particleData[i].color[2], 1.0);
                this._sampleSphere.draw(1);
                let distance = glm.vec3.length(this._particleData[i].position);
                if (distance < this._boundingBox) {
                    this._particleData[i].position[0] += 0.2 * (-1 + 2 * Math.random());
                    this._particleData[i].position[1] += 0.2 * (-1 + 2 * Math.random());
                    this._particleData[i].position[2] += 0.2 * (-1 + 2 * Math.random());
                }
                else {
                    this._particleData[i].position[0] *= 0.9;
                    this._particleData[i].position[1] *= 0.9;
                    this._particleData[i].position[2] *= 0.9;
                }
            }
            this._particleShader.unbind();
        }
        /***************************************************************************************************/
        /***************************************** Public methods definitions ******************************/
        /************************************************************************************************* */
        configure(config) {
            if (this._configuration === null) { //If no configuration yet exists, copy everything
                this._configuration = Object.assign({}, config);
                return;
            }
            //Else update only those that are specified in config.
            Object.assign(this._configuration, config);
        }
        destroy() {
            if (this._isDestroyed == true)
                return;
            if (this.isEngineRunning)
                this.stop();
            this._gameData = {
                isGameRunning: false,
                quitCurrentGame: false,
                startNewGame: false,
                isMouseDataProcessed: true,
                mouseX: null,
                mouseY: null
            };
            gl_10.gl.useProgram(null);
            gl_10.gl.bindBuffer(gl_10.gl.ARRAY_BUFFER, null);
            gl_10.gl.bindBuffer(gl_10.gl.ELEMENT_ARRAY_BUFFER, null);
            gl_10.gl.bindVertexArray(null);
            this._sampleSphere.cleanUp();
            this._sampleSphere = null;
            this._textShader.cleanUp();
            this._textShader = null;
            this._particleData.length = 0;
            this._particleShader.cleanUp();
            this._particleShader = null;
            this._textObject.cleanUp();
            this._textObject = null;
            this._game.cleanUp();
            this._game = null;
            this._isDestroyed = true;
        }
        isConfigured() {
            if (!this._configuration)
                return false;
            if (!this._configuration.AudioElementID)
                return false;
            if (!this._configuration.BoardDimLabelID)
                return false;
            if (!this._configuration.BlockViewDivisionID)
                return false;
            if (!this._configuration.CanvasElementID)
                return false;
            if (!this._configuration.CanvasParentID)
                return false;
            //if (!this._configuration.CanvasViewBlockerID) return false; //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
            if (!this._configuration.ColorSequenceMenuID)
                return false;
            if (!this._configuration.CurrentPlayerLabelID)
                return false;
            if (!this._configuration.CurrentPlayerMobileLabelID)
                return false;
            //if (!this._configuration.DefaultMaterialForParticles) return false; //DefaultMaterialForParticles specification is optional for game engine
            //if (!this._configuration.DefaultNumberOfColumn) return false; //DefaultNumberOfColumn specification is optional for game engine
            //if (!this._configuration.DefaultNumberOfRow) return false; //DefaultNumberOfRow specification is optional for game engine
            //if (!this._configuration.FrameCounterID) return false; //FrameCounterID specification is optional for game engine
            if (!this._configuration.HtmlMenuButtonID)
                return false;
            if (!this._configuration.HorizontalPanelID)
                return false;
            if (!this._configuration.InsideMenuDivisionID)
                return false;
            if (!this._configuration.ListOfColorSelectorID)
                return false;
            if (this._configuration.ListOfColorSelectorParentID) { //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`. If provided, must have same number of ids as in `ListOfColorSelectorID`
                if (this._configuration.ListOfColorSelectorParentID.length != this._configuration.ListOfColorSelectorID.length)
                    return false;
            }
            if (!this._configuration.ListOfResourceNames)
                return false;
            if (!this._configuration.MainmenuButtonID)
                return false;
            //if (!this._configuration.MessageBoxID) return false; //MessageBoxID specification is optional.
            if (!this._configuration.NewGameButtonID)
                return false;
            //if (!this._configuration.NumberOfBrownianParticles) return false; //NumberOfBrownianParticles specification is optional.
            if (!this._configuration.NumberOfColumnSelectorID)
                return false;
            if (!this._configuration.NumberOfPlayersLabelID)
                return false;
            if (!this._configuration.NumberOfPlayersSelectorID)
                return false;
            if (!this._configuration.NumberOfRowSelectorID)
                return false;
            if (!this._configuration.OutsideMenuDivisionID)
                return false;
            if (!this._configuration.StartGameButtonID)
                return false;
            if (!this._configuration.PathToResource)
                return false;
            //if (!this._configuration.ProgressBarID) return false; //Optional, ID of the progress bar element.
            if (!this._configuration.UndoButtonID)
                return false;
            if (!this._configuration.UndoButtonMobileID)
                return false;
            if (!this._configuration.VerticalMenubarID)
                return false;
            return true;
        }
        get isEngineRunning() { return this._isEngineRunning; }
        start(alphabetMeshMap, materialLibraryData) {
            this._applyDefaultHTMLSettings();
            //Parse the matrial data
            this._currentMaterialLibrary = new OBJ.MaterialLibrary(materialLibraryData);
            let defaultMaterial = this._currentMaterialLibrary.materials[this._configuration.DefaultMaterialForParticles];
            if (defaultMaterial)
                Object.assign(this._defaultParticleMaterial, defaultMaterial);
            if (this._canvas == null)
                this._canvas = gl_10.glUtilities.intialize(this._configuration.CanvasParentID, this._configuration.VerticalMenubarID, this._configuration.CanvasElementID);
            if (this._game == null) {
                let gameConfig = {};
                gameConfig.AudioElementID = this._configuration.AudioElementID;
                gameConfig.CurrentPlayerLabelElementID = this._configuration.CurrentPlayerLabelID;
                gameConfig.CurrentPlayerLabelMobileElementID = this._configuration.CurrentPlayerMobileLabelID;
                this._game = new offlineMaingame_1.MainGame(gameConfig);
            }
            //Add the material data to each alphabet mesh and add them to alphabet list
            this._alphabetMeshData.clear();
            for (let meshName of Object.keys(alphabetMeshMap)) {
                alphabetMeshMap[meshName].addMaterialLibrary(this._currentMaterialLibrary);
                let meshData = new MeshContainer_1.MeshData(alphabetMeshMap[meshName]);
                this._alphabetMeshData.set(meshName, meshData);
            }
            this._initDefaultVariables();
            this._applyDefaultCanvasSetting();
            //********************************************************************************
            //******* Apply default settings for text rendering
            if (this._textShader === null)
                this._applyTextShaderSettings();
            //********* Apply default settings for particle rendering
            if (this._particleShader === null)
                this._applyParticleShaderSettings();
            this._updateCameraView();
            this._textObject = new Text_1.TextObject(1.2, 1.0, 2.1, this._alphabetMeshData);
            this._bindGameEngineWithHTML();
            this._isDestroyed = false;
            if (!this.isEngineRunning) {
                this._isEngineRunning = true;
                this._startMainLoop();
            }
        }
        stop() { this._isEngineRunning = false; }
        resize() {
            if (($(window).width() > 600) && ($(`#${this._configuration.VerticalMenubarID}`).css("display") == "none")) {
                $(`#${this._configuration.VerticalMenubarID}`).css("display", "block");
                $(`#${this._configuration.BlockViewDivisionID}`).css("display", "block");
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "1");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
            }
            let w = $(`#${this._configuration.CanvasParentID}`).width();
            let h = $(`#${this._configuration.CanvasParentID}`).height();
            if (this._canvas !== null) {
                this._canvas.width = w;
                this._canvas.height = h;
                if (this._gameData.isGameRunning) {
                    this._game.setCanvasSize(w, h);
                }
                else {
                    //Here goes code for default camera setup
                    this._updateCanvasPerspective(w, h);
                }
            }
        }
        radians(degree) { return Math.PI * degree / 180; }
        degrees(radian) { return 180 * radian / Math.PI; }
    }
    exports.OfflineEngine = OfflineEngine;
});
define("offlineApp", ["require", "exports", "jquery", "webgl-obj-loader", "offlineEngine"], function (require, exports, $, OBJ, offlineEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntryPoint = void 0;
    /**
     * Downloads and parses the `.obj` data for each of the 26 alphabets (and their materials if any) and also a `.mtl` data specified in
     * the last entry of the resource list.
     * @param {Array<string} listOfResource A list of strings with length 27 which contains the names of the 26 `.obj` files
     * (mapping to each alphabet is done their positions in the list) and a (`.mtl`) material file.
     * @param {string} pathToResource The absoule (url) path to resource names contained in `listOfResource`.
     **/
    function DownloadAlphabetMeshData(listOfResource, pathToResource) {
        let modelList = [];
        if (listOfResource.length < 26) {
            alert("The list of resource names must contain all 26 '.obj' data for each alphabets.");
            throw new Error("Specified list of resource names must contain at least 26 entries corresponding to the '.obj' data for each 26 alphabets. ");
        }
        let alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < 26; i++) { //Collect info on .obj data for each of the 26 alphabets.
            let entryFile = listOfResource[i];
            let resourceName = entryFile.replace(/\.[^/.]+$/, ""); //Get the file name without the extension.
            let resourceExtension = entryFile.substring(entryFile.lastIndexOf("."));
            if (resourceExtension !== '.obj') {
                alert("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
                throw new Error("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
            }
            let objEntry = {
                obj: pathToResource + entryFile,
                name: alphabets.charAt(i),
                downloadMtlTextures: false,
                mtl: false //By default, does not download material. Rather a common material library (downloaded only once) is added to each mesh later.
            };
            modelList.push(objEntry);
        }
        let promiseMaterial = undefined;
        if (listOfResource.length > 26) { //Collect info on .mtl data for each of the 26 alphabets.
            let materialFilePath = listOfResource[26]; //Retrieve the 27 the entry of the resource list.
            let resourceExtension = materialFilePath.substring(materialFilePath.lastIndexOf("."));
            if (resourceExtension !== '.mtl') {
                alert("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
                throw new Error("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
            }
            promiseMaterial = fetch(pathToResource + materialFilePath);
        }
        let promiseMeshMapArray = [];
        modelList.forEach(entry => { let promise = OBJ.downloadModels([entry]); promiseMeshMapArray.push(promise); });
        return [promiseMeshMapArray, promiseMaterial];
    }
    function OnDocumentReady(config, engine) {
        if (!engine)
            engine = new offlineEngine_1.OfflineEngine(config);
        //**************************************************************
        //************* Download mesh objects and initilize engine (webgl renderer)
        if (config.ListOfResourceNames) {
            let totalNumberOfResources = config.ListOfResourceNames.length;
            let resourceDownloaded = 0;
            let promiseForMeshDataAndMaterial = DownloadAlphabetMeshData(config.ListOfResourceNames, config.PathToResource);
            let promiseForMeshDataArray = promiseForMeshDataAndMaterial[0];
            let promiseForMaterial = promiseForMeshDataAndMaterial[1];
            let materialData = undefined;
            let alphabetMeshList = {};
            let isCanvasBlockerVisible = false;
            let canvasBlockerDisplay = $(`#${config.CanvasViewBlockerID}`).css('display');
            if (canvasBlockerDisplay === 'none')
                canvasBlockerDisplay = 'block';
            $(`#${config.CanvasViewBlockerID}`).attr('data-display', canvasBlockerDisplay);
            let messageBoxID = config.MessageBoxID ? `#${config.MessageBoxID}` : undefined;
            let progressBarID = config.ProgressBarID ? `#${config.ProgressBarID}` : undefined;
            let canvasBlockerID = config.CanvasViewBlockerID ? `#${config.CanvasViewBlockerID}` : undefined;
            promiseForMaterial.then(response => {
                if (!response.ok) {
                    if (messageBoxID) {
                        $(messageBoxID).html("Failed to fetch material data from specified url. HTTP status: ");
                    }
                    throw new Error("Failed to fetch material data from specified url. HTTP status: " + response.status.toString());
                }
                let materialResponse = response.text();
                materialResponse.then(data => {
                    materialData = data;
                    resourceDownloaded += 1;
                    if (canvasBlockerID) {
                        if (!isCanvasBlockerVisible) {
                            $(canvasBlockerID).css("display", canvasBlockerDisplay);
                            isCanvasBlockerVisible = true;
                        }
                    }
                    if (messageBoxID)
                        $(messageBoxID).html(`Loading resources. Please wait ...`);
                    if (progressBarID) {
                        let width = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                        $(progressBarID).css('width', `${width}%`);
                    }
                    if (resourceDownloaded == totalNumberOfResources) {
                        if (messageBoxID)
                            $(messageBoxID).html("Starting game engine ...");
                        if (canvasBlockerID)
                            $(canvasBlockerID).css("display", "none");
                        engine.start(alphabetMeshList, materialData);
                    }
                })
                    .catch(reason => { console.error(reason); });
            })
                .catch(reason => { console.error(reason); });
            promiseForMeshDataArray.forEach(promise => {
                promise.then(objMeshData => {
                    Object.keys(objMeshData).forEach(key => {
                        alphabetMeshList[key] = objMeshData[key];
                        resourceDownloaded += 1;
                        if (canvasBlockerID) {
                            if (!isCanvasBlockerVisible) {
                                $(canvasBlockerID).css("display", canvasBlockerDisplay);
                                isCanvasBlockerVisible = true;
                            }
                        }
                        if (messageBoxID)
                            $(messageBoxID).html(`Loading resources. Please wait ...`);
                        if (progressBarID) {
                            let width = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                            $(progressBarID).css('width', `${width}%`);
                        }
                        if (resourceDownloaded == totalNumberOfResources) {
                            if (messageBoxID)
                                $(messageBoxID).html("Starting game engine ...");
                            if (canvasBlockerID)
                                $(canvasBlockerID).css("display", "none");
                            engine.start(alphabetMeshList, materialData);
                        }
                    });
                })
                    .catch(reason => { console.error(reason); });
            });
        }
    }
    function EntryPoint(config) {
        $(function () {
            var engine = new offlineEngine_1.OfflineEngine(config);
            OnDocumentReady(config, engine);
            window.onunload = (function (event) {
                if (engine) {
                    engine.destroy();
                    engine = null;
                }
                return null;
            }).bind(this);
        });
    }
    exports.EntryPoint = EntryPoint;
});
define("onlineMaingame", ["require", "exports", "offlineMaingame", "gl"], function (require, exports, offlineGame, gl_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OnlineMainGame = void 0;
    class OnlineMainGame extends offlineGame.MainGame {
        //************************************************************************************************** */
        ///**************************************** Public methods **********************************************
        //************************************************************************************************** */
        constructor(gameConfig) {
            super(gameConfig);
            this._onlinePosition = null;
            this._hasGameEnded = null;
            this._haveIWon = null;
            this._isWatchingGame = null;
        }
        //***************************************************************************************************** */
        //************************************** Private methods ***********************************************
        //***************************************************************************************************** */
        _runBlastAnimation(deltaTime) {
            let hasGameEnded = false; //boolean flag to detect the end of a game.
            if (this._blastDisplacement == 0)
                this._blastSound.play();
            this._blastDisplacement += ((this._CUBE_WIDTH / this._BLAST_TIME) * deltaTime) / 1000.0;
            if (this._blastDisplacement < this._CUBE_WIDTH) { //A blast animation is still running.
                gl_11.gl.clear(gl_11.gl.COLOR_BUFFER_BIT | gl_11.gl.DEPTH_BUFFER_BIT); //Clear color and depth buffer before rendering new frame.
                //***************** Render board ******************/
                this._drawGrid();
                for (let boardEntry of this._BOARD) {
                    let boardValue = boardEntry[1];
                    let boardCoordinate = boardEntry[1].boardCoordinate;
                    let center = [
                        (boardCoordinate[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                        (boardCoordinate[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                        0
                    ];
                    const color = boardValue.color;
                    let angle = this._rotationAngle % 360.0;
                    if (!this.isExplosive(boardValue))
                        this._drawOrb(center, boardValue.rotationAxes, angle, boardValue.level, color);
                    else {
                        if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0] + 1, boardCoordinate[1]))) {
                            let displacedCenter = [
                                center[0] + this._blastDisplacement,
                                center[1],
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0] - 1, boardCoordinate[1]))) {
                            let displacedCenter = [
                                center[0] - this._blastDisplacement,
                                center[1],
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] + 1))) {
                            let displacedCenter = [
                                center[0],
                                center[1] + this._blastDisplacement,
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                        if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] - 1))) {
                            let displacedCenter = [
                                center[0],
                                center[1] - this._blastDisplacement,
                                center[2]
                            ];
                            this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                        }
                    }
                }
                //********************************************** */
                this._rotationAngle += ((this._ROTATION_SPEED * deltaTime) / 1000.0);
            }
            else { //A blast is completed. Update board.
                //************************* Update board after an explosion **********/
                let bombValue = this._currentBombs[0][1];
                let bombColor = bombValue.color;
                for (let bomb of this._currentBombs)
                    this._BOARD.delete(bomb[0]);
                for (let key_value of this._currentAllNeighbours) {
                    if (this._BOARD.has(key_value[0])) {
                        let board_value = this._BOARD.get(key_value[0]);
                        let newBoardValue = {};
                        newBoardValue.boardCoordinate = board_value.boardCoordinate;
                        newBoardValue.level = board_value.level + key_value[1];
                        newBoardValue.color = bombColor;
                        newBoardValue.rotationAxes = {};
                        Object.assign(newBoardValue.rotationAxes, board_value.rotationAxes);
                        this._BOARD.set(key_value[0], newBoardValue);
                    }
                    else {
                        let newBoardValue = {};
                        newBoardValue.boardCoordinate = offlineGame.MainGame.inverseCantorValue(key_value[0]);
                        newBoardValue.level = key_value[1];
                        newBoardValue.color = bombColor;
                        let axes = [2 * Math.random() - 1, 6 * Math.random() - 3, 8 * Math.random() - 4];
                        if ((axes[0] == 0) && (axes[1] == 0) && (axes[2] == 0)) {
                            axes[0] += Math.random();
                            axes[1] += Math.random();
                            axes[2] += Math.random();
                        }
                        newBoardValue.rotationAxes = {};
                        Object.assign(newBoardValue.rotationAxes, axes);
                        this._BOARD.set(key_value[0], newBoardValue);
                    }
                }
                //***************************************************************** */
                //Update the current list of explosive sites. If new explosive sites are created after the preceeding blasts, those are processed in the next animation.
                this._currentBombs = this._getBombs(this._BOARD);
                //Update the current list of sites that have an explosive neighbouring site.
                this._currentAllNeighbours = this._getBombNeighbours();
                //Reset the variable for processing the next blast animation.
                this._blastDisplacement = 0;
                //Update the list of eliminated players after a blast. This does not alter the turn variable of the game.
                this._eliminatePlayers(false);
                //Check if you have lost the game after a blast:
                let myColor = this._players[this._onlinePosition - 1];
                if (this.isEliminated(myColor)) {
                    this._haveIWon = false;
                    if (this._players.length > 2 && this._eliminated.length != this._players.length - 1) {
                        if (this._isWatchingGame == null) {
                            let confirmed = window.confirm("You have lost. Watch rest of the game?");
                            if (!confirmed) {
                                this._isWatchingGame = false;
                                hasGameEnded = true;
                                this._hasGameEnded = true;
                            }
                            else
                                this._isWatchingGame = true;
                        }
                    }
                    else {
                        hasGameEnded = true;
                        this._hasGameEnded = true;
                    }
                }
                else {
                    if (this._eliminated.length == this._players.length - 1) {
                        hasGameEnded = true;
                        this._hasGameEnded = true;
                        this._haveIWon = true;
                    }
                }
            }
            return hasGameEnded;
        }
        get currentActivePlayers() {
            return this._players.length - this._eliminated.length;
        }
        drawBoard(deltaTime) {
            let hasGameEnded = false; //Boolean flag to detect the end of a game.
            let isEmptyBombList = this._currentBombs.length > 0 ? false : true; //Check if the board contains any explosive or not.
            if (this.isBlastAnimationRunning && isEmptyBombList) {
                this._eliminatePlayers(true);
                this._blastAnimationRunning = false;
            }
            if (!isEmptyBombList) {
                this._blastAnimationRunning = true;
                hasGameEnded = this._runBlastAnimation(deltaTime);
            }
            else {
                gl_11.gl.clear(gl_11.gl.COLOR_BUFFER_BIT | gl_11.gl.DEPTH_BUFFER_BIT);
                this._drawGrid();
                let angle = this._rotationAngle % 360;
                for (let key_value of this._BOARD) {
                    let key = key_value[1].boardCoordinate;
                    let center = [
                        (key[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                        (key[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                        0
                    ];
                    this._drawOrb(center, key_value[1].rotationAxes, angle, key_value[1].level, key_value[1].color);
                }
                if (this._BOARD.size > 0)
                    this._rotationAngle += ((this._ROTATION_SPEED * deltaTime) / 1000.0);
            }
            if (hasGameEnded)
                super.resetGameVariables();
            return hasGameEnded;
        }
        getColorOfPlayer(playerNumber) {
            if (this._players.length > 0) {
                return playerNumber <= this._players.length ? this._players[playerNumber - 1] : "";
            }
            return "";
        }
        getTurnValue() { return this._turn; }
        get hasEnded() { return this._hasGameEnded; }
        get haveIWon() { return this._haveIWon; }
        /**
         * Checks if it is the turn of the player with the current `onlinePosition`.
         * Returns {int} -1 if `onlinePosition` or `players` attribute are not yet set or the current board contains explosives. Otherwise, returns 0
         * if it is not the player's turn, 1 if it is.
        */
        isItMyTurn() {
            if (!(this._onlinePosition && this._players.length) || this.isBlastAnimationRunning)
                return -1;
            if (1 + this._turn % this._players.length == this._onlinePosition)
                return 1;
            return 0;
        }
        get isWatching() { return this._isWatchingGame; }
        resetGameVariables() {
            this._onlinePosition = null;
            this._hasGameEnded = false;
            this._haveIWon = null;
            this._isWatchingGame = null;
            super.resetGameVariables();
        }
        setAttribute(numberOfRows, numberOfColumns, playerList, onlinePosition) {
            if (!onlinePosition)
                throw new Error("Game attribute `onlinePosition` is missing.");
            super.setAttribute(numberOfRows, numberOfColumns, playerList);
            this._onlinePosition = onlinePosition;
        }
    }
    exports.OnlineMainGame = OnlineMainGame;
});
define("priorityQueue", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PriorityQueue = void 0;
    class PriorityQueue {
        constructor(listOfElements) {
            //************************* Private members *******************/
            this._container = [];
            this._container = [];
            if (listOfElements && listOfElements.length > 0) {
                listOfElements.forEach(element => { this.enqueue(element); });
            }
        }
        //************************* Public members *******************/
        clear() {
            this._container.length = 0;
        }
        dequeue() {
            if (!this.isEmpty)
                return this._container.shift();
            else
                return null;
        }
        get end() {
            if (!this.isEmpty)
                return this._container[this.size - 1];
            else
                return null;
        }
        enqueue(element) {
            let isElementAdded = false;
            for (let i = 0; i < this.size; i++) {
                let previousElement = this._container[i];
                if (element.priority < previousElement.priority) {
                    this._container.splice(i, 0, element);
                    if (!isElementAdded)
                        isElementAdded = true;
                }
            }
            if (!isElementAdded)
                this._container.push(element);
        }
        get front() {
            if (!this.isEmpty)
                return this._container[0];
            else
                return null;
        }
        get isEmpty() {
            return this._container.length > 0 ? false : true;
        }
        get size() {
            return this._container.length;
        }
    }
    exports.PriorityQueue = PriorityQueue;
});
define("onlineEngine", ["require", "exports", "jquery", "pusher-js", "gl-matrix", "webgl-obj-loader", "gl", "MeshContainer", "offlineMaingame", "onlineMaingame", "Shader", "Sphere", "Text", "priorityQueue"], function (require, exports, $, pusher_js_1, glm, OBJ, gl_12, MeshContainer_2, offlineMaingame_2, onlineMaingame_1, Shader_3, Sphere_3, Text_2, priorityQueue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OnlineEngine = void 0;
    ;
    ;
    class OnlineEngine {
        constructor(config, pusherModule) {
            this._beginFrame = 0;
            this._currentMouseX = 0;
            this._currentMouseY = 0;
            this._endFrame = 0;
            this._fpsRate = 65;
            this._frameCount = 0;
            this._isDragging = false;
            this._isEngineRunning = false;
            this._mouseDown = false;
            //******************************* Settings for canvas scence (Brownian particles) outside of a game  *************************** */
            this._alphabetMeshData = new Map();
            this._boundingBox = 30;
            this._cameraDistance = 30;
            this._cameraLatitude = 0; //in degree
            this._cameraLongitude = 0; // in degree
            this._cameraRotationSpeed = 360.0; //Speed (degree / mouse_increment / sec) at which camera rotates while dragging mouse pointer.
            this._cameraTarget = [0, 0, 0];
            this._cameraUp = [0, 1, 0];
            this._currentPusherChannel = null;
            this._defaultParticleMaterial = {};
            this._defaultProj = null;
            this._defaultView = null;
            this._lightDirLatitude = 0.0; //Latitude and longitude determine the direction, not the light position. Light Direction == target position - light position
            this._lightDirLongitude = 180.0;
            this._mNumParticles = 30;
            this._particleData = null;
            this._particleShader = null;
            this._personalUserChannel = null;
            this._sampleSphere = null;
            this._textObject = null;
            this._textShader = null;
            //********************************************************************************* */
            this._canvas = null;
            this._configuration = null; //Configuration settings for linking the engine with the server and the html document. 
            this._eventNameForStartingGame = null;
            this._eventNameForBroadcastingInputs = 'incoming-input';
            this._eventNameForRequestingInputs = 'send-your-input';
            this._eventNameForSendingBeacon = 'I-am-ready-to-start!';
            this._game = null;
            this._gameData = {
                isGameRunning: false,
                isWaitingForGame: false,
                isWaitingForMove: false,
                totalPlayers: null,
                onlinePosition: null,
                channel: null,
                rows: null,
                columns: null
            };
            this._isAjaxRequestSentToTriggerGame = null;
            this._isBoardInputProcessedByEngine = null; //A boolean flag to determine if the last input fed into the game is processed by engine too or not.
            this._isDestroyed = null;
            this._isReadyToStartNewGame = null;
            this._processedBoardInput = null; //contains the last board input fed into the game.
            this._winningMaterial = null;
            this.configure(config);
            if (!this.isConfigured()) {
                alert("Failed to configure engine instance. Perhaps forgot to specify all properties correctly?");
                throw new Error("Engine was not configured correctly.");
            }
            if (config.NumberOfBrownianParticles)
                this._mNumParticles = config.NumberOfBrownianParticles;
            this._eventNameForStartingGame = this._configuration.CommandForStartingGame;
            if (pusherModule !== undefined) {
                this._pusherModule = pusherModule;
            }
            else
                this._pusherModule = pusher_js_1.default;
            this._pusherClient = new pusherModule(this._configuration.PusherSettings.app_key, this._configuration.PusherSettings);
            if (this._configuration.PageTokenID) {
                let pageId = $(`#${this._configuration.PageTokenID}`).val();
                if (!pageId.length) {
                    alert("Session id is corrupted or was intentionally modified. Server invalidated the current session.");
                    throw new Error("Invalid session id.");
                }
                this._personalUserChannel = this._pusherClient.subscribe(`private-${pageId}`);
                this._personalUserChannel.bind('pusher:subscription_succeeded', status => {
                    this._personalUserChannel.bind(`${pageId}.session_invalidated`, (data => {
                        if (this._gameData.isGameRunning)
                            this._showGamePanel(false);
                        this._gameData.isGameRunning = false;
                        this._gameData.channel = null;
                        this._gameData.isWaitingForGame = false;
                        this._updateServerMessage("Current session is invalid.");
                        if (this._currentPusherChannel) {
                            this._currentPusherChannel.unbind_all();
                            this._currentPusherChannel.unsubscribe();
                            this._currentPusherChannel = null;
                        }
                        if (this._personalUserChannel) {
                            this._personalUserChannel.unbind_all();
                            this._personalUserChannel.unsubscribe();
                            this._personalUserChannel = null;
                        }
                        if (this._pusherClient) {
                            this._pusherClient.unbind_all();
                            this._pusherClient.disconnect();
                            this._pusherClient = null;
                        }
                        this._toggleStateOfGameControls(false);
                        $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
                        $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                        $(`#${this._configuration.LogoutButtonID}`).attr('disabled', 1);
                        if (this._configuration.LogoutButtonMobileID)
                            $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
                        this.destroy();
                    }).bind(this));
                });
                this._personalUserChannel.bind('pusher:subscription_error', (status => {
                    alert(`Game engine failure: could not subscribe to private channel. See console log for details.`);
                    this._toggleStateOfGameControls(false);
                    this._pusherClient = null;
                    $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
                    $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                    $(`#${this._configuration.LogoutButtonID}`).attr('disabled', 1);
                    if (this._configuration.LogoutButtonMobileID)
                        $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
                    throw new Error(`Error occurred while subscribing to private channel: ${status.error}. Status code: ${status.status}`);
                }).bind(this));
                this._personalUserChannel.bind('pusher:error', (status => {
                    alert(`Error occurred while subscribing to private channel. See console log for details.`);
                    this._pusherClient = null;
                    this._toggleStateOfGameControls(false);
                    $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
                    $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                    $(`#${this._configuration.LogoutButtonID}`).attr('disabled', 1);
                    if (this._configuration.LogoutButtonMobileID)
                        $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
                    throw new Error(`Error occurred while subscribing to private channel: ${status.error}. Status code: ${status.status}`);
                }).bind(this));
                this._pusherClient.user.user_data = { id: pageId, user_info: {} };
                this._pusherClient.user.signin(); //This method is not yet available in pusher-python server library.
            }
            this._listOfPendingInputs = new priorityQueue_1.PriorityQueue();
            this._listOfProcessedInputs = new Map();
        }
        //************************************************************************************************** */
        //**************************************** Private method definitions ******************************/
        //*************************************************************************************************** */
        _applyDefaultCanvasSetting() {
            gl_12.gl.enable(gl_12.gl.CULL_FACE);
            gl_12.gl.enable(gl_12.gl.DEPTH_TEST);
            let w = $(`#${this._configuration.CanvasParentID}`).width();
            let h = $(`#${this._configuration.CanvasParentID}`).height();
            if (this._canvas !== null) {
                this._canvas.width = w;
                this._canvas.height = h;
                this._updateCanvasPerspective(w, h);
            }
        }
        _applyDefaultHTMLSettings() {
            //********* Preassign default variables of the HTML document.
            if (this._configuration.DefaultNumberOfColumn) {
                $(`#${this._configuration.NumberOfColumnSelectorID}`).val(this._configuration.DefaultNumberOfColumn.toString()); //Set default number of columns in board.
            }
            if (this._configuration.DefaultNumberOfRow) {
                $(`#${this._configuration.NumberOfRowSelectorID}`).val(this._configuration.DefaultNumberOfRow.toString()); //Set default number of rows in board.
            }
            if (this._configuration.ListOfColorSelectorParentID) {
                for (let i = 0; i < 2; i++) {
                    let parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                    let displayStyle = $(parentID).css('display');
                    if (displayStyle !== undefined && displayStyle !== 'none')
                        $(parentID).attr('data-display', displayStyle);
                }
            }
            if (this._configuration.ListOfColorSelectorID.length > 2) { //Disable all color selectors except the first two.
                for (let i = 2; i < this._configuration.ListOfColorSelectorID.length; i++) {
                    let playerID = `#${this._configuration.ListOfColorSelectorID[i]}`;
                    $(playerID).attr("disabled", 1);
                    $(playerID).css('visibility', 'hidden');
                    if (this._configuration.ListOfColorSelectorParentID) {
                        let parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                        let displayStyle = $(parentID).css('display');
                        if (displayStyle !== undefined && displayStyle !== 'none')
                            $(parentID).attr('data-display', displayStyle);
                        else
                            $(parentID).attr('data-display', 'block');
                        $(parentID).attr("disabled", 1);
                        $(parentID).css('display', 'none');
                    }
                }
                ;
            }
            let menuIDs = [this._configuration.OutsideMenuDivisionID, this._configuration.InsideMenuDivisionID];
            for (let id of menuIDs) {
                if (id) {
                    let displayStyle = $(`#${id}`).css('display');
                    if (displayStyle !== undefined && displayStyle !== 'none')
                        $(`#${id}`).attr('data-display', displayStyle);
                    else
                        $(`#${id}`).attr('data-display', 'block');
                }
            }
            let displayStyle = $(`#${this._configuration.InsideMenuDivisionID}`).css('display');
            if (displayStyle !== undefined && displayStyle !== 'none')
                $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', displayStyle);
            else
                $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', 'block');
            $(`#${this._configuration.InsideMenuDivisionID}`).css('display', 'none');
            for (let id of this._configuration.ListOfHorizontalPanelID) {
                displayStyle = $(`#${id}`).css('display');
                if (displayStyle !== undefined && displayStyle !== 'none')
                    $(`#${id}`).attr('data-display', displayStyle);
                else
                    $(`#${id}`).attr('data-display', 'block');
                $(`#${id}`).css("display", 'none');
            }
            let allColors = offlineMaingame_2.colorList.keys(); //Fetch list of all possible color values. Must contain at least ListOfColorSelectorID.length many colors.
            if (offlineMaingame_2.colorList.size < this._configuration.ListOfColorSelectorID.length) {
                alert("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
                throw new Error("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
            }
            for (let i = 0; i < offlineMaingame_2.colorList.size; i++) {
                let color = allColors.next().value;
                color = color.charAt(0).toUpperCase() + color.slice(1);
                for (let id of this._configuration.ListOfColorSelectorID) {
                    let selectObj = $(`#${id}`);
                    selectObj.append($('<option>', {
                        text: color
                    }));
                }
                if (i < this._configuration.ListOfColorSelectorID.length)
                    $(`#${this._configuration.ListOfColorSelectorID[i]}`).val(color);
            }
            //********************** Disable all buttons except logout. The buttons will be enabled again after a successful engine start */
            if (this._configuration.RequestGameButtonID)
                $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
            if (this._configuration.CancelRequestGameButtonID)
                $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
            $(`#${this._configuration.HtmlMenuButtonID}`).removeAttr('disabled');
            for (let id of this._configuration.ListOfHorizontalPanelID) {
                $(`#${id}`).css('visibility', 'visible');
            }
        }
        _applyParticleShaderSettings() {
            //*************************** Brownian-particle-shader setup
            this._particleShader = new Shader_3.Shader();
            let vertParticleSource = "#version 300 es\n\
            layout(location = 0) in vec3 vertexPosition;\n\
            layout(location = 1) in vec3 vertexNormal;\n\
            layout(location = 2) in vec2 texCoord;\n\
            layout(location = 3) in vec4 vertexColor;\n\
            out highp vec3 normal;\n\
            out highp vec4 vPosition;\
            uniform mat4 projectionView;\n\
            uniform mat4 modelTransform;\n\
            void main() {\n\
            	vPosition = modelTransform * vec4(vertexPosition, 1.0);\n\
            	gl_Position = projectionView * vPosition;\n\
            	normal = normalize(vec3(modelTransform * vec4(vertexNormal, 0)));\n\
            }";
            //Fragment shader for rendering brownian particles
            let fragParticleSource = "#version 300 es\n\
            precision highp float;\n\
            in highp vec3 normal;\n\
            in highp vec4 vPosition;\
            out highp vec4 outputColor;\n\
            uniform vec3 cameraPosition;\n\
            uniform vec4 particleColor;\n\
            uniform float angle;\n\
            uniform float isFlickering;\n\
            uniform vec3 vDiffuse;\n\
            uniform vec3 vSpecular;\n\
            uniform float vSpecularExponent;\n\
            uniform vec3 lightDirection;\n\
            float randomExponent(vec2 config) {\n\
                return fract(sin(dot(config.xy, vec2(12.9898, 78.233))) * 43758.5453);\n\
            }\n\
            void main(){\n\
            	vec3 viewDir = normalize(cameraPosition - vPosition.xyz); \n\
                vec3 sunDir = normalize(lightDirection);\n\
                vec3 reflectionVector =  normalize(2.0 * dot(normal, -sunDir) * normal + sunDir);\n\
                float brightness = clamp(1.1 * dot(normal, -sunDir), 0.0, 1.0);\n\
                float exponent = randomExponent(vec2(1.0, pow(angle, 1.5)));\n\
                vec3 randomColor = clamp(vec3(0.5, 0.5, 0.0) + vec3(sin(angle/10.0), cos(angle/20.0 + vPosition.y), sin(vPosition.z)), 0.0, 1.0);\n\
                vec3 modifiedDiffuseColor = (1.0 - isFlickering) * particleColor.xyz + isFlickering * randomColor;\n\
                vec3 specularComponent = clamp(modifiedDiffuseColor * vSpecular * pow(dot(reflectionVector, viewDir), vSpecularExponent), 0.0, 1.0);\n\
                vec3 color = clamp((modifiedDiffuseColor + specularComponent) * brightness, 0.0, 1.0);\n\
                outputColor = vec4( color , 1.0);\n\
            }";
            this._particleShader.compile(vertParticleSource, fragParticleSource);
            let final_mat = glm.mat4.create();
            glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
            let _model = glm.mat4.create();
            this._particleShader.bind();
            //Update uniform variable (projection matrix) in shader
            let location = this._particleShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, final_mat);
            //**********************************************************
            //Update uniform variable (modelView matrix) in shader
            location = this._particleShader.getUniformLocation("modelTransform");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, _model);
            //*********************************************************
            //Update particle color uniform ****************************
            location = this._particleShader.getUniformLocation("particleColor");
            if (location !== -1)
                gl_12.gl.uniform4f(location, 1.0, 1.0, 1.0, 1.0);
            //************************************************************
            //Update angle variable
            location = this._particleShader.getUniformLocation("angle");
            if (location !== -1)
                gl_12.gl.uniform1f(location, this._frameCount % 360);
            //********************************************************************
            //Update flickering variable
            location = this._particleShader.getUniformLocation("isFlickering");
            if (location !== -1)
                gl_12.gl.uniform1f(location, 0.0);
            //********************************************************************
            //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
            let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
            location = this._particleShader.getUniformLocation("lightDirection");
            if (location !== -1)
                gl_12.gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
            //*******************************************************************************
            // //Update uniform variable (camera position) in shader
            location = this._particleShader.getUniformLocation("cameraPosition");
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            if (location != -1)
                gl_12.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //*********************************************************************************
            // Apply default material property
            this._particleShader.applyMaterial(this._defaultParticleMaterial);
            this._particleShader.unbind();
            //**********************************************
        }
        _applyTextShaderSettings() {
            //******************* Text-shader setup
            this._textShader = new Shader_3.Shader();
            let vertTextShader = "#version 300 es\n\
                            layout(location=0) in vec3 vertexPosition;\n\
                            layout(location=1) in vec3 vertexNormal;\n\
                            layout(location=2) in vec2 texCoord;\n\
                            out highp vec3 normal;\n\
                            out highp vec4 vPosition;\n\
                            uniform mat4 projectionView;\n\
                            uniform mat4 modelTransform;\n\
                            void main(){\n\
                                vPosition = modelTransform * vec4(vertexPosition, 1.0);\n\
                            	normal = normalize(vec3(modelTransform * vec4(vertexNormal, 0.0)));\n\
                            	gl_Position = projectionView * vPosition;\n\
                            }";
            let fragTextShader = "#version 300 es\n\
                            precision highp float;\n\
                            precision highp int;\n\
                            in highp vec3 normal;\n\
                            in highp vec4 vPosition;\n\
                            out highp vec4 outputColor;\n\
                            uniform vec3 cameraPosition;\n\
                            uniform vec3 vDiffuse;\n\
                            uniform vec3 vSpecular;\n\
                            uniform float vSpecularExponent;\n\
                            uniform vec3 lightDirection;\n\
                            void main(){\n\
                                vec3 viewDir = normalize(cameraPosition - vPosition.xyz); \n\
                            	vec3 sunDir = normalize(lightDirection);\n\
                            	vec3 reflectionVector =  normalize(2.0 * dot(normal, -sunDir) * normal + sunDir);\n\
                            	float brightness = clamp(dot(normal, -sunDir), 0.0, 1.0);\n\
                            	vec3 modifiedDiffuseColor = vSpecular;\n\
                            	vec3 specularComponent = clamp(vSpecular * pow(dot(reflectionVector, viewDir), vSpecularExponent), 0.0, 1.0);\n\
                            	vec3 color = clamp(modifiedDiffuseColor + specularComponent, 0.0, 1.0);\n\
                            	outputColor = vec4(color * brightness, 1.0);\n\
                            }";
            this._textShader.compile(vertTextShader, fragTextShader);
            let final_mat = glm.mat4.create();
            glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
            let _model = glm.mat4.create();
            this._textShader.bind();
            //Update uniform variable (projection matrix) in shader
            let location = this._textShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, final_mat);
            //**********************************************************
            //Update uniform variable (modelView matrix) in shader
            location = this._textShader.getUniformLocation("modelTransform");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, _model);
            //*********************************************************
            //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
            let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
            location = this._textShader.getUniformLocation("lightDirection");
            if (location !== -1)
                gl_12.gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
            //*******************************************************************************
            // //Update uniform variable (camera position) in shader
            location = this._textShader.getUniformLocation("cameraPosition");
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            if (location != -1)
                gl_12.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //*********************************************************************************
            //Update uniform variable (vDiffuse) in shader
            location = this._textShader.getUniformLocation("vDiffuse");
            if (location != -1)
                gl_12.gl.uniform3f(location, 0.8, 0, 0.002118);
            //***************************************************
            //Update uniform variable (vSpecular) in shader
            location = this._textShader.getUniformLocation("vSpecular");
            if (location != -1)
                gl_12.gl.uniform3f(location, 1.0, 1.0, 1.0);
            //********************************************************
            //Update uniform variable (vSpecularExponent) in shader
            location = this._textShader.getUniformLocation("vSpecularExponent");
            if (location != -1)
                gl_12.gl.uniform1f(location, 233.333333);
            this._textShader.unbind();
            //********************************************************************
        }
        _bindGameEngineWithHTML() {
            $(window).resize(this, eventObject => { eventObject.data.resize(); });
            $(`#${this._configuration.NumberOfPlayersSelectorID}`).on('change', this._onPlayerSelection.bind(this));
            $(`#${this._configuration.MainmenuButtonID}`).on('click', this._onButtonMainMenu.bind(this));
            $(`#${this._configuration.ColorSequenceMenuID}`).on('click', this._onButtonColSeq.bind(this));
            $(this._canvas).on('click', (event => { this._onMouseClickOnCanvas(event.offsetX, event.offsetY); }).bind(this));
            $(this._canvas).on('mousedown', (event => { this._onMouseDown(event.offsetX, event.offsetY); }).bind(this));
            $(this._canvas).on('mousemove', (event => { this._onMouseDragging(event.offsetX, event.offsetY); }).bind(this));
            $(window).on('mouseup', (event => { this._onMouseUp(event.offsetX, event.offsetY); }).bind(this));
            $(`#${this._configuration.RequestGameButtonID}`).on('click', this._onButtonSearchGame.bind(this));
            $(`#${this._configuration.CancelRequestGameButtonID}`).on('click', this._onButtonCancelSearch.bind(this));
            $(`#${this._configuration.HtmlMenuButtonID}`).on('click', this._onMenuButtonClick.bind(this));
        }
        _getGlCompatibleCoordinate(radius, latitudeDegree, longitudeDegree) { return glm.vec3.fromValues(radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))); }
        ;
        _getMyGamePositionFromChannel() {
            if (!(this._currentPusherChannel && this._currentPusherChannel.subscribed))
                return -1;
            let position = 1;
            let mySubscriptionTime = Number(this._currentPusherChannel.members.me.info.subscription_time);
            if (mySubscriptionTime === Number.NaN || mySubscriptionTime === undefined)
                return -1;
            this._currentPusherChannel.members.each(member => {
                let otherTime = Number(member.info.subscription_time);
                if (otherTime === Number.NaN || otherTime === undefined)
                    return -1;
                if (otherTime < mySubscriptionTime)
                    position++;
            });
            return position;
        }
        _initDefaultVariables() {
            this._defaultView = glm.mat4.create();
            this._defaultProj = glm.mat4.create();
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
            if (this._sampleSphere == null)
                this._sampleSphere = new Sphere_3.Sphere();
            this._sampleSphere.init(0, 0, 0, 1, 50, 50);
            if (!this._defaultParticleMaterial.name) {
                this._defaultParticleMaterial.name = "Plastic";
                this._defaultParticleMaterial.ambient = [1.0, 1.0, 1.0];
                this._defaultParticleMaterial.diffuse = [0.80, 0, 0.002118];
                this._defaultParticleMaterial.specular = [1.0, 1.0, 1.0];
                this._defaultParticleMaterial.specularExponent = 233.3333333;
            }
            //********************************** Brownian particle-data setup
            this._particleData = [];
            for (let i = 0; i < this._mNumParticles; i++) {
                let x = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let y = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let z = -this._boundingBox + 2 * this._boundingBox * Math.random();
                let r = Math.random();
                let g = Math.random();
                let b = Math.random();
                let particle = {};
                particle.position = [x, y, z];
                particle.color = [r, g, b];
                particle.isFlickering = Math.random() > 0.65 ? true : false;
                this._particleData.push(particle);
            }
        }
        _onButtonCancelSearch() {
            if (!this._pusherClient)
                return;
            if (this._gameData.isGameRunning || !(this._gameData.isWaitingForGame)) {
                alert("You cannot cancel a non-existent game search.");
                return;
            }
            $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
            let tokenValue = null;
            if (this._configuration.PageTokenID)
                tokenValue = $(`#${this._configuration.PageTokenID}`).val();
            if (!tokenValue)
                tokenValue = '';
            $.ajax({
                method: 'POST',
                url: this._configuration.ServerEndpoint,
                timeout: 10000,
                data: {
                    token: tokenValue,
                    command: this._configuration.CommandForCancellingGameSearch,
                    channel: this._gameData.channel,
                    rows: this._gameData.rows,
                    columns: this._gameData.columns,
                    totalPlayers: this._gameData.totalPlayers
                },
                success: (function (response) {
                    if (response.success) {
                        this._currentPusherChannel.unbind_all();
                        this._currentPusherChannel = null;
                        this._pusherClient.unsubscribe(this._gameData.channel);
                        this._toggleStateOfGameControls(true);
                        let serverSideGameData = response.game_state;
                        Object.assign(this._gameData, serverSideGameData);
                        this._gameData.onlinePosition = null;
                        $(`#${this._configuration.ServerMessageFieldID}`).html("");
                        $(`#${this._configuration.ServerMessageFieldID}`).css('display', 'none');
                    }
                    else {
                        alert(`Server denied request for cancelling search. Reason: ${response.reason}`);
                        $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                        this._onRequestResetGameState();
                    }
                }).bind(this),
                error: (function (jsXHR, textStatus, errorThrown) {
                    alert('Error occurred while cancelling game search. See console for details.');
                    $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                    this._onRequestResetGameState();
                    console.error(errorThrown);
                }).bind(this)
            });
        }
        _onButtonColSeq() {
            let allPlayers = this._game.getPlayerList();
            let colorSequence = "Current order of players:\n";
            allPlayers.forEach((player, index) => {
                if (!this._game.isEliminated(player))
                    colorSequence += `Player ${index + 1}: ${player}\n`;
            });
            alert(colorSequence);
        }
        _onButtonMainMenu() {
            if (this._game.hasEnded) {
                if (this._game.haveIWon)
                    this._onQuitCurrentGame(true);
                else
                    this._onQuitCurrentGame(false);
                return;
            }
            let result = window.confirm("Current game will be lost. Continue?");
            if (!result)
                return;
            if (this._game.isWatching || this._game.haveIWon === false)
                this._onQuitCurrentGame(false);
            else
                this._onQuitCurrentGame(true);
        }
        _onButtonSearchGame() {
            if (!this._pusherClient)
                return;
            if (this._gameData.isGameRunning || this._gameData.isWaitingForGame) {
                alert("You cannot request a new game while a game is running or has been already requested.");
                return;
            }
            let numberOfColumnsString = $(`#${this._configuration.NumberOfColumnSelectorID}`).val();
            let numberOfRowsString = $(`#${this._configuration.NumberOfRowSelectorID}`).val();
            let numberOfPlayersString = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
            if (Number(numberOfPlayersString) == NaN || Number(numberOfPlayersString) < 2)
                return;
            let numberOfPlayers = Number(numberOfPlayersString);
            if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
                alert("Invalid number of players.");
                throw new Error("Invalid number of players.");
            }
            let numberOfColumns = Number(numberOfColumnsString);
            let numberOfRows = Number(numberOfRowsString);
            if (numberOfRows === Number.NaN) {
                alert("Invalid number of rows.");
                throw new Error("Invalid number of rows.");
            }
            if (numberOfColumns === Number.NaN) {
                alert("Invalid number of columns.");
                throw new Error("Invalid number of columns.");
            }
            //numberOfPlayers = 2; //For the moment, support only for 2 players
            let playerList = [];
            for (let i = 0; i < numberOfPlayers; i++) {
                let playerColor = $(`#${this._configuration.ListOfColorSelectorID[i]}`).val();
                playerList.push(playerColor);
            }
            let playerSet = new Set(playerList);
            if (playerSet.size !== playerList.length) {
                alert("Same colors are not allowed for multiple players!");
                return;
            }
            $(`#${this._configuration.BoardDimLabelID}`).html(`BOARD:&nbsp; ${numberOfRows} &nbsp; x &nbsp; ${numberOfColumns}`);
            $(`#${this._configuration.NumberOfPlayersLabelID}`).html(`Players:&nbsp; ${numberOfPlayersString}`);
            this._toggleStateOfGameControls(false);
            this._updateServerMessage("Request sent. Waiting for response...");
            let tokenValue = null;
            if (this._configuration.PageTokenID)
                tokenValue = $(`#${this._configuration.PageTokenID}`).val();
            if (!tokenValue)
                tokenValue = '';
            $.ajax({
                type: "POST",
                url: this._configuration.ServerEndpoint,
                timeout: 10000,
                data: {
                    token: tokenValue,
                    command: this._configuration.CommandForSearchingGame,
                    players: numberOfPlayers,
                    rows: numberOfRows,
                    columns: numberOfColumns
                },
                success: (function (response) {
                    if (response.success == true) {
                        let serverSideGameData = response.game_state;
                        Object.assign(this._gameData, serverSideGameData);
                        this._onSuccessfulGameRequest();
                    }
                    else {
                        this._toggleStateOfGameControls(true);
                        this._updateServerMessage("");
                        this._onRequestResetGameState();
                        alert(`Server rejected the game request. Reason: ${response.reason}. Logout and login again to see if the issue persists.`);
                    }
                }).bind(this),
                error: (function (jqXHR, textStatus, errorThrown) {
                    this._toggleStateOfGameControls(true);
                    this._updateServerMessage("");
                    this._onRequestResetGameState();
                    alert("Game request failed. See console for details.");
                    console.error(errorThrown);
                }).bind(this)
            });
        }
        _onIncomingInputRequest(data) {
            if (this._listOfProcessedInputs.has(data.inputNumber)) {
                let boardInput = this._listOfProcessedInputs.get(data.inputNumber);
                let eventTriggered = this._currentPusherChannel.trigger(`client-${this._eventNameForBroadcastingInputs}`, boardInput);
            }
        }
        _onIncomingRemoteInput(receivedBoardInput) {
            if (this._gameData.isGameRunning && this._gameData.isWaitingForMove) {
                receivedBoardInput.isItALocalMove = false;
                let qElement = { element: receivedBoardInput, priority: receivedBoardInput.inputNumber };
                this._listOfPendingInputs.enqueue(qElement);
            }
        }
        _onlineGameLoop(deltaTime) {
            if (this._game.hasEnded) {
                let angle = -60 * Math.cos(0.015 * this._frameCount % 360);
                let text = "";
                if (this._game.haveIWon)
                    text = "YOU HAVE WON\nCONGRATULATION";
                else if (this._game.isWatching)
                    text = "GAME HAS ENDED\n BETTER LUCK NEXT TIME";
                else
                    text = "YOU HAVE LOST\n BETTER LUCK NEXT TIME";
                gl_12.gl.clear(gl_12.gl.COLOR_BUFFER_BIT | gl_12.gl.DEPTH_BUFFER_BIT);
                this._textShader.bind();
                this._textShader.applyMaterial(this._winningMaterial);
                let location = this._textShader.getUniformLocation("modelTransform");
                if (location != -1)
                    this._textObject.drawLine(this._textShader, location, text, glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, angle, 0), "center", "center", false);
                this._textShader.unbind();
                return;
            }
            let isInputProcessedByGame = this._onReceivedBoardInput();
            this._game.drawBoard(deltaTime);
            if (isInputProcessedByGame)
                this._onUpdateGameStateAfterInput(this._processedBoardInput);
            let timeSinceLastInput = this._beginFrame - this._lastInputProcessingTime;
            if (timeSinceLastInput > 60000 && this._gameData.isWaitingForMove) { // If more than 1 minute have passed since the last input, ping the other player.
                this._lastInputProcessingTime = this._beginFrame;
                let eventTriggered = this._currentPusherChannel.trigger(`client-${this._eventNameForRequestingInputs}`, { inputNumber: this._processedBoardInput ? this._processedBoardInput.inputNumber + 1 : 1 });
            }
        }
        _onMenuButtonClick() {
            if ($(`#${this._configuration.VerticalMenubarID}`).attr("data-state") == "0") {
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "1");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
                $(`#${this._configuration.VerticalMenubarID}`).slideDown(300);
                $(`#${this._configuration.BlockViewDivisionID}`).slideDown(300);
            }
            else {
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "0");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9660;");
                $(`#${this._configuration.VerticalMenubarID}`).slideUp(300);
                $(`#${this._configuration.BlockViewDivisionID}`).slideUp(300);
            }
        }
        _onMouseClickOnCanvas(posX, posY) {
            if (!this.isEngineRunning)
                return;
            if (this._gameData.isWaitingForMove || !this._isBoardInputProcessedByEngine)
                return;
            if (this._game.isBlastAnimationRunning)
                return; //don't process input while a blast animation is running.
            if ((this._gameData.isGameRunning && (this._listOfPendingInputs.isEmpty))) {
                let boardInput = this._game.getBoardCoordinates(posX, posY);
                if ((boardInput[0] < 0) || (boardInput[1] < 0))
                    return;
                let inputData = { boardCoordinate: { x: -1, y: -1 }, onlinePosition: 0 };
                inputData.boardCoordinate.x = boardInput[0];
                inputData.boardCoordinate.y = boardInput[1];
                inputData.onlinePosition = this._gameData.onlinePosition;
                inputData.inputNumber = this._listOfProcessedInputs.size + 1;
                inputData.isItALocalMove = true;
                let qElement = { element: inputData, priority: inputData.inputNumber };
                this._listOfPendingInputs.enqueue(qElement);
            }
        }
        _onMouseDown(posX, posY) {
            if (!this.isEngineRunning)
                return;
            this._mouseDown = true;
            this._isDragging = false;
            this._currentMouseX = posX;
            this._currentMouseY = posY;
        }
        _onMouseDragging(posX, posY) {
            if (!this.isEngineRunning)
                return;
            let delta_x = posX - this._currentMouseX;
            let delta_y = posY - this._currentMouseY;
            this._currentMouseX = posX;
            this._currentMouseY = posY;
            this._isDragging = true;
            if (this._isDragging && this._mouseDown) {
                let delta_t = (this._beginFrame - this._endFrame);
                if (delta_x * delta_x + delta_y * delta_y < 10) {
                    if (!(this._gameData === null || this._gameData.isGameRunning)) {
                        this._cameraLatitude += delta_t * this._cameraRotationSpeed * delta_y / 1000.0;
                        this._cameraLongitude += delta_t * this._cameraRotationSpeed * delta_x / 1000.0;
                        this._updateCameraView();
                    }
                }
            }
        }
        _onMouseUp(posX, posY) {
            if (!this.isEngineRunning)
                return;
            this._currentMouseX = posX;
            this._currentMouseY = posY;
            this._mouseDown = false;
            this._isDragging = false;
        }
        _onOtherPlayerJoining(playerData) {
            if (this._gameData.isWaitingForGame) {
                let numberOfSubscribedPlayers = this._currentPusherChannel.members.count;
                let remainingNumberOfPlayers = this._gameData.totalPlayers - numberOfSubscribedPlayers;
                if (remainingNumberOfPlayers == 0) {
                    $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                    this._onRequestGameStart();
                }
                else {
                    let playerWord = remainingNumberOfPlayers === 1 ? "player" : "players";
                    this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                    $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                }
            }
        }
        _onOtherPlayerLeaving(playerData) {
            if (this._gameData.isGameRunning) {
                if (this._game.isBlastAnimationRunning) {
                    setTimeout(this._onOtherPlayerLeaving.bind(this), 100, playerData);
                    return;
                }
                if (this._game.hasEnded)
                    return;
                let otherPosition = this._getMyGamePositionFromChannel();
                if (otherPosition < 0) {
                    alert(`A player has left the game unfinished. Game has ended.`);
                    this._onQuitCurrentGame(true);
                }
                let otherPlayerColor = this._game.getColorOfPlayer(otherPosition);
                if (otherPlayerColor.length > 0) {
                    let isOtherEliminated = this._game.isEliminated(otherPlayerColor);
                    if (!isOtherEliminated) {
                        alert(`Player ${otherPosition} (${otherPlayerColor}) has left the game unfinished. Game has ended.`);
                        this._onQuitCurrentGame(true);
                    }
                }
            }
            else {
                if (this._gameData.isWaitingForGame) {
                    let numberOfSubscribedPlayers = this._currentPusherChannel.members.count;
                    let remainingNumberOfPlayers = this._gameData.totalPlayers - numberOfSubscribedPlayers;
                    let playerWord = remainingNumberOfPlayers === 1 ? "player" : "players";
                    this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                    //$(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                }
                else
                    this._onRequestResetGameState();
            }
        }
        _onPlayerSelection() {
            if (!this.isEngineRunning)
                return;
            let numberOfPlayersString = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
            let numberOfPlayers = Number(numberOfPlayersString);
            if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
                alert("Invalid number of players.");
                throw new Error("Invalid number of players.");
            }
            for (let i = 0; i < this._configuration.ListOfColorSelectorID.length; i++) {
                let id = `#${this._configuration.ListOfColorSelectorID[i]}`;
                let parentID = null;
                if (this._configuration.ListOfColorSelectorParentID)
                    parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`;
                if (i < numberOfPlayers) {
                    $(id).removeAttr('disabled');
                    $(id).css('visibility', 'visible');
                    if (parentID) {
                        $(parentID).removeAttr('disabled');
                        let displayStyle = $(parentID).attr('data-display');
                        if (displayStyle !== undefined)
                            $(parentID).css('display', displayStyle);
                        else
                            $(parentID).css('display', 'block');
                    }
                }
                else {
                    $(id).attr('disabled', 1);
                    $(id).css('visibility', 'hidden');
                    if (parentID) {
                        $(parentID).attr('disabled', 1);
                        $(parentID).css('display', 'none');
                    }
                }
            }
        }
        _onQuitCurrentGame(updateChannel) {
            if (!this.isEngineRunning)
                return;
            this._gameData.isGameRunning = false;
            this._showGamePanel(false);
            this._applyDefaultCanvasSetting();
            this._game.resetGameVariables();
            if (updateChannel === true)
                this._onRequestResetGameState(true);
            else
                this._onRequestResetGameState(false);
        }
        _onReceivedBoardInput() {
            let isInputProcessedByGame = false;
            //Very important!! if blast animation is running, don't process player's input yet!
            if (!this._listOfPendingInputs.isEmpty && this._isBoardInputProcessedByEngine) {
                let qElement = this._listOfPendingInputs.dequeue();
                let boardInput = qElement.element;
                if (this._listOfProcessedInputs.has(boardInput.inputNumber))
                    return false;
                if (boardInput.inputNumber != this._listOfProcessedInputs.size + 1) {
                    this._listOfPendingInputs.enqueue(qElement); //If an input with number higher than (totalReceivedInputs + 1) has arrived, wait for the other missing inputs to arrive
                    return false;
                }
                isInputProcessedByGame = this._game.processPlayerInput(boardInput.boardCoordinate.x, boardInput.boardCoordinate.y);
                if (isInputProcessedByGame) {
                    this._listOfProcessedInputs.set(boardInput.inputNumber, boardInput);
                    this._processedBoardInput = boardInput;
                    this._lastInputProcessingTime = this._beginFrame;
                    this._isBoardInputProcessedByEngine = false;
                }
            }
            return isInputProcessedByGame;
        }
        _onRequestGameStart() {
            if (!this.isEngineRunning)
                return;
            let myPosition = this._getMyGamePositionFromChannel();
            if (myPosition < 0) {
                alert(`Could not start the game. Reason: server assigned invalid user id for a channel member.`);
                this._onRequestResetGameState(true);
                return;
            }
            this._gameData.onlinePosition = myPosition;
            this._updateServerMessage(`Requesting server to start the game...`);
            let tokenValue = null;
            if (this._configuration.PageTokenID)
                tokenValue = $(`#${this._configuration.PageTokenID}`).val();
            if (!tokenValue)
                tokenValue = '';
            $.ajax({
                method: 'POST',
                url: this._configuration.ServerEndpoint,
                timeout: 10000,
                data: {
                    token: tokenValue,
                    command: this._configuration.CommandForStartingGame,
                    channel: this._gameData.channel,
                    rows: this._gameData.rows,
                    columns: this._gameData.columns,
                    onlinePosition: this._gameData.onlinePosition,
                    totalPlayers: this._gameData.totalPlayers
                },
                success: (response => {
                    if (response.success) {
                        this._updateServerMessage("Starting game...");
                        let serverGameState = response.game_state;
                        Object.keys(this._gameData).forEach(key => {
                            if (key !== 'isGameRunning')
                                this._gameData[key] = serverGameState[key];
                        });
                        this._prepareEngineToStartGame();
                        this._currentPusherChannel.bind(this._eventNameForStartingGame, this._triggerGameStartOnEngine.bind(this));
                        if (this._gameData.onlinePosition == 1) {
                            this._currentPusherChannel.bind(`client-${this._eventNameForSendingBeacon}`, this._triggerGameStartOnServer.bind(this));
                            this._isAjaxRequestSentToTriggerGame = false;
                            this._isReadyToStartNewGame = true;
                        }
                        else {
                            this._isReadyToStartNewGame = true;
                            this._startSendingBeaconToPlayerOne();
                        }
                    }
                    else {
                        this._updateServerMessage("Server rejected the request to start the game.");
                        alert(`Server rejected the request to start the game. Reason: ${response.reason}`);
                        this._onRequestResetGameState(true);
                    }
                }).bind(this),
                error: (jqXHR, textStatus, errorThrown) => {
                    this._updateServerMessage("Request to start the game failed. See console for details.");
                    this._onRequestResetGameState(true);
                    alert("Request to start the game failed. See console for details.");
                    console.error(errorThrown);
                }
            });
        }
        _onRequestResetGameState(updateChannelInServer) {
            if (!this.isEngineRunning)
                return;
            this._isReadyToStartNewGame = false;
            let tokenValue = null;
            if (this._configuration.PageTokenID)
                tokenValue = $(`#${this._configuration.PageTokenID}`).val();
            if (!tokenValue)
                tokenValue = '';
            let ajaxData = { token: tokenValue, command: this._configuration.CommandForResettingGameState };
            if (updateChannelInServer === true)
                ajaxData.updateChannel = true;
            $.ajax({
                method: 'POST',
                url: this._configuration.ServerEndpoint,
                timeout: 10000,
                data: ajaxData,
                success: (response => {
                    if (response.success) {
                        let serverGameState = response.game_state;
                        Object.assign(this._gameData, serverGameState);
                        this._toggleStateOfGameControls(true);
                        this._updateServerMessage("");
                        $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                    }
                    else {
                        alert(`Server denied resetting your game state. Reason: ${response.reason}.`);
                    }
                }).bind(this),
                complete: (() => {
                    if (this._currentPusherChannel) {
                        this._currentPusherChannel.unbind_all();
                        this._pusherClient.unsubscribe(this._currentPusherChannel.name);
                        this._currentPusherChannel = null;
                        this._gameData.channel = null;
                    }
                }).bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Failed to reset game state on the server. See console for details.");
                    console.error(errorThrown);
                }
            });
        }
        _onSuccessfulGameRequest() {
            if (!this.isEngineRunning)
                return;
            let channel_name = this._gameData.channel;
            if (this._currentPusherChannel) {
                this._currentPusherChannel.unbind_all();
                this._pusherClient.unsubscribe(this._currentPusherChannel.name);
                this._currentPusherChannel = null;
            }
            this._currentPusherChannel = this._pusherClient.subscribe(channel_name);
            this._currentPusherChannel.bind('pusher:subscription_error', status => {
                alert(`Could not subscribe to channel ${channel_name}. See console log for details.`);
                $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                throw new Error(`Error occurred while subscribing to channel ${channel_name}: ${status.error}. Status code: ${status.status}`);
            });
            this._currentPusherChannel.bind('pusher:subscription_succeeded', status => {
                let numberOfSubscribedPlayers = this._currentPusherChannel.members.count;
                let remainingNumberOfPlayers = this._gameData.totalPlayers - numberOfSubscribedPlayers;
                if (remainingNumberOfPlayers == 0)
                    this._onRequestGameStart();
                else {
                    let playerWord = remainingNumberOfPlayers === 1 ? "player" : "players";
                    this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                    $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
                }
            });
            this._currentPusherChannel.bind('pusher:member_added', this._onOtherPlayerJoining.bind(this));
            this._currentPusherChannel.bind('pusher:member_removed', this._onOtherPlayerLeaving.bind(this));
        }
        _onUpdateGameStateAfterInput(boardInput) {
            if (!this.isEngineRunning)
                return;
            //If this is called while a blast animation is running, -1 is returned. A new call must be placed after all the explosives are removed from the board.
            let isItMyTurnNow = this._game.isItMyTurn();
            if (this._game.isBlastAnimationRunning || isItMyTurnNow < 0) {
                setTimeout(this._onUpdateGameStateAfterInput.bind(this), 50, boardInput, 0); //Very important!! Make process input only when all bombs are removed from the board.
                return;
            }
            if (!this._isBoardInputProcessedByEngine) {
                this._isBoardInputProcessedByEngine = true;
                this._gameData.isWaitingForMove = isItMyTurnNow ? false : true;
                if (boardInput.isItALocalMove) {
                    let eventTriggered = this._currentPusherChannel.trigger(`client-${this._eventNameForBroadcastingInputs}`, boardInput);
                    if (!eventTriggered) {
                        alert("Could not pass your move to the other players. Please retry.");
                        this._game.undo();
                        this._gameData.isWaitingForMove = false;
                        this._listOfProcessedInputs.delete(boardInput.inputNumber);
                    }
                }
            }
        }
        _prepareEngineToStartGame() {
            if (!this.isEngineRunning)
                return;
            if (this._listOfPendingInputs)
                this._listOfPendingInputs.clear();
            if (this._listOfProcessedInputs)
                this._listOfProcessedInputs.clear();
            this._listOfConfirmedPlayers = new Map();
            this._currentPusherChannel.bind(`client-${this._eventNameForBroadcastingInputs}`, this._onIncomingRemoteInput.bind(this));
            this._currentPusherChannel.bind(`client-${this._eventNameForRequestingInputs}`, this._onIncomingInputRequest.bind(this));
            let playerList = [];
            for (let i = 0; i < this._gameData.totalPlayers; i++) {
                let playerColor = $(`#${this._configuration.ListOfColorSelectorID[i]}`).val();
                playerList.push(playerColor);
            }
            let playerSet = new Set(playerList);
            if (playerSet.size !== playerList.length) {
                alert("Same colors are not allowed for multiple players!");
                this._onQuitCurrentGame(true);
                return;
            }
            $(`#${this._configuration.BoardDimLabelID}`).html(`BOARD:&nbsp;${this._gameData.rows}&nbsp; x &nbsp;${this._gameData.columns}`);
            $(`#${this._configuration.NumberOfPlayersLabelID}`).html(`Players:&nbsp;${this._gameData.totalPlayers}`);
            $(`#${this._configuration.PositionLabelID}`).html(`${this._gameData.onlinePosition}`);
            $(`#${this._configuration.PositionMobileLabelID}`).html(`${this._gameData.onlinePosition}`);
            let playerColor = playerList[this._gameData.onlinePosition - 1].toLowerCase();
            let colorVal = offlineMaingame_2.colorList.get(playerColor);
            let colorR = Math.round(255 * colorVal[0]);
            let colorG = Math.round(255 * colorVal[1]);
            let colorB = Math.round(255 * colorVal[2]);
            $(`#${this._configuration.PositionLabelID}`).css('background', `rgb(${colorR}, ${colorG}, ${colorB})`);
            $(`#${this._configuration.PositionMobileLabelID}`).css('background', `rgb(${colorR}, ${colorG}, ${colorB})`);
            this._game.resetGameVariables();
            this._game.setAttribute(this._gameData.rows, this._gameData.columns, playerList, this._gameData.onlinePosition);
            this._game.setCanvasSize(this._canvas.width, this._canvas.height);
            this._game.updateTurn();
            this._processedBoardInput = null;
            this._lastInputProcessingTime = this._endFrame;
            let myColorName = this._game.getColorOfPlayer(this._gameData.onlinePosition);
            let myColor = offlineMaingame_2.colorList.get(myColorName);
            this._winningMaterial = {};
            this._winningMaterial.name = myColorName;
            this._winningMaterial.diffuse = myColor;
            this._winningMaterial.specularExponent = 5;
            this._winningMaterial.specular = myColor;
            this._isBoardInputProcessedByEngine = true;
        }
        _renderDefaultScene(deltaTime) {
            if (!this.isEngineRunning)
                return;
            gl_12.gl.clear(gl_12.gl.COLOR_BUFFER_BIT | gl_12.gl.DEPTH_BUFFER_BIT);
            let angle = -60 * Math.cos(0.015 * this._frameCount % 360);
            this._textShader.bind();
            let location = this._textShader.getUniformLocation("modelTransform");
            if (location != -1)
                this._textObject.drawLine(this._textShader, location, "WELCOME TO THE WORLD\nOF\nCHAIN REACTION", glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, angle, 0), "center", "center");
            this._textShader.unbind();
            this._particleShader.bind();
            location = this._particleShader.getUniformLocation("angle");
            if (location != -1)
                gl_12.gl.uniform1f(location, angle);
            this._particleShader.unbind();
            this._updateBrownianParticleMotion();
        }
        _startSendingBeaconToPlayerOne() {
            if (!this._gameData.isGameRunning && this._isReadyToStartNewGame) {
                this._currentPusherChannel.trigger(`client-${this._eventNameForSendingBeacon}`, { onlinePosition: this._gameData.onlinePosition });
                setTimeout(this._startSendingBeaconToPlayerOne.bind(this), 600);
            }
        }
        _showGamePanel(show) {
            if (show) {
                $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", "none");
                let idList = [this._configuration.InsideMenuDivisionID];
                this._configuration.ListOfHorizontalPanelID.forEach(id => { idList.push(id); });
                for (let id of idList) {
                    let displayStyle = $(id).attr('data-display');
                    if (displayStyle !== undefined)
                        $(id).css("display", displayStyle);
                    else
                        $(`#${id}`).css("display", 'block');
                }
            }
            else {
                $(`#${this._configuration.InsideMenuDivisionID}`).css("display", "none");
                let displayStyle = $(`#${this._configuration.OutsideMenuDivisionID}`).attr('data-display');
                if (displayStyle !== undefined)
                    $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", displayStyle);
                else
                    $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", 'block');
                for (let id of this._configuration.ListOfHorizontalPanelID)
                    $(`#${id}`).css("display", "none");
            }
        }
        _startMainLoop() {
            if (!this.isEngineRunning)
                return;
            this._frameCount++;
            let deltaTime = Math.abs(this._beginFrame - this._endFrame);
            this._endFrame = this._beginFrame;
            this._beginFrame = new Date().getTime();
            if (this._configuration.FrameCounterID) {
                $(`#${this._configuration.FrameCounterID}`).html("Frame: " + this._frameCount.toString());
            }
            if (this._gameData.isGameRunning)
                this._onlineGameLoop(deltaTime);
            else
                this._renderDefaultScene(deltaTime);
            requestAnimationFrame(this._startMainLoop.bind(this));
        }
        _toggleStateOfGameControls(enable) {
            let listOfAllGameControlIDs = [
                this._configuration.NumberOfRowSelectorID,
                this._configuration.NumberOfColumnSelectorID,
                this._configuration.NumberOfPlayersSelectorID,
                this._configuration.RequestGameButtonID
            ];
            this._configuration.ListOfColorSelectorID.forEach(id => { listOfAllGameControlIDs.push(id); });
            if (enable)
                listOfAllGameControlIDs.forEach(id => { $(`#${id}`).removeAttr('disabled'); });
            else
                listOfAllGameControlIDs.forEach(id => { $(`#${id}`).attr('disabled', 1); });
        }
        _triggerGameStartOnEngine() {
            this._gameData.isGameRunning = true;
            this._isReadyToStartNewGame = false;
            this._showGamePanel(true);
            this._currentPusherChannel.unbind(this._eventNameForStartingGame);
        }
        _triggerGameStartOnServer(onlinePositionOfOther) {
            if (!this._listOfConfirmedPlayers.has(onlinePositionOfOther))
                this._listOfConfirmedPlayers.set(onlinePositionOfOther, true);
            if (this._listOfConfirmedPlayers.size < this._gameData.totalPlayers)
                return;
            if (this._isAjaxRequestSentToTriggerGame)
                return;
            let tokenValue = null;
            if (this._configuration.PageTokenID)
                tokenValue = $(`#${this._configuration.PageTokenID}`).val();
            if (!tokenValue)
                tokenValue = '';
            $.ajax({
                url: this._configuration.ServerEndpoint,
                method: 'POST',
                timeout: 10000,
                data: {
                    token: tokenValue,
                    command: this._configuration.CommandForStartingGame,
                    eventName: this._eventNameForStartingGame,
                    channel: this._gameData.channel,
                    rows: this._gameData.rows,
                    columns: this._gameData.columns,
                    onlinePosition: this._gameData.onlinePosition,
                    totalPlayers: this._gameData.totalPlayers
                },
                success: (response => {
                    if (response.success) {
                        this._currentPusherChannel.unbind(`client-${this._eventNameForSendingBeacon}`);
                        this._updateServerMessage("");
                    }
                    else {
                        alert(`Server denied to trigger the start-game event. Reason: ${response.reason}`);
                        this._onRequestResetGameState();
                        this._isAjaxRequestSentToTriggerGame = false;
                    }
                }).bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Failed to trigger the start of the game on the server! See console for details.");
                    this._onRequestResetGameState();
                    this._isAjaxRequestToTriggerGameSent = false;
                    console.error(errorThrown);
                }
            });
            this._isAjaxRequestSentToTriggerGame = true;
        }
        _updateCanvasPerspective(width, height) {
            gl_12.gl.viewport(0, 0, width, height);
            this._defaultProj = glm.mat4.create();
            glm.mat4.perspective(this._defaultProj, Math.PI * 45.0 / 180.0, width / height, 1.0, 100.0);
        }
        _updateCameraView() {
            if (!this.isEngineRunning)
                return;
            let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
            glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
            let final_mat = glm.mat4.multiply(glm.mat4.create(), this._defaultProj, this._defaultView);
            this._textShader.bind();
            //******************************************** Update projection matrix
            let location = this._textShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, final_mat);
            //***********************************************************************
            //**********************************Update uniform variable (camera position) in shader
            location = this._textShader.getUniformLocation("cameraPosition");
            if (location != -1)
                gl_12.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //***************************************************************
            this._textShader.unbind();
            this._particleShader.bind();
            //******************************************** Update projection matrix
            location = this._particleShader.getUniformLocation("projectionView");
            if (location != -1)
                gl_12.gl.uniformMatrix4fv(location, false, final_mat);
            //*****************************************************************************
            //**********************************Update uniform variable (camera position) in shader
            location = this._particleShader.getUniformLocation("cameraPosition");
            if (location != -1)
                gl_12.gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
            //****************************************************************
            this._particleShader.unbind();
        }
        _updateBrownianParticleMotion() {
            if (!this.isEngineRunning)
                return;
            this._particleShader.bind();
            let modelTransformlocation = this._particleShader.getUniformLocation("modelTransform");
            let colorLocation = this._particleShader.getUniformLocation("particleColor");
            let flickeringLocation = this._particleShader.getUniformLocation("isFlickering");
            for (let i = 0; i < this._mNumParticles; i++) {
                let model = glm.mat4.create();
                glm.mat4.translate(model, model, this._particleData[i].position);
                if (modelTransformlocation !== -1)
                    gl_12.gl.uniformMatrix4fv(modelTransformlocation, false, model);
                if (flickeringLocation !== -1)
                    gl_12.gl.uniform1f(flickeringLocation, this._particleData[i].isFlickering ? 1.0 : 0.0);
                if (colorLocation != -1)
                    gl_12.gl.uniform4f(colorLocation, this._particleData[i].color[0], this._particleData[i].color[1], this._particleData[i].color[2], 1.0);
                this._sampleSphere.draw(1);
                let distance = glm.vec3.length(this._particleData[i].position);
                if (distance < this._boundingBox) {
                    this._particleData[i].position[0] += 0.2 * (-1 + 2 * Math.random());
                    this._particleData[i].position[1] += 0.2 * (-1 + 2 * Math.random());
                    this._particleData[i].position[2] += 0.2 * (-1 + 2 * Math.random());
                }
                else {
                    this._particleData[i].position[0] *= 0.9;
                    this._particleData[i].position[1] *= 0.9;
                    this._particleData[i].position[2] *= 0.9;
                }
            }
            this._particleShader.unbind();
        }
        _updateServerMessage(message) {
            if (message.length > 0) {
                $(`#${this._configuration.ServerMessageFieldID}`).html(`<p style='padding: 3px 7px; font-size: 12px;'>${message}</p>`);
                $(`#${this._configuration.ServerMessageFieldID}`).css('display', 'block');
            }
            else {
                $(`#${this._configuration.ServerMessageFieldID}`).html("");
                $(`#${this._configuration.ServerMessageFieldID}`).css('display', 'none');
            }
        }
        //*************************************************************************************************** */
        //************************************** Public method definitions *********************************/
        //************************************************************************************************* */
        configure(config) {
            if (this._configuration === null) { //If no configuration yet exists, copy everything
                this._configuration = Object.assign({}, config);
            }
            else {
                //Else update only those that are specified in config.
                Object.assign(this._configuration, config);
            }
        }
        destroy() {
            if (this._isDestroyed)
                return;
            if (this.isEngineRunning)
                this.stop();
            this._gameData = {
                isGameRunning: false,
                isWaitingForGame: false,
                isWaitingForMove: false,
                totalPlayers: null,
                onlinePosition: null,
                channel: null,
                rows: null,
                columns: null
            };
            gl_12.gl.useProgram(null);
            gl_12.gl.bindBuffer(gl_12.gl.ARRAY_BUFFER, null);
            gl_12.gl.bindBuffer(gl_12.gl.ELEMENT_ARRAY_BUFFER, null);
            gl_12.gl.bindVertexArray(null);
            this._sampleSphere.cleanUp();
            this._sampleSphere = null;
            this._textShader.cleanUp();
            this._textShader = null;
            this._particleShader.cleanUp();
            this._particleShader = null;
            this._particleData.length = 0;
            this._textObject.cleanUp();
            this._textObject = null;
            this._game.cleanUp();
            this._game = null;
            if (this._pusherClient)
                this._pusherClient.disconnect();
            this._pusherClient = null;
            this._isDestroyed = true;
        }
        isConfigured() {
            if (!this._configuration)
                return false;
            if (!this._configuration.AudioElementID)
                return false;
            if (!this._configuration.BoardDimLabelID)
                return false;
            if (!this._configuration.BlockViewDivisionID)
                return false;
            if (!this._configuration.CancelRequestGameButtonID)
                return false;
            //if (!this._configuration.CanvasViewBlockerID) return false; //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
            if (!this._configuration.CanvasElementID)
                return false;
            if (!this._configuration.CanvasParentID)
                return false;
            if (!this._configuration.ColorSequenceMenuID)
                return false;
            if (!this._configuration.CommandForCancellingGameSearch)
                return false; //The server command for cancelling an ongoing search for a game in the server.
            if (!this._configuration.CommandForResettingGameState)
                return false; //The server command for resetting game state to the default in the server.
            if (!this._configuration.CommandForSearchingGame)
                return false; //The server command for requesting a game from the server.
            if (!this._configuration.CommandForStartingGame)
                return false; //The server command for telling the server to start the game once a lobby is full.
            if (!this._configuration.CommandForUpdatingMove)
                return false; //The server command for updating player's turn-state (isWaitingForMove) in the server.
            if (!this._configuration.CommandForQuittingCurrentGame)
                return false; //The command for quitting an ongoing game play in the server.
            if (!this._configuration.CurrentPlayerLabelID)
                return false;
            if (!this._configuration.CurrentPlayerMobileLabelID)
                return false;
            //if (!this._configuration.DefaultMaterialForParticles) return false; //DefaultMaterialForParticles specification is optional for game engine
            //if (!this._configuration.DefaultNumberOfColumn) return false; //DefaultNumberOfColumn specification is optional for game engine
            //if (!this._configuration.DefaultNumberOfRow) return false; //DefaultNumberOfRow specification is optional for game engine
            //if (!this._configuration.FrameCounterID) return false; //FrameCounterID specification is optional for game engine
            if (!this._configuration.HtmlMenuButtonID)
                return false;
            if (!this._configuration.InsideMenuDivisionID)
                return false;
            if (!this._configuration.ListOfColorSelectorID)
                return false;
            if (this._configuration.ListOfColorSelectorParentID) { //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`. If provided, must have same number of ids as in `ListOfColorSelectorID`
                if (this._configuration.ListOfColorSelectorParentID.length != this._configuration.ListOfColorSelectorID.length)
                    return false;
            }
            if (!this._configuration.ListOfHorizontalPanelID)
                return false;
            if (!this._configuration.ListOfResourceNames)
                return false;
            if (!this._configuration.LogoutButtonID)
                return false; //ID of the logout button
            if (!this._configuration.LogoutPath)
                return false; //Path to the logout url
            //if (!this._configuration.LogoutButtonMobileID) return false; //ID of the logout button in mobile view(applicable to media with smaller screen size).
            if (!this._configuration.MainmenuButtonID)
                return false;
            //if (!this._configuration.MessageBoxID) return false; //MessageBoxID specification is optional.
            if (!this._configuration.NewGameButtonID)
                return false;
            //if (!this._configuration.NumberOfBrownianParticles) return false; //NumberOfBrownianParticles specification is optional.
            if (!this._configuration.NumberOfColumnSelectorID)
                return false;
            if (!this._configuration.NumberOfPlayersLabelID)
                return false;
            if (!this._configuration.NumberOfPlayersSelectorID)
                return false;
            if (!this._configuration.NumberOfRowSelectorID)
                return false;
            if (!this._configuration.OutsideMenuDivisionID)
                return false;
            //if (!this._configuration.PageTokenID) return false; //Optional, ID of the html element containing the authentication token of the page. This is needed if the html page requires authentication with the server before every request.
            if (!this._configuration.PathToResource)
                return false;
            if (!this._configuration.PositionLabelID)
                return false;
            if (!this._configuration.PositionMobileLabelID)
                return false;
            //if (!this._configuration.ProgressBarID) return false; //Optional, ID of the progress bar element.
            if (this._configuration.PusherSettings.app_key.length === 0)
                return false;
            if (!this._configuration.RequestGameButtonID)
                return false;
            if (!this._configuration.VerticalMenubarID)
                return false;
            return true;
        }
        start(alphabetMeshMap, materialLibraryData) {
            this._applyDefaultHTMLSettings();
            //Parse the matrial data
            this._currentMaterialLibrary = new OBJ.MaterialLibrary(materialLibraryData);
            let defaultMaterial = this._currentMaterialLibrary.materials[this._configuration.DefaultMaterialForParticles];
            if (defaultMaterial)
                Object.assign(this._defaultParticleMaterial, defaultMaterial);
            if (this._canvas == null)
                this._canvas = gl_12.glUtilities.intialize(this._configuration.CanvasParentID, this._configuration.VerticalMenubarID, this._configuration.CanvasElementID);
            if (this._game == null) {
                let gameConfig = {};
                gameConfig.AudioElementID = this._configuration.AudioElementID;
                gameConfig.CurrentPlayerLabelElementID = this._configuration.CurrentPlayerLabelID;
                gameConfig.CurrentPlayerLabelMobileElementID = this._configuration.CurrentPlayerMobileLabelID;
                this._game = new onlineMaingame_1.OnlineMainGame(gameConfig);
            }
            //Add the material data to each alphabet mesh and add them to alphabet list
            this._alphabetMeshData.clear();
            for (let meshName of Object.keys(alphabetMeshMap)) {
                alphabetMeshMap[meshName].addMaterialLibrary(this._currentMaterialLibrary);
                let meshData = new MeshContainer_2.MeshData(alphabetMeshMap[meshName]);
                this._alphabetMeshData.set(meshName, meshData);
            }
            this._initDefaultVariables();
            this._applyDefaultCanvasSetting();
            //********************************************************************************
            //******* Apply default settings for text rendering
            if (this._textShader === null)
                this._applyTextShaderSettings();
            //********* Apply default settings for particle rendering
            if (this._particleShader === null)
                this._applyParticleShaderSettings();
            this._updateCameraView();
            this._textObject = new Text_2.TextObject(1.2, 1.0, 2.1, this._alphabetMeshData);
            if (this._pusherClient === null) {
                this._pusherClient = new this._pusherModule(this._configuration.PusherSettings.app_key, this._configuration.PusherSettings);
            }
            this._bindGameEngineWithHTML();
            if (this._configuration.RequestGameButtonID)
                $(`#${this._configuration.RequestGameButtonID}`).removeAttr('disabled');
            this._isDestroyed = false;
            if (!this.isEngineRunning) {
                this._isEngineRunning = true;
                this._startMainLoop();
            }
        }
        stop() { this._isEngineRunning = false; }
        get isEngineRunning() { return this._isEngineRunning; }
        resize() {
            if (($(window).width() > 600) && ($(`#${this._configuration.VerticalMenubarID}`).css("display") == "none")) {
                $(`#${this._configuration.VerticalMenubarID}`).css("display", "block");
                $(`#${this._configuration.BlockViewDivisionID}`).css("display", "block");
                $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "1");
                $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
            }
            let w = $(`#${this._configuration.CanvasParentID}`).width();
            let h = $(`#${this._configuration.CanvasParentID}`).height();
            if (this._canvas !== null) {
                this._canvas.width = w;
                this._canvas.height = h;
                if (this._gameData.isGameRunning) {
                    this._game.setCanvasSize(w, h);
                }
                else {
                    //Here goes code for default camera setup
                    this._updateCanvasPerspective(w, h);
                }
            }
        }
        radians(degree) { return Math.PI * degree / 180; }
        degrees(radian) { return 180 * radian / Math.PI; }
    }
    exports.OnlineEngine = OnlineEngine;
});
define("onlineApp", ["require", "exports", "jquery", "webgl-obj-loader", "onlineEngine"], function (require, exports, $, OBJ, onlineEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntryPoint = void 0;
    /**
     * Downloads and parses the `.obj` data for each of the 26 alphabets (and their materials if any) and also a `.mtl` data specified in
     * the last entry of the resource list.
     * @param {Array<string>} listOfResource A list of strings with length 27 which contains the names of the 26 `.obj` files
     * (mapping to each alphabet is done their positions in the list) and a (`.mtl`) material file.
     * @param {string} pathToResource The absolute (url) path to resource names contained in `listOfResource`.
     * */
    function DownloadAlphabetMeshData(listOfResource, pathToResource) {
        let modelList = [];
        if (listOfResource.length < 26) {
            alert("The list of resource names must contain all 26 '.obj' data for each alphabets.");
            throw new Error("Specified list of resource names must contain at least 26 entries corresponding to the '.obj' data for each 26 alphabets. ");
        }
        let alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < 26; i++) { //Collect info on .obj data for each of the 26 alphabets.
            let entryFile = listOfResource[i];
            let resourceName = entryFile.replace(/\.[^/.]+$/, ""); //Get the file name without the extension.
            let resourceExtension = entryFile.substring(entryFile.lastIndexOf("."));
            if (resourceExtension !== '.obj') {
                alert("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
                throw new Error("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
            }
            let objEntry = {
                obj: pathToResource + entryFile,
                name: alphabets.charAt(i),
                downloadMtlTextures: false,
                mtl: false //By default, does not download material. Rather a common material library (downloaded only once) is added to each mesh later.
            };
            modelList.push(objEntry);
        }
        let promiseMaterial = undefined;
        if (listOfResource.length > 26) { //Collect info on .mtl data for each of the 26 alphabets.
            let materialFilePath = listOfResource[26]; //Retrieve the 27 the entry of the resource list.
            let resourceExtension = materialFilePath.substring(materialFilePath.lastIndexOf("."));
            if (resourceExtension !== '.mtl') {
                alert("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
                throw new Error("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
            }
            promiseMaterial = fetch(pathToResource + materialFilePath);
        }
        let promiseMeshMapArray = [];
        modelList.forEach(entry => { let promise = OBJ.downloadModels([entry]); promiseMeshMapArray.push(promise); });
        return [promiseMeshMapArray, promiseMaterial];
    }
    /**
     *  Starts the download process of the resources once the HTML document is ready.
     *  @param {OnlineEngineConfiguration} config The configuration specification of the HTML document which runs the OnlineCofig.js script.
     *  @param {OnlineEngine} engine The game-engine instance that will run after the resource downloading and the configuration of document are completed.
     */
    function OnDocumentReady(config, engine) {
        if (!engine)
            engine = new onlineEngine_1.OnlineEngine(config);
        //**************************************************************
        //************* Download mesh objects and initilize engine (webgl renderer)
        if (config.ListOfResourceNames) {
            let totalNumberOfResources = config.ListOfResourceNames.length;
            let resourceDownloaded = 0;
            let promiseForMeshDataAndMaterial = DownloadAlphabetMeshData(config.ListOfResourceNames, config.PathToResource);
            let promiseForMeshDataArray = promiseForMeshDataAndMaterial[0];
            let promiseForMaterial = promiseForMeshDataAndMaterial[1];
            let materialData = undefined;
            let alphabetMeshList = {};
            let isCanvasBlockerVisible = false;
            let canvasBlockerDisplay = $(`#${config.CanvasViewBlockerID}`).css('display');
            if (canvasBlockerDisplay === 'none')
                canvasBlockerDisplay = 'block';
            $(`#${config.CanvasViewBlockerID}`).attr('data-display', canvasBlockerDisplay);
            let messageBoxID = config.MessageBoxID ? `#${config.MessageBoxID}` : undefined;
            let progressBarID = config.ProgressBarID ? `#${config.ProgressBarID}` : undefined;
            let canvasBlockerID = config.CanvasViewBlockerID ? `#${config.CanvasViewBlockerID}` : undefined;
            promiseForMaterial.then(response => {
                if (!response.ok) {
                    if (messageBoxID) {
                        $(messageBoxID).html("Failed to fetch material data from specified url. HTTP status: " + response.status.toString());
                    }
                    throw new Error("Failed to fetch material data from specified url. HTTP status: " + response.status.toString());
                }
                let materialResponse = response.text();
                materialResponse.then(data => {
                    materialData = data;
                    resourceDownloaded += 1;
                    if (canvasBlockerID) {
                        if (!isCanvasBlockerVisible) {
                            $(canvasBlockerID).css("display", canvasBlockerDisplay);
                            isCanvasBlockerVisible = true;
                        }
                    }
                    if (messageBoxID)
                        $(messageBoxID).html(`Loading resources. Please wait ...`);
                    if (progressBarID) {
                        let width = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                        $(progressBarID).css('width', `${width}%`);
                    }
                    if (resourceDownloaded == totalNumberOfResources) {
                        if (messageBoxID)
                            $(messageBoxID).html("Starting game engine ...");
                        if (canvasBlockerID)
                            $(canvasBlockerID).css("display", "none");
                        engine.start(alphabetMeshList, materialData);
                    }
                })
                    .catch(reason => { console.error(reason); });
            })
                .catch(reason => { console.error(reason); });
            promiseForMeshDataArray.forEach(promise => {
                promise.then(objMeshData => {
                    Object.keys(objMeshData).forEach(key => {
                        alphabetMeshList[key] = objMeshData[key];
                        resourceDownloaded += 1;
                        if (canvasBlockerID) {
                            if (!isCanvasBlockerVisible) {
                                $(canvasBlockerID).css("display", canvasBlockerDisplay);
                                isCanvasBlockerVisible = true;
                            }
                        }
                        if (messageBoxID)
                            $(messageBoxID).html(`Loading resources. Please wait ...`);
                        if (progressBarID) {
                            let width = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                            $(progressBarID).css('width', `${width}%`);
                        }
                        if (resourceDownloaded == totalNumberOfResources) {
                            if (messageBoxID)
                                $(messageBoxID).html("Starting game engine ...");
                            if (canvasBlockerID)
                                $(canvasBlockerID).css("display", "none");
                            engine.start(alphabetMeshList, materialData);
                        }
                    });
                })
                    .catch(reason => { console.error(reason); });
            });
        }
    }
    function EntryPoint(config, pusherModule) {
        $(function () {
            var engine = new onlineEngine_1.OnlineEngine(config, pusherModule);
            OnDocumentReady(config, engine);
            window.onbeforeunload = function (event) {
                event.preventDefault();
                event.returnValue = 'Are you sure you want to leave?';
                return 'Are you sure you want to leave?';
            };
            window.onunload = (function (event) {
                if (engine) {
                    engine.destroy();
                    console.debug("Game engine was destroyed!");
                    engine = null;
                }
                return null;
            }).bind(this);
            $(`#${config.LogoutButtonID}`).on('click', function (clickEvent) {
                window.onbeforeunload = function (unloadEvent) { }; //Remove warning message
                let tokenValue = null;
                if (config.PageTokenID)
                    tokenValue = $(`#${config.PageTokenID}`).val();
                if (!tokenValue)
                    tokenValue = '';
                window.location.href = `${config.LogoutPath}?token=${tokenValue}`; //Logout user
            });
            if (config.LogoutButtonMobileID && config.LogoutButtonID !== config.LogoutButtonMobileID) {
                $(`#${config.LogoutButtonMobileID}`).on('click', function (clickEvent) {
                    window.onbeforeunload = function (unloadEvent) { }; //Remove warning message
                    let tokenValue = null;
                    if (config.PageTokenID)
                        tokenValue = $(`#${config.PageTokenID}`).val();
                    if (!tokenValue)
                        tokenValue = '';
                    window.location.href = `${config.LogoutPath}?token=${tokenValue}`; //Logout user
                });
            }
        });
    }
    exports.EntryPoint = EntryPoint;
});
//# sourceMappingURL=chain-reaction-module.js.map