import $ = require("jquery");
import glm = require("gl-matrix");
import OBJ = require("webgl-obj-loader");
import { gl, glUtilities } from "./gl";
import { colorList, MainGame, OfflineGameConfiguration } from "./offlineMaingame";
import { Shader } from "./Shader";
import { Sphere } from "./Sphere";
import { TextObject } from "./Text";
import { MeshData } from "./MeshContainer";

export interface Particle {
    position: [number, number, number],
    color: [number, number, number],
    isFlickering: boolean
}
/** 
* An interface specifying element IDs to bind functions from the offline game engine with the elements in HTML document.
* @property AudioElementID: ID of the html audio element containing the audio resources.
* @property BoardDimLabelID: ID of the html label element displaying the current board dimension (row & column).
* @property BlockViewDivisionID: ID of the div which blocks the background after opening the vertical Menu (applicable to media with smaller screen size such as mobile).
* @property CanvasElementID: ID of the HTML canvas element on which the game engine uses.
* @property CanvasViewBlockerID: Optional, ID of the div element blocking from viewing the canvas.It also contains the progress bar and the message container.
* @property CanvasParentID: ID of the parent of HTML canvas element on which the game engine uses.
* @property ColorSequenceMenuID: ID of the popup menu button which displays the order of player turns in a running game.
* @property CurrentPlayerLabelID: ID of the label displaying name of the current player in a running game (applicable to media with bigger screen size).
* @property CurrentPlayerMobileLabelID : ID of the label displaying name of the current player in a running game (applicable to media with smaller screen size).
* @property DefaultMaterialForParticles: Optional, Name of the default material for brownian particles. The material must be defined in the provided .mtl data. 
* @property DefaultNumberOfColumn: Optional, Default number of columns in board.
* @property DefaultNumberOfRow: Optional, Default number of rows in board.
* @property DefaultMaterialForParticles : Optional, Name of the default material for brownian particles. The material must be defined in the provided .mtl data. 
* @property FrameCounterID: Optional, ID of the div in html document containing the frame count.
* @property HtmlMenuButtonID: ID of the div in html docoument containing the Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile).
* @property HorizontalPanelID: ID of the div in html containing current player information (applicable to media with smaller screen size).
* @property InsideMenuDivisionID: ID of the div in html which contains menu options that are available after starting a game.
* @property ListOfColorSelectorID: Array containing the IDs for the color selectors associated with each player.
* @property ListOfColorSelectorParentID: Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
* @property ListOfResourceNames: A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
* @property MainmenuButtonID: ID of the html button which stops a running game and goes back to the main menu.
* @property MessageBoxID: Optional, ID of the html element displaying interactive messages from engine to the html document.
* @property NewGameButtonID: ID of the html button which stops a running game and starts a new one.
* @property NumberOfBrownianParticles: Optional, Default number of brownian particles in the canvas background.
* @property NumberOfColumnSelectorID: ID of the selector that provides number of columns in the game board.
* @property NumberOfRowSelectorID: ID of the selector that provides number of rows in the game board.
* @property NumberOfPlayersLabelID: ID of the label displaying total number of players in a running game.
* @property NumberOfPlayersSelectorID: ID of the selector for choosing number of players.
* @property OutsideMenuDivisionID: ID of the div in html which contains menu options that are available before starting a game.
* @property PathToResource: Path to the '.obj' and '.mtl' files specified in ListOfResourceNames.
* @property ProgressBarID: Optional, ID of the progress bar element.
* @property StartGameButtonID: ID of the button which start a game.
* @property UndoButtonID: ID of the html button which undoes a player move in a running game.
* @property UndoButtonMobileID: ID of the html button which undoes a player move in a running game (applicable to media with smaller screen size such as mobile).
* @property VerticalMenubarID: ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC)
*/
export interface OfflineEngineConfiguration {
    AudioElementID: string, //ID of the html audio element containing the audio resources.
    BoardDimLabelID: string, //ID of the html label element displaying the current board dimension (row & column).
    BlockViewDivisionID: string, //ID of the div which blocks the background after opening the vertical Menu (applicable to media with smaller screen size such as mobile)
    CanvasElementID: string, //ID of the HTML canvas element on which the game engine uses.
    CanvasParentID: string, //ID of the parent of HTML canvas element on which the game engine uses.
    CanvasViewBlockerID?: string, //Optional, ID of the div element blocking from viewing the canvas.It also contains the progress bar and the message container.
    ColorSequenceMenuID: string, //ID of the popup menu button which displays the order of player turns in a running game.
    CurrentPlayerLabelID: string, //ID of the label displaying name of the current player in a running game (applicable to media with bigger screen size).
    CurrentPlayerMobileLabelID: string, //ID of the label displaying name of the current player in a running game (applicable to media with smaller screen size).
    DefaultMaterialForParticles?: string, //Optional, name of the default material for brownian particles.The material must be defined in the provided.mtl data.
    DefaultNumberOfColumn?: number, //Optional, default number of columns in board.
    DefaultNumberOfRow?: number, //Optional, default number of rows in board.
    FrameCounterID?: string, //Optional, ID of the div in html document containing the frame count.
    HtmlMenuButtonID: string,  //ID of the div in html docoument containing the Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile)
    HorizontalPanelID: string, //ID of the div in html containing current player information (applicable to media with smaller screen size).
    InsideMenuDivisionID: string, //ID of the div in html which contains menu options that are available after starting a game.
    ListOfColorSelectorID: Array<string>, //Array containing the IDs for the color selectors associated with each player.
    ListOfColorSelectorParentID: Array<string>, //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
    ListOfResourceNames: Array<string>, // A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
    MainmenuButtonID: string, //ID of the html button which stops a running game and goes back to the main menu.
    MessageBoxID?: string, //Optional, ID of the html element displaying interactive messages from engine to the html document.
    NewGameButtonID: string, //ID of the html button which stops a running game and starts a new one.
    NumberOfBrownianParticles?: number, //Optional, default number of brownian particles in the canvas background.
    NumberOfColumnSelectorID: string, //ID of the selector that provides number of columns in the game board.
    NumberOfRowSelectorID: string, //ID of the selector that provides number of rows in the game board.
    NumberOfPlayersLabelID: string, //ID of the label displaying total number of players in a running game.    
    NumberOfPlayersSelectorID: string, //ID of the selector for choosing number of players.
    OutsideMenuDivisionID: string, //ID of the div in html which contains menu options that are available before starting a game.
    PathToResource: string, //Path to the '.obj' and '.mtl' files specified in ListOfResourceNames.
    ProgressBarID?: string, //Optional, ID of the progress bar element.
    StartGameButtonID: string, //ID of the button which start a game.
    UndoButtonID: string, // ID of the html button which undoes a player move in a running game.
    UndoButtonMobileID: string, // ID of the html button which undoes a player move in a running game (applicable to media with smaller screen size such as mobile).
    VerticalMenubarID: string //ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC).
};
export interface OfflineGameState {
    isGameRunning: boolean,
    quitCurrentGame: boolean,
    startNewGame: boolean,
    isMouseDataProcessed: boolean,
    mouseX: number,
    mouseY: number
}
export class OfflineEngine {
    private _beginFrame: number = 0;
    private _currentMouseX: number = 0;
    private _currentMouseY: number = 0;
    private _endFrame: number = 0;
    private _fpsRate: number = 65;
    private _frameCount: number = 0;
    private _isDragging: boolean = false;
    private _isEngineRunning: boolean = false;
    private _mouseDown: boolean = false;
//******************************* Settings for canvas scence (Brownian particles) outside of a game  *************************** */
    private _alphabetMeshData: Map<string, MeshData> = new Map();
    private _boundingBox: number = 30;
    private _cameraDistance: number = 30;
    private _cameraLatitude: number = 0; //in degree
    private _cameraLongitude: number = 0; // in degree
    private _cameraRotationSpeed = 360.0; //Speed (degree / mouse_increment / sec) at which camera rotates while dragging mouse pointer.
    private _cameraTarget: glm.vec3 = [0, 0, 0];
    private _cameraUp: glm.vec3 = [0, 1, 0];
    private _currentMaterialLibrary: OBJ.MaterialLibrary;
    private _defaultParticleMaterial: OBJ.Material = <OBJ.Material>{};
    private _defaultProj: glm.mat4 = null;
    private _defaultView: glm.mat4 = null;
    private _lightDirLatitude: number = 0.0; //Latitude and longitude determine the direction, not the light position. Light Direction == target position - light position
    private _lightDirLongitude: number = 180.0;
    private _mNumParticles: number = 30;
    private _particleData: Array<Particle> = null;
    private _particleShader: Shader = null;
    private _sampleSphere: Sphere = null;
    private _textObject: TextObject = null;
    private _textShader: Shader = null;
//********************************************************************************* */

    private _canvas: HTMLCanvasElement = null;
    private _configuration: OfflineEngineConfiguration = null;
    private _game: MainGame = null;
    private _gameData: OfflineGameState = {
        isGameRunning: false,
        quitCurrentGame: false,
        startNewGame: false,
        isMouseDataProcessed: true,
        mouseX: null,
        mouseY: null
    };
    private _isDestroyed: boolean = null;
//***********************************************************************************************/
//*************************************** Private methods definitions ***************************/
//***********************************************************************************************/
    private _applyTextShaderSettings(): void {
        //******************* Text-shader setup
        this._textShader = new Shader();
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
        let final_mat: glm.mat4 = glm.mat4.create();
        glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
        let _model: glm.mat4 = glm.mat4.create();

        this._textShader.bind();
        //Update uniform variable (projection matrix) in shader
        let location: WebGLUniformLocation = this._textShader.getUniformLocation("projectionView");
        if (location != -1) gl.uniformMatrix4fv(location, false, final_mat);
        //**********************************************************
        //Update uniform variable (modelView matrix) in shader
        location = this._textShader.getUniformLocation("modelTransform");
        if (location != -1) gl.uniformMatrix4fv(location, false, _model);
        //*********************************************************
        //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
        let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
        location = this._textShader.getUniformLocation("lightDirection");
        if (location !== -1) gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
        //*******************************************************************************
        // //Update uniform variable (camera position) in shader
        location = this._textShader.getUniformLocation("cameraPosition");
        let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
        if (location != -1) gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        //*********************************************************************************
        //Update uniform variable (vDiffuse) in shader
        location = this._textShader.getUniformLocation("vDiffuse");
        if (location != -1) gl.uniform3f(location, 0.8, 0, 0.002118);
        //***************************************************
        //Update uniform variable (vSpecular) in shader
        location = this._textShader.getUniformLocation("vSpecular");
        if (location != -1) gl.uniform3f(location, 1.0, 1.0, 1.0);
        //********************************************************
        //Update uniform variable (vSpecularExponent) in shader
        location = this._textShader.getUniformLocation("vSpecularExponent");
        if (location != -1) gl.uniform1f(location, 233.333333);
        this._textShader.unbind();
        //********************************************************************
    }
    private _applyParticleShaderSettings(): void {
        //*************************** Brownian-particle-shader setup
        this._particleShader = new Shader();
        let vertParticleSource: string =
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
        //Fragment shader for rendering brownian particles
        let fragParticleSource: string =
            "#version 300 es\n\
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
        let final_mat: glm.mat4 = glm.mat4.create();
        glm.mat4.multiply(final_mat, this._defaultProj, this._defaultView);
        let _model: glm.mat4 = glm.mat4.create();
        this._particleShader.bind();
        //Update uniform variable (projection matrix) in shader
        let location: WebGLUniformLocation = this._particleShader.getUniformLocation("projectionView");
        if (location != -1) gl.uniformMatrix4fv(location, false, final_mat);
        //**********************************************************
        //Update uniform variable (modelView matrix) in shader
        location = this._particleShader.getUniformLocation("modelTransform");
        if (location != -1) gl.uniformMatrix4fv(location, false, _model);
        //*********************************************************
        //Update particle color uniform ****************************
        location = this._particleShader.getUniformLocation("particleColor");
        if (location !== -1) gl.uniform4f(location, 1.0, 1.0, 1.0, 1.0);
        //************************************************************
        //Update angle variable
        location = this._particleShader.getUniformLocation("angle");
        if (location !== -1) gl.uniform1f(location, this._frameCount % 360);
        //********************************************************************
        //Update flickering variable
        location = this._particleShader.getUniformLocation("isFlickering");
        if (location !== -1) gl.uniform1f(location, 0.0);
        //********************************************************************
        //Update Lightdirection calculated from latitude and longitude in OpenGL coordinate system
        let lightDir = this._getGlCompatibleCoordinate(1, this._lightDirLatitude, this._lightDirLongitude);
        location = this._particleShader.getUniformLocation("lightDirection");
        if (location !== -1) gl.uniform3f(location, lightDir[0], lightDir[1], lightDir[2]);
        //*******************************************************************************
        // //Update uniform variable (camera position) in shader
        location = this._particleShader.getUniformLocation("cameraPosition");
        let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
        if (location != -1) gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        //*********************************************************************************
        // Apply default material property
        this._particleShader.applyMaterial(this._defaultParticleMaterial);

        this._particleShader.unbind();
        //**********************************************
    }
    private _applyDefaultCanvasSetting(): void {
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        let w = $(`#${this._configuration.CanvasParentID}`).width();
        let h = $(`#${this._configuration.CanvasParentID}`).height();
        if (this._canvas !== null) {
            this._canvas.width = w;
            this._canvas.height = h;
            this._updateCanvasPerspective(w, h);
        }
    }
    private _applyDefaultHTMLSettings(): void {
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
                if (displayStyle !== undefined && displayStyle !== 'none') $(parentID).attr('data-display', displayStyle);
                else $(parentID).attr('data-display', 'block');
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
                    if (displayStyle !== undefined && displayStyle !== 'none') $(parentID).attr('data-display', displayStyle);
                    else $(parentID).attr('data-display', 'block');
                    $(parentID).attr("disabled", 1);
                    $(parentID).css('display', 'none');
                }
            };
        }
        let menuIDs = [this._configuration.OutsideMenuDivisionID, this._configuration.InsideMenuDivisionID];
        for (let id of menuIDs) {
            if (id) {
                let displayStyle = $(`#${id}`).css('display');
                if (displayStyle !== undefined && displayStyle !== 'none') $(`#${id}`).attr('data-display', displayStyle);
                else $(`#${id}`).attr('data-display', 'block');
            }
        }
        let displayStyle = $(`#${this._configuration.InsideMenuDivisionID}`).css('display');
        if (displayStyle !== undefined && displayStyle !== 'none') $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', displayStyle);
        else $(`#${this._configuration.InsideMenuDivisionID}`).attr('data-display', 'block');
        $(`#${this._configuration.InsideMenuDivisionID}`).css('display', 'none');
        displayStyle = $(`#${this._configuration.HorizontalPanelID}`).css('display');
        if (displayStyle !== undefined && displayStyle !== 'none') $(`#${this._configuration.HorizontalPanelID}`).attr('data-display', displayStyle);
        else $(`#${this._configuration.HorizontalPanelID}`).attr('data-display', 'block');
        $(`#${this._configuration.HorizontalPanelID}`).css("display", 'none');
        let allColors = colorList.keys(); //Fetch list of all possible color values. Must contain at least ListOfColorSelectorID.length many colors.
        if (colorList.size < this._configuration.ListOfColorSelectorID.length) {
            alert("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
            throw new Error("Number of player color selectors exceeds maximum allowed value " + this._configuration.ListOfColorSelectorID.length.toString() + ".");
        }
        for (let i = 0; i < colorList.size; i++) {
            let color = allColors.next().value;
            color = color.charAt(0).toUpperCase() + color.slice(1);
            for (let id of this._configuration.ListOfColorSelectorID) {
                let selectObj = $(`#${id}`);
                selectObj.append($('<option>', {
                    text: color
                }));
            }
            if (i < this._configuration.ListOfColorSelectorID.length) $(`#${this._configuration.ListOfColorSelectorID[i]}`).val(color);
        }
        $(`#${this._configuration.HtmlMenuButtonID}`).removeAttr('disabled');
        $(`#${this._configuration.HorizontalPanelID}`).css('visibility', 'visible');
        $(`#${this._configuration.UndoButtonMobileID}`).css('visibility', 'visible');
    }
    private _bindGameEngineWithHTML(): void {
        $(window).resize(this, eventObject => {eventObject.data.resize();});
        $(`#${this._configuration.NumberOfPlayersSelectorID}`).on('change', this._onPlayerSelection.bind(this));
        $(`#${this._configuration.MainmenuButtonID}`).on('click', this._onButtonMainMenu.bind(this));
        $(`#${this._configuration.NewGameButtonID}`).on('click', this._onButtonNewGame.bind(this));
        $(`#${this._configuration.UndoButtonID}`).on('click', this._onButtonUndo.bind(this));
        $(`#${this._configuration.UndoButtonMobileID}`).on('click', this._onButtonUndo.bind(this));
        $(`#${this._configuration.ColorSequenceMenuID}`).on('click', this._onButtonColSeq.bind(this));
        $(`#${this._configuration.StartGameButtonID}`).on('click', this._onButtonStart.bind(this));
        $(`#${this._configuration.HtmlMenuButtonID}`).on('click', this._onMenuButtonClick.bind(this));
        $(this._canvas).on('click', (event => { this._onMouseClickOnCanvas(event.offsetX, event.offsetY) }).bind(this));
        $(this._canvas).on('mousedown', (event => { this._onMouseDown(event.offsetX, event.offsetY) }).bind(this));
        $(this._canvas).on('mousemove', (event => { this._onMouseDragging(event.offsetX, event.offsetY) }).bind(this));
        $(window).on('mouseup', (event => { this._onMouseUp(event.offsetX, event.offsetY) }).bind(this));
    }
    private _getGlCompatibleCoordinate(radius: number, latitudeDegree: number, longitudeDegree: number): glm.vec3 { return glm.vec3.fromValues(radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))); };
    private _initDefaultVariables(): void {
        this._defaultView = glm.mat4.create();
        this._defaultProj = glm.mat4.create();
        let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
        glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
        if (this._sampleSphere == null) this._sampleSphere = new Sphere();
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
            let particle: Particle = <Particle>{};
            particle.position = [x, y, z];
            particle.color = [r, g, b];
            particle.isFlickering = Math.random() > 0.65 ? true : false;
            this._particleData.push(particle);
        }
    }
    private _onButtonColSeq(): void {
        let allPlayers = this._game.getPlayerList();
        let colorSequence = "Current order of players:\n";
        allPlayers.forEach((player, index) => {
            if (!this._game.isEliminated(player)) colorSequence += `Player ${index + 1}: ${player}\n`;
        });
        alert(colorSequence);
    }
    private _onButtonMainMenu(): void {
        let result = window.confirm("Current game will be lost. Continue?");
        if (!result) return;
        this._gameData.quitCurrentGame = true;
        this._gameData.isGameRunning = false;
        this._gameData.isMouseDataProcessed = true;
    }
    private _onButtonNewGame(): void {
        let result = window.confirm("New game will start. Continue?");
        if (!result) return;
        this._gameData.isGameRunning = false;
        this._gameData.isMouseDataProcessed = true;
        this._gameData.startNewGame = true;
    }
    private _onButtonStart(): void {
        let numberOfColumnsString: string = $(`#${this._configuration.NumberOfColumnSelectorID}`).val();
        let numberOfRowsString: string = $(`#${this._configuration.NumberOfRowSelectorID}`).val();
        let numberOfPlayersString: string = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
        let playerList: Array<string> = [];
        let numberOfColumns = Number(numberOfColumnsString);
        let numberOfRows = Number(numberOfRowsString);
        let numberOfPlayers = Number(numberOfPlayersString);
        if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
            alert("Invalid number of players.")
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
    private _onButtonUndo(): void {
        if (!this._game.isBlastAnimationRunning) this._game.undo();
    }
    private _offlineGameLoop(deltaTime: number): void{
        if (!this._gameData.isMouseDataProcessed) {
            let boardCoordinate = this._game.getBoardCoordinates(this._gameData.mouseX, this._gameData.mouseY);
            if (boardCoordinate[0] >= 0 && boardCoordinate[1] >= 0) this._game.processPlayerInput(boardCoordinate[0], boardCoordinate[1]);
            this._gameData.isMouseDataProcessed = true;
        }
        let hasGameEnded: boolean = this._game.drawBoard(deltaTime);
        if (hasGameEnded) {
            this._game.resetGameVariables();
            this._gameData.isGameRunning = false;
            this._gameData.isMouseDataProcessed = true;
            this._showGamePanel(false);
            this._applyDefaultCanvasSetting();
        }
    }
    private _onMenuButtonClick(): void {
        if ($(`#${this._configuration.VerticalMenubarID}`).attr("data-state") == "0") {
            $(`#${ this._configuration.VerticalMenubarID }`).attr("data-state", "1");
            $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
            $(`#${this._configuration.VerticalMenubarID}`).slideDown(300);
            $(`#${this._configuration.BlockViewDivisionID}`).slideDown(300);
        }
        else {
            $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "0");
            $(`#${this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9660;");
            $(`#${this._configuration.VerticalMenubarID}`).slideUp(300);
            $(`#${ this._configuration.BlockViewDivisionID}`).slideUp(300);
        }
    }
    private _onMouseClickOnCanvas(posX: number, posY: number): void {
        if (this._gameData.isGameRunning && this._gameData.isMouseDataProcessed) {
            this._gameData.mouseX = posX;
            this._gameData.mouseY = posY;
            this._gameData.isMouseDataProcessed = false;
        }
    }
    private _onMouseDown(posX: number, posY: number): void {
        this._mouseDown = true;
        this._isDragging = false;
        this._currentMouseX = posX;
        this._currentMouseY = posY;
    }
    private _onMouseDragging(posX: number, posY: number): void {
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
    private _onMouseUp(posX: number, posY: number): void {
        this._currentMouseX = posX;
        this._currentMouseY = posY;
        this._mouseDown = false;
        this._isDragging = false;
    }
    private _onPlayerSelection(): void {
        let numberOfPlayersString: string = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
        let numberOfPlayers: number = Number(numberOfPlayersString);
        if (numberOfPlayers === Number.NaN || numberOfPlayers > this._configuration.ListOfColorSelectorID.length) {
            alert("Invalid number of players.");
            throw new Error("Invalid number of players.");
        }
        for (let i: number = 0; i < this._configuration.ListOfColorSelectorID.length; i++) {
            let id: string = `#${this._configuration.ListOfColorSelectorID[i]}`;
            let parentID: string = null;
            if (this._configuration.ListOfColorSelectorParentID) parentID = `#${this._configuration.ListOfColorSelectorParentID[i]}`; 
            if (i < numberOfPlayers) {
                $(id).removeAttr('disabled');
                $(id).css('visibility', 'visible');
                if (parentID) {
                    $(parentID).removeAttr('disabled');
                    let displayStyle = $(parentID).attr('data-display');
                    if (displayStyle !== undefined) $(parentID).css('display', displayStyle);
                    else $(parentID).css('display', 'block');
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
    private _showGamePanel(show: boolean): void {
        if (show) {
            $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", "none");
            let idList = [this._configuration.InsideMenuDivisionID, this._configuration.HorizontalPanelID, this._configuration.UndoButtonMobileID];
            for (let id of idList) {
                let displayStyle = $(id).attr('data-display');
                if (displayStyle !== undefined) $(id).css('display', displayStyle);
                else $(`#${id}`).css("display", 'block');
            }
        }
        else {
            $(`#${this._configuration.InsideMenuDivisionID}`).css("display", "none");
            $(`#${this._configuration.HorizontalPanelID}`).css("display", "none");
            $(`#${this._configuration.UndoButtonMobileID}`).css("display", "none");
            let displayStyle = $(`#${this._configuration.OutsideMenuDivisionID}`).attr('data-display');
            if (displayStyle !== undefined) $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", displayStyle);
            else $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", 'block');
        }
    }
    private _startMainLoop(): void {
        if (!this.isEngineRunning) return;
        this._frameCount++;
        let deltaTime = Math.abs(this._beginFrame - this._endFrame);
        this._endFrame = this._beginFrame;
        this._beginFrame = new Date().getTime();
        if (this._configuration.FrameCounterID) {
            $(`#${this._configuration.FrameCounterID}`).html(`Frame: ${this._frameCount}`);
        }
        if (this._gameData.isGameRunning) this._offlineGameLoop(deltaTime);
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
        else this._renderDefaultScene(deltaTime);
        requestAnimationFrame(this._startMainLoop.bind(this));
    }
    private _renderDefaultScene(deltaTime: number): void {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        let angle: number = - 60 * Math.cos(0.015 * this._frameCount % 360);
        this._textShader.bind();
        let location = this._textShader.getUniformLocation("modelTransform");
        if (location != -1) this._textObject.drawLine(this._textShader, location, "WELCOME TO THE WORLD\nOF\nCHAIN REACTION", glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, angle, 0), "center", "center");
        this._textShader.unbind();
        this._particleShader.bind();
        location = this._particleShader.getUniformLocation("angle");
        if (location != -1) gl.uniform1f(location, angle);
        this._particleShader.unbind();
        this._updateBrownianParticleMotion();
    }
    private _updateCanvasPerspective(width: number, height: number): void {
        gl.viewport(0, 0, width, height);
        this._defaultProj = glm.mat4.create();
        glm.mat4.perspective(this._defaultProj, Math.PI * 45.0 / 180.0, width / height, 1.0, 100.0);
    }
    private _updateCameraView(): void {
        let cameraPosition = this._getGlCompatibleCoordinate(this._cameraDistance, this._cameraLatitude, this._cameraLongitude);
        glm.mat4.lookAt(this._defaultView, cameraPosition, this._cameraTarget, this._cameraUp);
        let final_mat = glm.mat4.multiply(glm.mat4.create(), this._defaultProj, this._defaultView);
        this._textShader.bind();
        //******************************************** Update projection matrix
        let location = this._textShader.getUniformLocation("projectionView");
        if (location != -1) gl.uniformMatrix4fv(location, false, final_mat);
        //***********************************************************************
        //**********************************Update uniform variable (camera position) in shader
        location = this._textShader.getUniformLocation("cameraPosition");
        if (location != -1) gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        //***************************************************************
        this._textShader.unbind();
        this._particleShader.bind();
        //******************************************** Update projection matrix
        location = this._particleShader.getUniformLocation("projectionView");
        if (location != -1) gl.uniformMatrix4fv(location, false, final_mat);
        //*****************************************************************************
        //**********************************Update uniform variable (camera position) in shader
        location = this._particleShader.getUniformLocation("cameraPosition");
        if (location != -1) gl.uniform3f(location, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        //****************************************************************
        this._particleShader.unbind();
    }
    private _updateBrownianParticleMotion() {
        this._particleShader.bind();
        let modelTransformlocation: WebGLUniformLocation = this._particleShader.getUniformLocation("modelTransform");
        let colorLocation: WebGLUniformLocation = this._particleShader.getUniformLocation("particleColor");
        let flickeringLocation: WebGLUniformLocation = this._particleShader.getUniformLocation("isFlickering");
        for (let i = 0; i < this._mNumParticles; i++) {
            let model: glm.mat4 = glm.mat4.create();
            glm.mat4.translate(model, model, this._particleData[i].position);
            if (modelTransformlocation !== -1) gl.uniformMatrix4fv(modelTransformlocation, false, model);
            if (flickeringLocation !== -1) gl.uniform1f(flickeringLocation, this._particleData[i].isFlickering ? 1.0 : 0.0);
            if (colorLocation != -1) gl.uniform4f(colorLocation, this._particleData[i].color[0], this._particleData[i].color[1], this._particleData[i].color[2], 1.0);
            this._sampleSphere.draw(1);
            let distance: number = glm.vec3.length(this._particleData[i].position);
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
    public configure(config: OfflineEngineConfiguration) {
        if (this._configuration === null) { //If no configuration yet exists, copy everything
            this._configuration = Object.assign({}, config);
            return;
        }
        //Else update only those that are specified in config.
        Object.assign(this._configuration, config);
    }
    constructor(config: OfflineEngineConfiguration) {
        this.configure(config);
        if (!this.isConfigured()) {
            alert("Failed to configure engine instance. Perhaps forgot to specify all properties correctly?");
            throw new Error("Engine was not configured correctly.");
        }
        if (config.NumberOfBrownianParticles) this._mNumParticles = config.NumberOfBrownianParticles;
    }
    public destroy(): void {
        if (this._isDestroyed == true) return;
        if (this.isEngineRunning) this.stop();
        this._gameData = {
            isGameRunning: false,
            quitCurrentGame: false,
            startNewGame: false,
            isMouseDataProcessed: true,
            mouseX: null,
            mouseY: null
        }
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
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
    public isConfigured(): boolean {
        if (!this._configuration) return false;
        if (!this._configuration.AudioElementID) return false;
        if (!this._configuration.BoardDimLabelID) return false;
        if (!this._configuration.BlockViewDivisionID) return false;
        if (!this._configuration.CanvasElementID) return false;
        if (!this._configuration.CanvasParentID) return false;
        //if (!this._configuration.CanvasViewBlockerID) return false; //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
        if (!this._configuration.ColorSequenceMenuID) return false;
        if (!this._configuration.CurrentPlayerLabelID) return false;
        if (!this._configuration.CurrentPlayerMobileLabelID) return false;
        //if (!this._configuration.DefaultMaterialForParticles) return false; //DefaultMaterialForParticles specification is optional for game engine
        //if (!this._configuration.DefaultNumberOfColumn) return false; //DefaultNumberOfColumn specification is optional for game engine
        //if (!this._configuration.DefaultNumberOfRow) return false; //DefaultNumberOfRow specification is optional for game engine
        //if (!this._configuration.FrameCounterID) return false; //FrameCounterID specification is optional for game engine
        if (!this._configuration.HtmlMenuButtonID) return false;
        if (!this._configuration.HorizontalPanelID) return false;
        if (!this._configuration.InsideMenuDivisionID) return false;
        if (!this._configuration.ListOfColorSelectorID) return false;
        if (this._configuration.ListOfColorSelectorParentID) { //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`. If provided, must have same number of ids as in `ListOfColorSelectorID`
            if (this._configuration.ListOfColorSelectorParentID.length != this._configuration.ListOfColorSelectorID.length) return false;
        }
        if (!this._configuration.ListOfResourceNames) return false;
        if (!this._configuration.MainmenuButtonID) return false;
        //if (!this._configuration.MessageBoxID) return false; //MessageBoxID specification is optional.
        if (!this._configuration.NewGameButtonID) return false;
        //if (!this._configuration.NumberOfBrownianParticles) return false; //NumberOfBrownianParticles specification is optional.
        if (!this._configuration.NumberOfColumnSelectorID) return false;
        if (!this._configuration.NumberOfPlayersLabelID) return false;
        if (!this._configuration.NumberOfPlayersSelectorID) return false;
        if (!this._configuration.NumberOfRowSelectorID) return false;
        if (!this._configuration.OutsideMenuDivisionID) return false;
        if (!this._configuration.StartGameButtonID) return false;
        if (!this._configuration.PathToResource) return false;
        //if (!this._configuration.ProgressBarID) return false; //Optional, ID of the progress bar element.
        if (!this._configuration.UndoButtonID) return false;
        if (!this._configuration.UndoButtonMobileID) return false;
        if (!this._configuration.VerticalMenubarID) return false;
        return true;
    }
    public get isEngineRunning(): boolean { return this._isEngineRunning; }
    public start(alphabetMeshMap: OBJ.MeshMap, materialLibraryData: string): void {
        this._applyDefaultHTMLSettings();
        //Parse the matrial data
        this._currentMaterialLibrary = new OBJ.MaterialLibrary(materialLibraryData);
        let defaultMaterial = this._currentMaterialLibrary.materials[this._configuration.DefaultMaterialForParticles];
        if (defaultMaterial) Object.assign(this._defaultParticleMaterial, defaultMaterial);
        if (this._canvas == null) this._canvas = glUtilities.intialize(this._configuration.CanvasParentID, this._configuration.VerticalMenubarID, this._configuration.CanvasElementID);
        if (this._game == null) {
            let gameConfig: OfflineGameConfiguration = <OfflineGameConfiguration>{};
            gameConfig.AudioElementID = this._configuration.AudioElementID;
            gameConfig.CurrentPlayerLabelElementID = this._configuration.CurrentPlayerLabelID;
            gameConfig.CurrentPlayerLabelMobileElementID = this._configuration.CurrentPlayerMobileLabelID;
            this._game = new MainGame(gameConfig);
        }
        //Add the material data to each alphabet mesh and add them to alphabet list
        this._alphabetMeshData.clear();
        for (let meshName of Object.keys(alphabetMeshMap)) {
            alphabetMeshMap[meshName].addMaterialLibrary(this._currentMaterialLibrary);
            let meshData: MeshData = new MeshData(alphabetMeshMap[meshName]);
            this._alphabetMeshData.set(meshName, meshData);
        }
        this._initDefaultVariables();
        this._applyDefaultCanvasSetting();
        //********************************************************************************
        //******* Apply default settings for text rendering
        if (this._textShader === null) this._applyTextShaderSettings();
        //********* Apply default settings for particle rendering
        if (this._particleShader === null) this._applyParticleShaderSettings();
        this._updateCameraView();
        this._textObject = new TextObject(1.2, 1.0, 2.1, this._alphabetMeshData);
        this._bindGameEngineWithHTML();
        this._isDestroyed = false;
        if (!this.isEngineRunning) {
            this._isEngineRunning = true;
            this._startMainLoop();
        }
    }
    public stop(): void { this._isEngineRunning = false; }
    public resize(): void {
        if (($(window).width() > 600) && ($(`#${this._configuration.VerticalMenubarID}`).css("display")=="none")) {
            $(`#${this._configuration.VerticalMenubarID}`).css("display", "block");
            $(`#${this._configuration.BlockViewDivisionID}`).css("display", "block");
            $(`#${this._configuration.VerticalMenubarID}`).attr("data-state", "1");
            $(`#${ this._configuration.HtmlMenuButtonID}`).html("Menu&nbsp;&#9650;");
        }
        let w = $(`#${this._configuration.CanvasParentID}`).width();
        let h = $(`#${ this._configuration.CanvasParentID}`).height();
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
    public radians(degree: number): number { return Math.PI * degree / 180; }
    public degrees(radian: number): number { return 180 * radian / Math.PI }
}