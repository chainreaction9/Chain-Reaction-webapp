import glm = require("gl-matrix");
import { MeshData } from "./MeshContainer"
import { Shader } from "./Shader"
import { gl } from "./gl"

export class TextObject{
    private _fontSize: number = 0;
    private _width: number = 0;
    private _height: number = 0;
    private _fontData: Array<MeshData> = []; //Contains mesh data of 26 alphabets ordered as in a-z;
    public cleanUp(): void {
        while (this._fontData.length > 0) {
            let mesh: MeshData = this._fontData.pop();
            mesh.cleanUp();
        }
    }
    /**
    * Default constructor for Text object.
    * @param {number} fontSize: size of the font.
    * @param {number} width: space between each letter.
    * @param {number} height: space between each line.
    * @param {Map<string, MeshMap>} alphabetMeshMap: a map between 26 alphabet names (in capital letter) and their MeshData.
    */
    constructor(fontSize: number, width: number, height: number, alphabetMeshMap: Map<string, MeshData>) {
        this._fontSize = fontSize;
        this._width = width;
        this._height = height;
        let alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let index = 0; index < 26; index++) {
            let mesh = alphabetMeshMap.get(alphabets.charAt(index));
            this._fontData.push(mesh);
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
    public drawText(shaderProgram: Shader, modelMatrixUniformLocation: WebGLUniformLocation, text: string, position: glm.vec3, rotation: glm.vec3, horizontalAlign?: string, applyMaterial?: boolean) {
        let sampleModel: glm.mat4 = glm.mat4.create();
        glm.mat4.translate(sampleModel, sampleModel, position);
        glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[0] / 180.0), [1, 0, 0]);
        glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[1] / 180.0), [0, 1, 0]);
        glm.mat4.rotate(sampleModel, sampleModel, Math.PI * (-rotation[2] / 180.0), [0, 0, 1]);
        let scaledModel: glm.mat4 = glm.mat4.scale(sampleModel, sampleModel, [this._fontSize, this._fontSize, this._fontSize]);
        if (horizontalAlign !== "right") {
            if (horizontalAlign == "center")
                glm.mat4.translate(scaledModel, scaledModel, [-0.5 * this._width * (text.length - 1), 0, 0]);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === ' ') {
                    glm.mat4.translate(scaledModel, scaledModel, [0.7 * this._width, 0, 0]);
                    continue;
                }
                let characterAscii: number = text.charAt(i).toUpperCase().charCodeAt(0);
                gl.uniformMatrix4fv(modelMatrixUniformLocation, false, scaledModel);
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
                let characterAscii: number = text.charAt(i).toUpperCase().charCodeAt(0);
                gl.uniformMatrix4fv(modelMatrixUniformLocation, false, scaledModel);
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
    public drawLine(shaderProgram: Shader, modelMatrixUniformLocation: WebGLUniformLocation, textWithMultipleLines: string, position: glm.vec3, rotation: glm.vec3, horizontalAlign: string, verticalAlign: string, applyMaterial?: boolean) {
        
    	let x :number = position[0];
    	let y :number = position[1];
    	let z :number = position[2];
        let lineList: Array<string> = textWithMultipleLines.split(/\r?\n/); //Splits the string in new line characters. 
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
                    this.drawText(shaderProgram, modelMatrixUniformLocation, line, glm.vec3.fromValues(x,y,z), rotation, horizontalAlign, applyMaterial);
                y += 0.6 * this._height;
            }
        }
    }
}