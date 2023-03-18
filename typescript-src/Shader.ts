import OBJ = require("webgl-obj-loader");
import { gl } from "./gl"

export class Shader {
    private _programObj: WebGLProgram;
    private _VertObj: WebGLShader;
    private _FragObj: WebGLShader;
    private _VertexShader: string;
    private _FragmentShader: string;
    private _uniformList: Map<string, WebGLUniformLocation>;
    private _currentMaterial: OBJ.Material = <OBJ.Material>{};
    public constructor() {
        this._uniformList = new Map<string, WebGLUniformLocation>();
    }
    public compile(VertSource: string, FragSource: string): boolean {
        this._VertexShader = VertSource;
        this._FragmentShader = FragSource;

        this._VertObj = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this._VertObj, this._VertexShader);
        gl.compileShader(this._VertObj);
        let isCompiled = gl.getShaderParameter(this._VertObj, gl.COMPILE_STATUS);
        if (!isCompiled) {
            let msg = gl.getShaderInfoLog(this._VertObj);
            gl.deleteShader(this._VertObj);
            throw new Error("Failed to compile vertex shader: " + msg);
        }
        this._FragObj = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this._FragObj, this._FragmentShader);
        gl.compileShader(this._FragObj);
        isCompiled = gl.getShaderParameter(this._FragObj, gl.COMPILE_STATUS);
        if (!isCompiled) {
            let msg = gl.getShaderInfoLog(this._FragObj);
            gl.deleteShader(this._VertObj);
            gl.deleteShader(this._FragObj);
            throw new Error("Failed to compile fragment shader: " + msg);
        }
        if (this._programObj !== undefined) gl.deleteProgram(this._programObj);
        this._programObj = gl.createProgram();
        gl.attachShader(this._programObj, this._VertObj);
        gl.attachShader(this._programObj, this._FragObj);

        gl.linkProgram(this._programObj);

        let isLinked = gl.getProgramParameter(this._programObj, gl.LINK_STATUS);
        if (!isLinked) {
            let msg = gl.getProgramInfoLog(this._programObj);
            gl.detachShader(this._programObj, this._VertObj);
            gl.detachShader(this._programObj, this._FragObj);
            gl.deleteProgram(this._programObj);
            gl.deleteShader(this._VertObj);
            gl.deleteShader(this._FragObj);
            throw new Error("Failed to link program: " + msg);
        }
        gl.detachShader(this._programObj, this._VertObj);
        gl.detachShader(this._programObj, this._FragObj);
        gl.deleteShader(this._VertObj);
        gl.deleteShader(this._FragObj);
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
    public applyMaterial(material: OBJ.Material): boolean {
        if ((this._currentMaterial.name) && (this._currentMaterial.name === material.name)) { return true; }
        let success: boolean = false;
        this.bind();
        let location: WebGLUniformLocation = this.getUniformLocation("vDiffuse");
        if (location !== -1) {
            gl.uniform3f(location, material.diffuse[0], material.diffuse[1], material.diffuse[2]);
            success = true;
        }
        location = this.getUniformLocation("vSpecular");
        if (location !== -1) {
            gl.uniform3f(location, material.specular[0], material.specular[1], material.specular[2]);
            success = true;
        }
        location = this.getUniformLocation("vSpecularExponent");
        if (location !== -1) {
            gl.uniform1f(location, material.specularExponent);
            success = true;
        }
        Object.assign(this._currentMaterial, material);
        return success;
    }
    public bind(): void{
        gl.useProgram(this._programObj);
    }
    public unbind(): void {
        gl.useProgram(null);
    }
    public get getProgram(): WebGLProgram {
        return this._programObj;
    }
    public getUniformLocation(uniformName: string): WebGLUniformLocation {
        if (this._uniformList.has(uniformName)) return this._uniformList.get(uniformName);
        else {
            return -1;
        }
    }
    public cleanUp(): void {
        if (this._VertObj != undefined) {
            gl.detachShader(this._programObj, this._VertObj);
            gl.deleteShader(this._VertObj);
            this._VertObj = undefined;
        }
        if (this._FragObj != undefined) {
            gl.detachShader(this._programObj, this._FragObj);
            gl.deleteShader(this._FragObj);
            this._FragObj = undefined;
        }
        if (this._programObj !== undefined) {
            gl.deleteProgram(this._programObj);
            this._programObj = undefined;
        }
    }
    private _detectUniforms(): void {
        let totalUniformNum: number = gl.getProgramParameter(this._programObj, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < totalUniformNum; i++) {
            let uniformInfo = gl.getActiveUniform(this._programObj, i);
            let location = gl.getUniformLocation(this._programObj, uniformInfo.name);
            if (location != -1) this._uniformList.set(uniformInfo.name, location);
        }
    }
}