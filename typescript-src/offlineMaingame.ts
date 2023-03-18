import $ = require("jquery")
import glm = require("gl-matrix")
import { gl } from "./gl"
import { IndexBufferObject } from "./IndexBufferObject"
import { Shader } from "./Shader"
import { Sphere } from "./Sphere"
import { VertexArrayObject } from "./VertexArrayObject"
import { VertexBufferObject } from "./VertexBufferObject"
import { VertexLayout } from "./VertexLayout"

export const colorList: Map<string, [number, number, number]> = new Map(
    [
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
    ]
);
export interface OfflineGameConfiguration {
    AudioElementID: string,
    CurrentPlayerLabelElementID: string,
    CurrentPlayerLabelMobileElementID: string
}
export interface BoardValue {
    boardCoordinate: [number, number],
    level: number,
    rotationAxes: [number, number, number],
    color: string
}
export class MainGame {
    protected _blastAnimationRunning: boolean;
    protected _blastDisplacement: number;
    protected _blastSound: HTMLAudioElement = undefined;
    protected _BLAST_TIME: number;
    protected _BOARD: Map<number, BoardValue>;
    protected _cameraPosition: glm.vec3 = [0, 0, 0];
    protected _cameraTarget: glm.vec3 = [0, 0, 1];
    protected _cameraUp: glm.vec3 = [0, 1, 0];
    protected _COL_DIV: number;
    protected _CUBE_WIDTH: number;
    protected _currentAllNeighbours: Map<number, number>;
    protected _currentBombs: Array<[number, BoardValue]>;
    protected _currentPlayerLabelElement: HTMLLabelElement;
    protected _currentPlayerMobileLabelElement: HTMLLabelElement;
    protected _DISPLAY: [number, number];
    protected _eliminated: Array<string>;
    protected _GRID_IBO: Map<number, IndexBufferObject>; //stores ibo for (row x col)=> cantor_pair grid data.
    protected _gridShaderProgram: Shader;
    protected _GRID_VAO: Map<number, VertexArrayObject>; //stores vao for (row x col)=> cantor_pair grid data.
    protected _GRID_VBO: Map<number, VertexBufferObject>; //stores vbo for (row x col)=> cantor_pair grid data.
    protected _orbShaderProgram: Shader;
    protected _lightDirLatitude: number = 0.0;
    protected _lightDirLongitude: number = 0.0;
    protected _lowerleft: [number, number];
    protected _modelview: glm.mat4;
    protected _players: Array<string>;
    protected _projection: glm.mat4;
    protected _rotationAngle: number;
    protected _ROTATION_SPEED: number;
    protected _ROW_DIV: number;
    protected _sphere: Sphere;
    protected _turn: number;
    protected _undoBoard: Map<number, BoardValue>;
    protected _undoEliminated: Array<string>;
    protected _undoingBoard: boolean;
    protected _undoTurn: number;
//***************************************************************************************************** */
//************************************** Private methods ***********************************************
//***************************************************************************************************** */
    protected _applyGridShaderSettings(): void {
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
        this._gridShaderProgram = new Shader();
        this._gridShaderProgram.compile(vertGridSource, fragGridSource);
        //Initialize uniform variables with default values.
        this._gridShaderProgram.bind();
        let location: WebGLUniformLocation = this._gridShaderProgram.getUniformLocation("backsideColor");
        if (location != -1) gl.uniform4f(location, 0, 0.5, 0, 1.0);
        location = this._gridShaderProgram.getUniformLocation("frontsideColor");
        if (location != -1) gl.uniform4f(location, 0, 1.0, 0, 1.0);
        location = this._gridShaderProgram.getUniformLocation("transform");
        let defaultMatrix = glm.mat4.create();
        if (location != -1) gl.uniformMatrix4fv(location, false, defaultMatrix);
        this._gridShaderProgram.unbind();
    }
    protected _applyOrbShaderSettings(): void {
        //Vertex shader for rendering orbs
        let vertOrbSource: string =
            "#version 300 es\n\
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
        let fragOrbSource: string =
            "#version 300 es\n\
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
        this._orbShaderProgram = new Shader();
        this._orbShaderProgram.compile(vertOrbSource, fragOrbSource);

        this._orbShaderProgram.bind();
        //Update orbColor uniform variable
	    let location = this._orbShaderProgram.getUniformLocation("orbColor");
	    let defaultOrbColor = [ 1.0, 1.0, 1.0, 1.0 ];
        if (location != -1) gl.uniform4f(location, defaultOrbColor[0], defaultOrbColor[1], defaultOrbColor[2], defaultOrbColor[3]);
        //***********************************************************
        //Update uniform variable (modelview matrix) in shader
        let defaultMatrix = glm.mat4.create();
        location = this._orbShaderProgram.getUniformLocation("modelTransform");
        if (location != -1) gl.uniformMatrix4fv(location, false, defaultMatrix);
        //********************************************************************************
        //Update uniform variable (projection matrix) in shader
        location = this._orbShaderProgram.getUniformLocation("projectionView");
        if (location != -1) gl.uniformMatrix4fv(location, false, defaultMatrix);
        //******************************************************************************
        //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
        let lightDir = this.getGlCompatibleCoordinate(1.0, this._lightDirLatitude, this._lightDirLongitude);
        location = this._orbShaderProgram.getUniformLocation("lightDirection");
        if (location != -1) gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
        //*************************************************************************
        //Update camera position 
        location = this._orbShaderProgram.getUniformLocation("cameraPosition");
        if (location != -1) gl.uniform3f(location, this._cameraPosition[0], this._cameraPosition[1], this._cameraPosition[2]); //Update uniform variable (camera position) in shader
        //*************************************************************
        //Update uniform variable (vDiffuse) in shader
        location = this._orbShaderProgram.getUniformLocation("vDiffuse");
        if (location != -1) gl.uniform3f(location, 0.0, 0.0, 0.0);
        //********************************************************************
        //Update uniform variable (vSpecular) in shader
        location = this._orbShaderProgram.getUniformLocation("vSpecular");
        if (location != -1) gl.uniform3f(location, 1.0, 1.0, 1.0);
        //************************************************************************
        //Update uniform variable (vSpecularExponent) in shader
        location = this._orbShaderProgram.getUniformLocation("vSpecularExponent");
        if (location != -1) gl.uniform1f(location, 233.3333);
        //******************************************************************************
        this._orbShaderProgram.unbind();
	//*************************************************************
    }
    protected _createGridData(numberOfRows: number, numberOfColumns: number, cubeWidth: number, centerX: number = 0, centerY: number = 0): [VertexArrayObject, VertexBufferObject, IndexBufferObject] {
        let width = numberOfColumns * cubeWidth, height = numberOfRows * cubeWidth;
        let floatSize = VertexLayout.getSize(gl.FLOAT);
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
                coordViewBack[0] = x; coordViewBack[1] = y; coordViewBack[2] = z;
                coordViewFront[0] = x; coordViewFront[1] = y; coordViewFront[2] = -z;
                offset += 3 * floatSize;
                let isVertexBackfaceBackLayer = new Float32Array(buffer, offset, 1);
                let isVertexBackfaceFrontLayer = new Float32Array(buffer, halfRequiredMemory + offset, 1);
                isVertexBackfaceFrontLayer[0] = 0.0;
                isVertexBackfaceBackLayer[0] = 1.0;
                offset += 1 * floatSize;
            }
        }
        let vb = new VertexBufferObject(buffer);
        let layout = new VertexLayout();
        layout.addLayout(gl.FLOAT, 3, false);
        layout.addLayout(gl.FLOAT, 1, true);

        let va = new VertexArrayObject();
        va.setVertexBuffer(vb, layout);

        let indices = new Array<number>();
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
        let ib = new IndexBufferObject(ib_data);
        va.setIndexBuffer(ib);
        return [va, vb, ib];
    }
    protected _drawGrid(): void {
        this._gridShaderProgram.bind();
        let key = MainGame.cantorValue(this._ROW_DIV, this._COL_DIV);
        let va = this._GRID_VAO.get(key);
        va.bind();
        for (let i = 0; i < va.numAttr; i++) {
            gl.enableVertexAttribArray(i);
        }
        gl.drawElements(gl.LINES, va.numIndices, gl.UNSIGNED_SHORT, 0);
        for (let i = 0; i < va.numAttr; i++) {
            gl.disableVertexAttribArray(i);
        }
        va.unbind();
        this._gridShaderProgram.unbind();
    }
    protected _drawOrb(center: [number, number, number], axes: [number, number, number], angleOfRotation: number, level: number, colorName: string): void {
        this._orbShaderProgram.bind();
        let _model = glm.mat4.create();
        if (this._sphere.getColor !== colorName) {
            this._sphere.setColor = colorName;
            let color = colorList.get(colorName);
            let location = this._orbShaderProgram.getUniformLocation("orbColor");
            gl.uniform4f(location, color[0], color[1], color[2], 1.0);
        }
        if (level == 1) {
            glm.mat4.translate(_model, _model, [center[0] + Math.random() / 3, center[1] + Math.random() / 3, center[2] + Math.random() / 3]);
            let location = this._orbShaderProgram.getUniformLocation("modelTransform");
            gl.uniformMatrix4fv(location, false, _model);
            this._sphere.draw(1);
        }
        else {

            glm.mat4.translate(_model, _model, [center[0], center[1], center[2]]);
            glm.mat4.rotate(_model, _model, angleOfRotation, [axes[0], axes[1], axes[2]]);
            let location = this._orbShaderProgram.getUniformLocation("modelTransform");
            gl.uniformMatrix4fv(location, false, _model);
            this._sphere.draw(level);
        }
        this._orbShaderProgram.unbind();
    }
    protected _eliminatePlayers(updateTurn: boolean): void {
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
                if (valid) this._eliminated.push(player);
            }
        }
        if (updateTurn) {
            let len = this._players.length;
            while (true) {
                this._turn += 1;
                let temp = this._players[this._turn % len];
                if (this._eliminated.indexOf(temp) < 0) break;
            }
            this.updateTurn();
        }
    }
    protected _getBombNeighbours(): Map<number, number> {
        let allNeighbours = new Map<number, number>();
        for (let boardEntry of this._currentBombs) {
            let boardCoordinate = boardEntry[1].boardCoordinate;
            const setOfNeighbours = this._getNeighbours(boardCoordinate[0], boardCoordinate[1]);
            for (let cantorKey of setOfNeighbours) {
                if (allNeighbours.has(cantorKey)) {
                    let numberOfNeighbours = allNeighbours.get(cantorKey);
                    allNeighbours.set(cantorKey, numberOfNeighbours + 1);
                }
                else allNeighbours.set(cantorKey, 1);
            }
        }
        return allNeighbours;
    }
    protected _getBombs(board: Map<number, BoardValue>): Array<[number, BoardValue]> {
        let bombList = new Array<[number, BoardValue]>();
        for (let key_value of board) {
            let boardCoordinate: [number, number] = key_value[1].boardCoordinate;
            let length: number = 0;
            if (boardCoordinate[0] + 1 !== this._COL_DIV) length++;
            if (boardCoordinate[0] >= 1) length++;
            if (boardCoordinate[1] + 1 !== this._ROW_DIV) length++;
            if (boardCoordinate[1] >= 1) length++;
            if (length <= key_value[1].level) bombList.push(key_value);
        }
        return bombList;
    }
    protected _getNeighbours(boardCoordinateX: number, boardCoordinateY: number): Set<number> {
        let output: Set<number> = new Set();
        if (boardCoordinateX + 1 !== this._COL_DIV) output.add(MainGame.cantorValue(boardCoordinateX + 1, boardCoordinateY));
        if (boardCoordinateX >= 1) output.add(MainGame.cantorValue(boardCoordinateX - 1, boardCoordinateY));
        if (boardCoordinateY + 1 !== this._ROW_DIV) output.add(MainGame.cantorValue(boardCoordinateX, boardCoordinateY + 1));
        if (boardCoordinateY >= 1) output.add(MainGame.cantorValue(boardCoordinateX, boardCoordinateY - 1));
        return output;
    }
    protected _getWorldCoordinates(x: number, y: number): [number, number, number] {

        let viewport: Int32Array = gl.getParameter(gl.VIEWPORT);
        let projectView: glm.mat4 = glm.mat4.create();
        let projectViewInv: glm.mat4 = glm.mat4.create();
        let projectedVert: glm.vec4 = glm.vec4.fromValues(0, 0, 0, 1);
        glm.mat4.multiply(projectView, this._projection, this._modelview);
        glm.mat4.invert(projectViewInv, projectView);
        glm.vec4.transformMat4(projectedVert, [0, 0, 0.5 * this._CUBE_WIDTH, 1], projectView);
        let x_1 = -1 + 2 * ((x - viewport[0]) / viewport[2]);
        let y_1 = -1 + 2 * (((this._DISPLAY[1] - y) - viewport[1]) / viewport[3]);
        let outVert: glm.vec4 = glm.vec4.fromValues(0, 0, 0, 0);
        let inVert: glm.vec4 = glm.vec4.fromValues(projectedVert[3] * x_1, projectedVert[3] * y_1, projectedVert[2], projectedVert[3]);
        glm.vec4.transformMat4(outVert, inVert, projectViewInv);
        return [outVert[0], outVert[1], outVert[2]];
    }
    protected _initDefaults(): void {
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
        this._sphere = new Sphere();
        this._sphere.init(0, 0, 0, radius, 50, 50);
        //Orb shader setting
        this._applyOrbShaderSettings();
        //Grid setting
        this._applyGridShaderSettings();
    }
    protected _runBlastAnimation(deltaTime: number): boolean {
        let hasGameEnded: boolean = false; //boolean flag to detect the end of a game.
        if (this._blastDisplacement == 0) this._blastSound.play();
        this._blastDisplacement += ((this._CUBE_WIDTH / this._BLAST_TIME) * deltaTime) / 1000.0;
        if (this._blastDisplacement < this._CUBE_WIDTH) { //A blast animation is still running.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Clear color and depth buffer before rendering new frame.
            //***************** Render board ******************/
            this._drawGrid();
            for (let boardEntry of this._BOARD) {
                let boardValue: BoardValue = boardEntry[1];
                let boardCoordinate: [number, number] = boardEntry[1].boardCoordinate;
                let center: [number, number, number] = [
                    (boardCoordinate[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                    (boardCoordinate[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                    0
                ];
                const color: string = boardValue.color;
                let angle = this._rotationAngle % 360.0;
                if (!this.isExplosive(boardValue)) this._drawOrb(center, boardValue.rotationAxes, angle, boardValue.level, color);
                else {
                    if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0] + 1, boardCoordinate[1]))) {
                        let displacedCenter: [number, number, number] = [
                            center[0] + this._blastDisplacement,
                            center[1],
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0] - 1, boardCoordinate[1]))) {
                        let displacedCenter: [number, number, number] = [
                            center[0] - this._blastDisplacement,
                            center[1],
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] + 1))) {
                        let displacedCenter: [number, number, number] = [
                            center[0],
                            center[1] + this._blastDisplacement,
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] - 1))) {
                        let displacedCenter: [number, number, number] = [
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
            for (let bomb of this._currentBombs) this._BOARD.delete(bomb[0]);
            for (let key_value of this._currentAllNeighbours) {
                if (this._BOARD.has(key_value[0])) {
                    let board_value: BoardValue = this._BOARD.get(key_value[0]);
                    let newBoardValue: BoardValue = <BoardValue>{};
                    newBoardValue.boardCoordinate = board_value.boardCoordinate;
                    newBoardValue.level = board_value.level + key_value[1];
                    newBoardValue.color = bombColor;
                    newBoardValue.rotationAxes = <[number, number, number]>{};
                    Object.assign(newBoardValue.rotationAxes, board_value.rotationAxes);
                    this._BOARD.set(key_value[0], newBoardValue);
                }
                else {
                    let newBoardValue: BoardValue = <BoardValue>{};
                    newBoardValue.boardCoordinate = MainGame.inverseCantorValue(key_value[0]);
                    newBoardValue.level = key_value[1];
                    newBoardValue.color = bombColor;
                    let axes: [number, number, number] = [2 * Math.random() - 1, 6 * Math.random() - 3, 8 * Math.random() - 4];
                    if ((axes[0] == 0) && (axes[1] == 0) && (axes[2] == 0)) {
                        axes[0] += Math.random();
                        axes[1] += Math.random();
                        axes[2] += Math.random();
                    }
                    newBoardValue.rotationAxes = <[number, number, number]>{};
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
                let winnerIndex: number = 1;
                let winnerName: string = "";
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
    protected _setupCamera(): void {
        gl.viewport(0, 0, this._DISPLAY[0], this._DISPLAY[1]);
        let cameraDistance: number = glm.vec3.length(glm.vec3.fromValues(this._cameraTarget[0] - this._cameraPosition[0], this._cameraTarget[1] - this._cameraPosition[1], this._cameraTarget[2] - this._cameraPosition[2])); //Distance between camera and target
        let focusHeight: number = 0.5 * (this._ROW_DIV) * (this._CUBE_WIDTH);
        let calibratedDistance: number = cameraDistance - this._CUBE_WIDTH; //Zoom out the camera to avoid rendering near the screen edges.

        glm.mat4.perspective(this._projection, 2 * Math.atan(focusHeight / calibratedDistance), this._COL_DIV / this._ROW_DIV, 1.0, cameraDistance + 100.0);
        glm.mat4.lookAt(this._modelview, this._cameraPosition, this._cameraTarget, this._cameraUp);
        let final_mat = glm.mat4.create();
        glm.mat4.multiply(final_mat, this._projection, this._modelview);
        let _model = glm.mat4.create();

        let location = this._gridShaderProgram.getUniformLocation("transform");
        this._gridShaderProgram.bind();
        gl.uniformMatrix4fv(location, false, final_mat);
        this._gridShaderProgram.unbind();

        this._orbShaderProgram.bind();
        location = this._orbShaderProgram.getUniformLocation("projectionView");
        gl.uniformMatrix4fv(location, false, final_mat);
        location = this._orbShaderProgram.getUniformLocation("modelTransform");
        gl.uniformMatrix4fv(location, false, _model);
        this._orbShaderProgram.unbind();
    }
    
//************************************************************************************************** */
///**************************************** Public methods **********************************************
    //************************************************************************************************** */
    public static cantorValue(x: number, y: number): number {
        return Math.round(0.5 * (x + y) * (x + y + 1) + y);
    }
    constructor(config: OfflineGameConfiguration) {
        if (config.AudioElementID) {
            this._blastSound = document.getElementById(config.AudioElementID) as HTMLAudioElement;
            if (this._blastSound === undefined) throw new Error(`Could not find html audio element with id: ${config.AudioElementID}`);
            else this._initDefaults();
        }
        else throw new Error("AudioElementID in the configuration setting does not point to a valid HTMLAudioElement in the html document.");
        if (config.CurrentPlayerLabelElementID) {
            let htmlElement = document.getElementById(config.CurrentPlayerLabelElementID) as HTMLLabelElement;
            if (!htmlElement) throw new Error(`Could not find html label element with id: ${config.CurrentPlayerLabelElementID}`);
            this._currentPlayerLabelElement = htmlElement;
        }
        else throw new Error("CurrentPlayerLabelElementID in the configuration setting does not point to a valid HTMLLabelElement in the html document.");
        if (config.CurrentPlayerLabelMobileElementID) {
            let htmlElement = document.getElementById(config.CurrentPlayerLabelMobileElementID) as HTMLLabelElement;
            if (!htmlElement) throw new Error(`Could not find html label element with id: ${config.CurrentPlayerLabelMobileElementID}`);
            this._currentPlayerMobileLabelElement = htmlElement;
        }
        else throw new Error("CurrentPlayerLabelMobileElementID in the configuration setting does not point to a valid HTMLLabelElement in the html document.");
    }
    public convertMouseToBoardCoordinate(mouseX: number, mouseY: number): Array<number> {
        let boardCoordinate: Array<number> = [-1, -1];

        return boardCoordinate;
    }
    public cleanUp(): void {
        this.resetGameVariables();
        gl.useProgram(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        this._sphere.cleanUp();
        this._orbShaderProgram.cleanUp();
        this._gridShaderProgram.cleanUp();
        for (let key_val of this._GRID_VAO) {
            let key: number = key_val[0];
            let va = key_val[1];
            let vb = this._GRID_VBO.get(key);
            let ib = this._GRID_IBO.get(key);
            va.cleanUp(); vb.cleanUp(); ib.cleanUp();
            this._GRID_VAO.delete(key);
            this._GRID_VBO.delete(key);
            this._GRID_IBO.delete(key);
        }

    }
    public degrees(radian: number): number { return 180 * radian / Math.PI }
    public drawBoard(deltaTime: number): boolean {
        if (this.isUndoingBoard) return false; //The game board is being undone. Don't draw the board until it is finished.
        let hasGameEnded: boolean = false;
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
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this._drawGrid();
            let angle = this._rotationAngle % 360;
            for (let key_value of this._BOARD) {
                let key = key_value[1].boardCoordinate;
                let center: [number, number, number] = [
                    (key[0] + 0.5) * this._CUBE_WIDTH + this._lowerleft[0],
                    (key[1] + 0.5) * this._CUBE_WIDTH + this._lowerleft[1],
                    0
                ];
                this._drawOrb(center, key_value[1].rotationAxes, angle, key_value[1].level, key_value[1].color);
            }
            if (this._BOARD.size > 0) this._rotationAngle += ((this._ROTATION_SPEED * deltaTime) / 1000.0);
        }
        if (hasGameEnded) this.resetGameVariables();
        return hasGameEnded;
    }
    public getBoardCoordinates(mouseX: number, mouseY: number): Array<number> {
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
    public getGlCompatibleCoordinate(radius: number, latitudeDegree: number, longitudeDegree: number): Array<number> { return [radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))] };
    public getPlayerList(): Array<string> {
        let outputPlayerList: Array<string> = [];
        Object.assign(outputPlayerList, this._players);
        return outputPlayerList;
    }
    public static inverseCantorValue(z: number): [number, number] {
        let w = Math.floor(0.5 * (Math.sqrt(8 * z + 1) - 1));
        let y = Math.round(z - 0.5 * w * (w + 1));
        let x = w - y;
        return [x, y];
    }
    public get isBlastAnimationRunning(): boolean {
        return this._blastAnimationRunning;
    }
    public isEliminated(player: string): boolean {
        let playerIndex = this._eliminated.indexOf(player);
        return playerIndex < 0 ? false : true;
    }
    public isExplosive(value: BoardValue) {
        let isValueFound = false;
        for (const explosive of this._currentBombs) {
            if ((explosive[1].boardCoordinate[0] == value.boardCoordinate[0]) && (explosive[1].boardCoordinate[1] == value.boardCoordinate[1])) {
                isValueFound = true;
                break
            }
        }
        return isValueFound;
    }
    public get isUndoingBoard(): boolean {
        return this._undoingBoard;
    }
    public processPlayerInput(boardCoordinateX: number, boardCoordinateY: number): boolean {
        if (this.isUndoingBoard) return false; //The game board is being undone. Don't process new inputs until it is finished.
        if (this.isBlastAnimationRunning) return false; //Current board has bombs which needs to be taken care of before processing any input.
        if ((boardCoordinateX < 0) || (boardCoordinateY < 0)) return false;
        let key = MainGame.cantorValue(boardCoordinateX, boardCoordinateY);
        let numPlayer = this._players.length;
        if (!(this._BOARD.has(key))) {
            this._undoBoard.clear();
            for (let key_value of this._BOARD) {
                let key: number = key_value[0];
                let value: BoardValue = <BoardValue>{};
                Object.assign(value, key_value[1]);
                this._undoBoard.set(key, value);
            }
            this._undoTurn = this._turn;
            this._undoEliminated.length = 0;
            this._eliminated.forEach((playerColor, index) => this._undoEliminated.push(playerColor));

            let rot_axes: [number, number, number] = [Math.random(), 6 * Math.random() - 3, 8 * Math.random() - 4];
            if ((rot_axes[0] == 0) && (rot_axes[1] == 0) && (rot_axes[2] == 0)) {
                rot_axes[0] += Math.random();
                rot_axes[1] += Math.random();
                rot_axes[2] += Math.random();
            }
            let color = this._players[this._turn % numPlayer];
            let newBoardValue: BoardValue = <BoardValue>{};
            newBoardValue.boardCoordinate = [boardCoordinateX, boardCoordinateY];
            newBoardValue.color = color;
            newBoardValue.rotationAxes = <[number, number, number]>{};
            Object.assign(newBoardValue.rotationAxes, rot_axes);
            newBoardValue.level = 1;
            this._BOARD.set(key, newBoardValue);
        }
        else {
            let color = this._players[this._turn % numPlayer]
            let boardValue = this._BOARD.get(key);
            if (color !== boardValue.color) return false;
            this._undoBoard.clear();
            this._undoBoard.clear();
            for (let key_value of this._BOARD) {
                let key: number = key_value[0];
                let value: BoardValue = <BoardValue>{};
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
        if (this._currentBombs.length == 0) this._eliminatePlayers(true);
        return true;
    }
    public radians(degree: number): number { return Math.PI * degree / 180; }
    public resetGameVariables(): void {
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
    public setAttribute(numberOfRows: number, numberOfColumns: number, playerList: Array<string>): void {
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
    public setCanvasSize(width: number, height: number): void {
        this._DISPLAY[0] = width;
        this._DISPLAY[1] = height;
        this._setupCamera();
    }
    public setColorOfBacksideGrid(colorR: number, colorG: number, colorB: number) {
        this._gridShaderProgram.bind();
        let location: WebGLUniformLocation = this._gridShaderProgram.getUniformLocation("backsideColor");
        if (location != -1) gl.uniform4f(location, colorR, colorG, colorB, 255);
        this._gridShaderProgram.unbind();
    }
    public setColorOfFrontsideGrid(colorR: number, colorG: number, colorB: number) {
        this._gridShaderProgram.bind();
        let location: WebGLUniformLocation = this._gridShaderProgram.getUniformLocation("frontsideColor");
        if (location != -1) gl.uniform4f(location, colorR, colorG, colorB, 255);
        this._gridShaderProgram.unbind();
    }
    public updateTurn(): void {
        let curPlayer = 1 + (this._turn % this._players.length);
        let playerColor: string = this._players[curPlayer - 1];
        let colorVal: [number, number, number] = colorList.get(playerColor);
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
    public undo(): void {
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