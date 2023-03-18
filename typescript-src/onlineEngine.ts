import $ = require("jquery");
import PusherTypes = require("pusher-js");
import Pusher from "pusher-js"
import glm = require("gl-matrix");
import OBJ = require("webgl-obj-loader");
import { Particle } from "./offlineEngine";
import { gl, glUtilities } from "./gl";
import { MeshData } from "./MeshContainer";
import { colorList } from "./offlineMaingame";
import { OnlineGameConfiguration, OnlineMainGame } from "./onlineMaingame";
import { Shader } from "./Shader";
import { Sphere } from "./Sphere";
import { TextObject } from "./Text";
import { PriorityQueue, QueueElement } from "./priorityQueue";
export interface PusherConfigurationOptions { app_key: string, encrypted?: boolean, cluster: string, userAuthentication: any, channelAuthorization: any };

/** 
* An interface specifying element IDs to bind functions from the online multiplayer game engine with the elements in HTML document.
* @property AudioElementID: ID of the html audio element containing the audio resources.
* @property BoardDimLabelID: ID of the html label element displaying the current board dimension (row & column).
* @property BlockViewDivisionID: ID of the div which blocks the background after opening the vertical Menu (applicable to media with smaller screen size such as mobile).
* @property CanvasViewBlockerID: Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
* @property CanvasElementID: ID of the HTML canvas element on which the game engine uses.
* @property CanvasParentID: ID of the parent of HTML canvas element on which the game engine uses.
* @property ColorSequenceMenuID: ID of the popup menu button which displays the order of player turns in a running game.
* @property CurrentPlayerLabelID: ID of the label displaying name of the current player in a running game (applicable to media with bigger screen size).
* @property CurrentPlayerMobileLabelID : ID of the label displaying name of the current player in a running game (applicable to media with smaller screen size).
* @property DefaultMaterialForParticles: Optional, Name of the default material for brownian particles. The material must be defined in the provided .mtl data. 
* @property DefaultNumberOfColumn: Optional, Default number of columns in board.
* @property DefaultNumberOfRow: Optional, Default number of rows in board.
* @property FrameCounterID: Optional, ID of the div in html document containing the frame count.
* @property HtmlMenuButtonID: ID of the html Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile).
* @property HorizontalPanelID: ID of the div in html containing current player information (applicable to media with smaller screen size).
* @property InsideMenuDivisionID: ID of the div in html which contains menu options that are available after starting a game.
* @property ListOfColorSelectorID: Array containing the IDs for the color selectors associated with each player.
* @property ListOfColorSelectorParentID: Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
* @property ListOfResourceNames: A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
* @property ListOfHorizontalPanelID: An array containing IDs of the div elements in html containing current player information(applicable to media with smaller screen size).
* @property LogoutButtonID: ID of the logout button
* @property LogoutButtonMobileID: Optional, ID of the logout button in mobile view (applicable to media with smaller screen size).
* @property LogoutPath: Path to the logout url
* @property MainmenuButtonID: ID of the html button which stops a running game and goes back to the main menu.
* @property MessageBoxID: ID of the html element displaying interactive messages from engine to the html document.
* @property NewGameButtonID: ID of the html button which stops a running game and starts a new one.
* @property NumberOfBrownianParticles: Optional, Default number of brownian particles in the canvas background.
* @property NumberOfColumnSelectorID: ID of the selector that provides number of columns in the game board.
* @property NumberOfRowSelectorID: ID of the selector that provides number of rows in the game board.
* @property NumberOfPlayersLabelID: ID of the label displaying total number of players in a running game.
* @property NumberOfPlayersSelectorID: ID of the selector for choosing number of players.
* @property OutsideMenuDivisionID: ID of the div in html which contains menu options that are available before starting a game.
* @property PageTokenID: Optional, ID of the html element containing the authentication token of the page. This is needed if the html page requires authentication with the server before every request.
* @property PathToResource: Path to the '.obj' and '.mtl' files specified in ListOfResourceNames.
* @property PositionLabelID: ID of the html label displaying player's position in the game.
* @property PositionMobileLabelID: ID of the html label displaying player's position in the game (applicable to media with smaller screen size).
* @property ProgressBarID: Optional, ID of the progress bar element.
* @property StartGameButtonID: ID of the button which start a game.
* @property VerticalMenubarID: ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC)
*/
export interface OnlineEngineConfiguration {
    AudioElementID: string, //ID of the html audio element containing the audio resources.
    BoardDimLabelID: string, //ID of the html label element displaying the current board dimension (row & column).
    BlockViewDivisionID: string, //ID of the div which blocks the background after opening the vertical Menu (applicable to media with smaller screen size such as mobile)
    CancelRequestGameButtonID: string, //ID of the button which cancels an already sent game request to the server.
    CanvasViewBlockerID?: string, //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container. 
    CanvasElementID: string, //ID of the HTML canvas element on which the game engine uses.
    CanvasParentID: string, //ID of the parent of HTML canvas element on which the game engine uses.
    ColorSequenceMenuID: string, //ID of the popup menu button which displays the order of player turns in a running game.
    CommandForCancellingGameSearch: string, //The server command for cancelling an ongoing search for a game in the server.
    CommandForResettingGameState: string, //The server command for resetting game state to the default in the server.
    CommandForSearchingGame: string, //The server command for requesting a game from the server.
    CommandForStartingGame: string, //The server command for telling the server to start the game once a lobby is full.
    CommandForUpdatingMove: string, //The server command for updating player's turn-state (isWaitingForMove) in the server.
    CommandForQuittingCurrentGame: string, //The command for quitting an ongoing game play in the server.
    CurrentPlayerLabelID: string, //ID of the label displaying name of the current player in a running game (applicable to media with bigger screen size).
    CurrentPlayerMobileLabelID: string, //ID of the label displaying name of the current player in a running game (applicable to media with smaller screen size).
    DefaultMaterialForParticles?: string, //Optional, Name of the default material for brownian particles.The material must be defined in the provided.mtl data.
    DefaultNumberOfColumn?: number, //Optional, Default number of columns in board.
    DefaultNumberOfRow?: number, //Optional, Default number of rows in board.
    FrameCounterID?: string, //Optional, ID of the div in html document containing the frame count.
    HtmlMenuButtonID: string,  //ID of the html Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile)
    InsideMenuDivisionID: string, //ID of the div in html which contains menu options that are available after starting a game.
    ListOfColorSelectorID: Array<string>, //Array containing the IDs for the color selectors associated with each player.
    ListOfColorSelectorParentID: Array<string>, //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
    ListOfHorizontalPanelID: Array<string>, //array containing IDs of the div elements in html containing current player information(applicable to media with smaller screen size).
    ListOfResourceNames: Array<string>, // A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
    LogoutButtonID: string, //ID of the logout button
    LogoutButtonMobileID?: string, //Optional, ID of the logout button in mobile view(applicable to media with smaller screen size).
    LogoutPath: string, //Path to the logout url
    MainmenuButtonID: string, //ID of the html button which stops a running game and goes back to the main menu.
    MessageBoxID?: string, //Optional, ID of the html element displaying interactive messages from engine to the html document.
    NewGameButtonID: string, //ID of the html button which stops a running game and starts a new one.
    NumberOfBrownianParticles?: number, //Optional, Default number of brownian particles in the canvas background.
    NumberOfColumnSelectorID: string, //ID of the selector that provides number of columns in the game board.
    NumberOfRowSelectorID: string, //ID of the selector that provides number of rows in the game board.
    NumberOfPlayersLabelID: string, //ID of the label displaying total number of players in a running game.    
    NumberOfPlayersSelectorID: string, //ID of the selector for choosing number of players.
    OutsideMenuDivisionID: string, //ID of the div in html which contains menu options that are available before starting a game.
    PageTokenID?: string, //Optional, ID of the html element containing the authentication token of the page.
    PathToResource: string, //Path to the '.obj' and '.mtl' files specified in ListOfResourceNames.
    PositionLabelID: string, //ID of the html label displaying player's position in the game.
    PositionMobileLabelID: string, //ID of the html label displaying player's position in the game (applicable to media with smaller screen size).
    ProgressBarID?: string, //Optional, ID of the progress bar element.
    PusherSettings: PusherConfigurationOptions, //Pusher settings for connecting to the pusher client.
    RequestGameButtonID: string, //ID of the button which sends request to the server for a game.
    ServerEndpoint: string, //The endpoint to the game server for sending game-data.
    ServerMessageFieldID: string, //ID of the html field where server/engine post updates.
    VerticalMenubarID: string //ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC).
};
export interface OnlineGameState {
    isGameRunning: boolean,
    isWaitingForGame: boolean,
    isWaitingForMove: boolean,
    totalPlayers: number,
    onlinePosition: number,
    channel: string,
    rows: number,
    columns: number
}
interface BoardInput {
    onlinePosition: number,
    boardCoordinate: { x: number, y: number },
    inputNumber: number,
    isItALocalMove: boolean //A boolean flag to determine if the input is a local move or a remote one.
}

export class OnlineEngine {
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
    private _currentPusherChannel: PusherTypes.PresenceChannel = null;
    private _defaultParticleMaterial: OBJ.Material = <OBJ.Material>{};
    private _defaultProj: glm.mat4 = null;
    private _defaultView: glm.mat4 = null;
    private _lightDirLatitude: number = 0.0; //Latitude and longitude determine the direction, not the light position. Light Direction == target position - light position
    private _lightDirLongitude: number = 180.0;
    private _mNumParticles: number = 30;
    private _particleData: Array<Particle> = null;
    private _particleShader: Shader = null;
    private _personalUserChannel: PusherTypes.Channel = null;
    private _pusherClient: Pusher;
    private _pusherModule: any;
    private _sampleSphere: Sphere = null;
    private _textObject: TextObject = null;
    private _textShader: Shader = null;
//********************************************************************************* */
    private _canvas: HTMLCanvasElement = null;
    private _configuration: OnlineEngineConfiguration = null; //Configuration settings for linking the engine with the server and the html document. 
    private _eventNameForStartingGame: string = null;
    private _eventNameForBroadcastingInputs: string = 'incoming-input';
    private _eventNameForRequestingInputs: string = 'send-your-input'
    private _eventNameForSendingBeacon: string = 'I-am-ready-to-start!';
    private _game: OnlineMainGame = null;
    private _gameData: OnlineGameState = { //The game state which controls the flow of the engine.
        isGameRunning: false,
        isWaitingForGame: false,
        isWaitingForMove: false,
        totalPlayers: null,
        onlinePosition: null,
        channel: null,
        rows: null,
        columns: null
    };
    private _isAjaxRequestSentToTriggerGame: boolean = null;
    private _isBoardInputProcessedByEngine: boolean = null; //A boolean flag to determine if the last input fed into the game is processed by engine too or not.
    private _isDestroyed: boolean = null;
    private _isReadyToStartNewGame: boolean = null;
    private _lastInputProcessingTime: number //the timestamp (in milisecond) when this input is processed
    private _listOfConfirmedPlayers: Map<number, boolean>;
    private _listOfPendingInputs: PriorityQueue; //A queue to contain (both local and remote) incoming player input.
    private _listOfProcessedInputs: Map<number, BoardInput>; //A map to store full history of moves.
    private _processedBoardInput: BoardInput = null; //contains the last board input fed into the game.
    private _winningMaterial: OBJ.Material = null;
//************************************************************************************************** */
//**************************************** Private method definitions ******************************/
//*************************************************************************************************** */
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
        for (let id of this._configuration.ListOfHorizontalPanelID) {
            displayStyle = $(`#${id}`).css('display');
            if (displayStyle !== undefined && displayStyle !== 'none') $(`#${id}`).attr('data-display', displayStyle);
            else $(`#${id}`).attr('data-display', 'block');
            $(`#${id}`).css("display", 'none');
        }
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
        //********************** Disable all buttons except logout. The buttons will be enabled again after a successful engine start */
        if (this._configuration.RequestGameButtonID) $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
        if (this._configuration.CancelRequestGameButtonID) $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
        $(`#${this._configuration.HtmlMenuButtonID}`).removeAttr('disabled');
        for (let id of this._configuration.ListOfHorizontalPanelID) {
            $(`#${id}`).css('visibility', 'visible');
        }
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
    private _bindGameEngineWithHTML(): void {
        $(window).resize(this, eventObject => { eventObject.data.resize(); });
        $(`#${this._configuration.NumberOfPlayersSelectorID}`).on('change', this._onPlayerSelection.bind(this));
        $(`#${this._configuration.MainmenuButtonID}`).on('click', this._onButtonMainMenu.bind(this));
        $(`#${this._configuration.ColorSequenceMenuID}`).on('click', this._onButtonColSeq.bind(this));
        $(this._canvas).on('click', (event => { this._onMouseClickOnCanvas(event.offsetX, event.offsetY) }).bind(this));
        $(this._canvas).on('mousedown', (event => { this._onMouseDown(event.offsetX, event.offsetY) }).bind(this));
        $(this._canvas).on('mousemove', (event => { this._onMouseDragging(event.offsetX, event.offsetY) }).bind(this));
        $(window).on('mouseup', (event => { this._onMouseUp(event.offsetX, event.offsetY) }).bind(this));
        $(`#${this._configuration.RequestGameButtonID}`).on('click', this._onButtonSearchGame.bind(this));
        $(`#${this._configuration.CancelRequestGameButtonID}`).on('click', this._onButtonCancelSearch.bind(this));
        $(`#${this._configuration.HtmlMenuButtonID}`).on('click', this._onMenuButtonClick.bind(this));
    }
    private _getGlCompatibleCoordinate(radius: number, latitudeDegree: number, longitudeDegree: number): glm.vec3 { return glm.vec3.fromValues(radius * Math.sin(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree)), radius * Math.sin(this.radians(latitudeDegree)), radius * Math.cos(this.radians(longitudeDegree)) * Math.cos(this.radians(latitudeDegree))); };
    private _getMyGamePositionFromChannel(): number {
        if (!(this._currentPusherChannel && this._currentPusherChannel.subscribed)) return -1;
        let position = 1;
        let mySubscriptionTime: number = Number(this._currentPusherChannel.members.me.info.subscription_time);
        if (mySubscriptionTime === Number.NaN || mySubscriptionTime === undefined) return -1;
        this._currentPusherChannel.members.each(member => {
            let otherTime: number = Number(member.info.subscription_time);
            if (otherTime === Number.NaN || otherTime === undefined) return -1;
            if (otherTime < mySubscriptionTime) position++;
        });
        return position;
    }
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
    private _onButtonCancelSearch(): void {
        if (!this._pusherClient) return;
        if (this._gameData.isGameRunning || !(this._gameData.isWaitingForGame)) {
            alert("You cannot cancel a non-existent game search.");
            return;
        }
        $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
        let tokenValue = null;
        if (this._configuration.PageTokenID) tokenValue = $(`#${this._configuration.PageTokenID}`).val();
        if (!tokenValue) tokenValue = '';
        $.ajax({
            method: 'POST',
            url: this._configuration.ServerEndpoint,
            timeout: 10000, //Throw timeout error if no response is received after 10 seconds.
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
    private _onButtonColSeq(): void {
        let allPlayers = this._game.getPlayerList();
        let colorSequence = "Current order of players:\n";
        allPlayers.forEach((player, index) => {
            if (!this._game.isEliminated(player)) colorSequence += `Player ${index+1}: ${player}\n`;
        });
        alert(colorSequence);
    }
    private _onButtonMainMenu(): void {
        if (this._game.hasEnded) {
            if (this._game.haveIWon) this._onQuitCurrentGame(true);
            else this._onQuitCurrentGame(false);
            return;
        }
        let result = window.confirm("Current game will be lost. Continue?");
        if (!result) return;
        if (this._game.isWatching || this._game.haveIWon === false) this._onQuitCurrentGame(false);
        else this._onQuitCurrentGame(true);
    }
    private _onButtonSearchGame(): void {
        if (!this._pusherClient) return;
        if (this._gameData.isGameRunning || this._gameData.isWaitingForGame) {
            alert("You cannot request a new game while a game is running or has been already requested.");
            return;
        }
        let numberOfColumnsString: string = $(`#${this._configuration.NumberOfColumnSelectorID}`).val();
        let numberOfRowsString: string = $(`#${this._configuration.NumberOfRowSelectorID}`).val();
        let numberOfPlayersString: string = $(`#${this._configuration.NumberOfPlayersSelectorID}`).val();
        if (Number(numberOfPlayersString) == NaN || Number(numberOfPlayersString) < 2) return;
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
        let playerList: Array<string> = [];
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
        if (this._configuration.PageTokenID) tokenValue = $(`#${this._configuration.PageTokenID}`).val();
        if (!tokenValue) tokenValue = '';
        $.ajax({
            type: "POST",
            url: this._configuration.ServerEndpoint,
            timeout: 10000, //throw timout error if no response is received within 10 seconds.
            data: {
                token: tokenValue,
                command: this._configuration.CommandForSearchingGame,
                players: numberOfPlayers,
                rows: numberOfRows,
                columns: numberOfColumns
            },
            success:
                (function (response) {
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
    private _onIncomingInputRequest(data: { inputNumber: number }) {
        if (this._listOfProcessedInputs.has(data.inputNumber)) {
            let boardInput: BoardInput = this._listOfProcessedInputs.get(data.inputNumber);
            let eventTriggered = this._currentPusherChannel.trigger(`client-${this._eventNameForBroadcastingInputs}`, boardInput);
        }
    }
    private _onIncomingRemoteInput(receivedBoardInput: BoardInput) {
        if (this._gameData.isGameRunning && this._gameData.isWaitingForMove) {
            receivedBoardInput.isItALocalMove = false;
            let qElement: QueueElement = { element: receivedBoardInput, priority: receivedBoardInput.inputNumber };
            this._listOfPendingInputs.enqueue(qElement);
        }
    }
    private _onlineGameLoop(deltaTime: number): void {
        if (this._game.hasEnded) {
            let angle: number = - 60 * Math.cos(0.015 * this._frameCount % 360);
            let text: string = "";
            if (this._game.haveIWon) text = "YOU HAVE WON\nCONGRATULATION";
            else if (this._game.isWatching) text = "GAME HAS ENDED\n BETTER LUCK NEXT TIME";
            else text = "YOU HAVE LOST\n BETTER LUCK NEXT TIME"
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this._textShader.bind();
            this._textShader.applyMaterial(this._winningMaterial);
            let location = this._textShader.getUniformLocation("modelTransform");
            if (location != -1) this._textObject.drawLine(this._textShader, location, text, glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, angle, 0), "center", "center", false);
            this._textShader.unbind();
            return;
        }
        let isInputProcessedByGame: boolean = this._onReceivedBoardInput();
        this._game.drawBoard(deltaTime);
        if (isInputProcessedByGame) this._onUpdateGameStateAfterInput(this._processedBoardInput);
        let timeSinceLastInput = this._beginFrame - this._lastInputProcessingTime;
        if (timeSinceLastInput > 60000 && this._gameData.isWaitingForMove) { // If more than 1 minute have passed since the last input, ping the other player.
            this._lastInputProcessingTime = this._beginFrame;
            let eventTriggered = this._currentPusherChannel.trigger(`client-${this._eventNameForRequestingInputs}`, { inputNumber: this._processedBoardInput ? this._processedBoardInput.inputNumber + 1 : 1 });
        }
    }
    private _onMenuButtonClick(): void {
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
    private _onMouseClickOnCanvas(posX: number, posY: number): void {
        if (!this.isEngineRunning) return;
        if (this._gameData.isWaitingForMove || !this._isBoardInputProcessedByEngine) return;
        if (this._game.isBlastAnimationRunning) return; //don't process input while a blast animation is running.
        if ((this._gameData.isGameRunning && (this._listOfPendingInputs.isEmpty))) {
            let boardInput = this._game.getBoardCoordinates(posX, posY);
            if ((boardInput[0] < 0) || (boardInput[1] < 0)) return;
            let inputData: BoardInput = <BoardInput>{ boardCoordinate: { x: -1, y: -1 }, onlinePosition: 0 };
            inputData.boardCoordinate.x = boardInput[0];
            inputData.boardCoordinate.y = boardInput[1];
            inputData.onlinePosition = this._gameData.onlinePosition;
            inputData.inputNumber = this._listOfProcessedInputs.size + 1;
            inputData.isItALocalMove = true;
            let qElement: QueueElement = { element: inputData, priority: inputData.inputNumber };
            this._listOfPendingInputs.enqueue(qElement);
        }
    }
    private _onMouseDown(posX: number, posY: number): void {
        if (!this.isEngineRunning) return;
        this._mouseDown = true;
        this._isDragging = false;
        this._currentMouseX = posX;
        this._currentMouseY = posY;
    }
    private _onMouseDragging(posX: number, posY: number): void {
        if (!this.isEngineRunning) return;
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
        if (!this.isEngineRunning) return;
        this._currentMouseX = posX;
        this._currentMouseY = posY;
        this._mouseDown = false;
        this._isDragging = false;
    }
    private _onOtherPlayerJoining(playerData: { id: string, info: any }): void {
        if (this._gameData.isWaitingForGame){
            let numberOfSubscribedPlayers: number = this._currentPusherChannel.members.count;
            let remainingNumberOfPlayers: number = this._gameData.totalPlayers - numberOfSubscribedPlayers;
            if (remainingNumberOfPlayers == 0) {
                $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                this._onRequestGameStart();
            }
            else {
                let playerWord: string = remainingNumberOfPlayers === 1 ? "player" : "players";
                this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
            }
        }
    }
    private _onOtherPlayerLeaving(playerData: { id: string, info: any }): void {
        if (this._gameData.isGameRunning) {
            if (this._game.isBlastAnimationRunning) {
                setTimeout(this._onOtherPlayerLeaving.bind(this), 100, playerData);
                return;
            }
            if (this._game.hasEnded) return;
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
                let numberOfSubscribedPlayers: number = this._currentPusherChannel.members.count;
                let remainingNumberOfPlayers: number = this._gameData.totalPlayers - numberOfSubscribedPlayers;
                let playerWord: string = remainingNumberOfPlayers === 1 ? "player" : "players";
                this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                //$(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
            }
            else this._onRequestResetGameState();
        }
    }
    private _onPlayerSelection(): void {
        if (!this.isEngineRunning) return;
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
    private _onQuitCurrentGame(updateChannel?: boolean): void {
        if (!this.isEngineRunning) return;
        this._gameData.isGameRunning = false;
        this._showGamePanel(false);
        this._applyDefaultCanvasSetting();
        this._game.resetGameVariables();
        if (updateChannel === true) this._onRequestResetGameState(true);
        else this._onRequestResetGameState(false);
    }
    private _onReceivedBoardInput(): boolean {
        let isInputProcessedByGame: boolean = false;
        //Very important!! if blast animation is running, don't process player's input yet!
        if (!this._listOfPendingInputs.isEmpty && this._isBoardInputProcessedByEngine) {
            let qElement: QueueElement = this._listOfPendingInputs.dequeue();
            let boardInput: BoardInput = qElement.element;
            if (this._listOfProcessedInputs.has(boardInput.inputNumber)) return false;
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
    private _onRequestGameStart(): void {
        if (!this.isEngineRunning) return;
        let myPosition = this._getMyGamePositionFromChannel();
        if (myPosition < 0) {
            alert(`Could not start the game. Reason: server assigned invalid user id for a channel member.`);
            this._onRequestResetGameState(true);
            return;
        }
        this._gameData.onlinePosition = myPosition;
        this._updateServerMessage(`Requesting server to start the game...`);
        let tokenValue = null;
        if (this._configuration.PageTokenID) tokenValue = $(`#${this._configuration.PageTokenID}`).val();
        if (!tokenValue) tokenValue = '';
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
                        if (key !== 'isGameRunning') this._gameData[key] = serverGameState[key];
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
    private _onRequestResetGameState(updateChannelInServer?: boolean): void{
        if (!this.isEngineRunning) return;
        this._isReadyToStartNewGame = false;
        let tokenValue = null;
        if (this._configuration.PageTokenID) tokenValue = $(`#${this._configuration.PageTokenID}`).val();
        if (!tokenValue) tokenValue = '';
        let ajaxData: { token: string, command: string, updateChannel?: boolean } = { token: tokenValue, command: this._configuration.CommandForResettingGameState };
        if (updateChannelInServer === true) ajaxData.updateChannel = true;
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
    private _onSuccessfulGameRequest(): void {
        if (!this.isEngineRunning) return;
        let channel_name = this._gameData.channel;
        if (this._currentPusherChannel) {
            this._currentPusherChannel.unbind_all();
            this._pusherClient.unsubscribe(this._currentPusherChannel.name);
            this._currentPusherChannel = null;
        }
        this._currentPusherChannel = this._pusherClient.subscribe(channel_name) as PusherTypes.PresenceChannel;
        this._currentPusherChannel.bind('pusher:subscription_error', status => {
            alert(`Could not subscribe to channel ${channel_name}. See console log for details.`);
            $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
            throw new Error(`Error occurred while subscribing to channel ${channel_name}: ${status.error}. Status code: ${status.status}`);
        });
        this._currentPusherChannel.bind('pusher:subscription_succeeded', status => {
            let numberOfSubscribedPlayers: number = this._currentPusherChannel.members.count;
            let remainingNumberOfPlayers: number = this._gameData.totalPlayers - numberOfSubscribedPlayers;
            if (remainingNumberOfPlayers == 0) this._onRequestGameStart();
            else {
                let playerWord: string = remainingNumberOfPlayers === 1 ? "player" : "players";
                this._updateServerMessage(`Waiting for ${remainingNumberOfPlayers} more ${playerWord} to join.`);
                $(`#${this._configuration.CancelRequestGameButtonID}`).removeAttr('disabled');
            }
        });
        
        this._currentPusherChannel.bind('pusher:member_added', this._onOtherPlayerJoining.bind(this));
        this._currentPusherChannel.bind('pusher:member_removed', this._onOtherPlayerLeaving.bind(this));
    }
    private _onUpdateGameStateAfterInput(boardInput: BoardInput): void { //Updates the state in server after a (local/remote) move
        if (!this.isEngineRunning) return;
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
    private _prepareEngineToStartGame(): void {
        if (!this.isEngineRunning) return;
        if (this._listOfPendingInputs) this._listOfPendingInputs.clear();
        if (this._listOfProcessedInputs) this._listOfProcessedInputs.clear();
        this._listOfConfirmedPlayers = new Map();
        this._currentPusherChannel.bind(`client-${this._eventNameForBroadcastingInputs}`, this._onIncomingRemoteInput.bind(this));
        this._currentPusherChannel.bind(`client-${this._eventNameForRequestingInputs}`, this._onIncomingInputRequest.bind(this));
        let playerList: Array<string> = [];
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
        let colorVal: [number, number, number] = colorList.get(playerColor);
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
        let myColor = colorList.get(myColorName);
        this._winningMaterial = <OBJ.Material>{};
        this._winningMaterial.name = myColorName;
        this._winningMaterial.diffuse = myColor;
        this._winningMaterial.specularExponent = 5;
        this._winningMaterial.specular = myColor;
        this._isBoardInputProcessedByEngine = true;
    }
    private _renderDefaultScene(deltaTime: number): void {
        if (!this.isEngineRunning) return;
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
    private _startSendingBeaconToPlayerOne(): void {
        if (!this._gameData.isGameRunning && this._isReadyToStartNewGame) {
            this._currentPusherChannel.trigger(`client-${this._eventNameForSendingBeacon}`, { onlinePosition: this._gameData.onlinePosition });
            setTimeout(this._startSendingBeaconToPlayerOne.bind(this), 600);
        }
    }
    private _showGamePanel(show: boolean): void {
        if (show) {
            $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", "none");
            let idList = [this._configuration.InsideMenuDivisionID];
            this._configuration.ListOfHorizontalPanelID.forEach(id => { idList.push(id); });
            for (let id of idList) {
                let displayStyle = $(id).attr('data-display');
                if (displayStyle !== undefined) $(id).css("display", displayStyle);
                else $(`#${id}`).css("display", 'block');
            }
        }
        else {
            $(`#${this._configuration.InsideMenuDivisionID}`).css("display", "none");
            let displayStyle = $(`#${this._configuration.OutsideMenuDivisionID}`).attr('data-display');
            if (displayStyle !== undefined) $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", displayStyle);
            else $(`#${this._configuration.OutsideMenuDivisionID}`).css("display", 'block');
            for (let id of this._configuration.ListOfHorizontalPanelID) $(`#${id}`).css("display", "none");
        }
    }
    private _startMainLoop(): void {
        if (!this.isEngineRunning) return;
        this._frameCount++;
        let deltaTime = Math.abs(this._beginFrame - this._endFrame);
        this._endFrame = this._beginFrame;
        this._beginFrame = new Date().getTime();
        if (this._configuration.FrameCounterID) {
            $(`#${this._configuration.FrameCounterID}`).html("Frame: " + this._frameCount.toString());
        }
        if (this._gameData.isGameRunning) this._onlineGameLoop(deltaTime);
        else this._renderDefaultScene(deltaTime);
        requestAnimationFrame(this._startMainLoop.bind(this));
    }
    private _toggleStateOfGameControls(enable: boolean): void {
        let listOfAllGameControlIDs: Array<string> = [
            this._configuration.NumberOfRowSelectorID,
            this._configuration.NumberOfColumnSelectorID,
            this._configuration.NumberOfPlayersSelectorID,
            this._configuration.RequestGameButtonID
        ];
        this._configuration.ListOfColorSelectorID.forEach(id => { listOfAllGameControlIDs.push(id); });
        if (enable) listOfAllGameControlIDs.forEach(id => { $(`#${id}`).removeAttr('disabled'); });
        else listOfAllGameControlIDs.forEach(id => { $(`#${id}`).attr('disabled', 1); });
    }
    private _triggerGameStartOnEngine(): void {
        this._gameData.isGameRunning = true;
        this._isReadyToStartNewGame = false;
        this._showGamePanel(true);
        this._currentPusherChannel.unbind(this._eventNameForStartingGame);
    }
    private _triggerGameStartOnServer(onlinePositionOfOther: number): void {
        if (!this._listOfConfirmedPlayers.has(onlinePositionOfOther)) this._listOfConfirmedPlayers.set(onlinePositionOfOther, true);
        if (this._listOfConfirmedPlayers.size < this._gameData.totalPlayers) return;
        if (this._isAjaxRequestSentToTriggerGame) return;
        let tokenValue = null;
        if (this._configuration.PageTokenID) tokenValue = $(`#${this._configuration.PageTokenID}`).val();
        if (!tokenValue) tokenValue = '';
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
    private _updateCanvasPerspective(width: number, height: number): void {
        gl.viewport(0, 0, width, height);
        this._defaultProj = glm.mat4.create();
        glm.mat4.perspective(this._defaultProj, Math.PI * 45.0 / 180.0, width / height, 1.0, 100.0);
    }
    private _updateCameraView(): void {
        if (!this.isEngineRunning) return;
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
    private _updateBrownianParticleMotion(): void {
        if (!this.isEngineRunning) return;
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
    private _updateServerMessage(message: string) {
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
    public configure(config: OnlineEngineConfiguration) {
        if (this._configuration === null) { //If no configuration yet exists, copy everything
            this._configuration = Object.assign({}, config);
        }
        else {
            //Else update only those that are specified in config.
            Object.assign(this._configuration, config);
        }
    }
    constructor(config: OnlineEngineConfiguration, pusherModule?: any) {
        this.configure(config);
        if (!this.isConfigured()) {
            alert("Failed to configure engine instance. Perhaps forgot to specify all properties correctly?");
            throw new Error("Engine was not configured correctly.");
        }
        if (config.NumberOfBrownianParticles) this._mNumParticles = config.NumberOfBrownianParticles;
        this._eventNameForStartingGame = this._configuration.CommandForStartingGame;
        if (pusherModule !== undefined) {
            this._pusherModule = pusherModule;
        }
        else this._pusherModule = Pusher;
        this._pusherClient = new pusherModule(this._configuration.PusherSettings.app_key, this._configuration.PusherSettings);
        if (this._configuration.PageTokenID) {
            let pageId: string = $(`#${this._configuration.PageTokenID}`).val();
            if (!pageId.length) {
                alert("Session id is corrupted or was intentionally modified. Server invalidated the current session.");
                throw new Error("Invalid session id.");
            }
            this._personalUserChannel = this._pusherClient.subscribe(`private-${pageId}`);
            this._personalUserChannel.bind('pusher:subscription_succeeded', status => {
                this._personalUserChannel.bind(`${pageId}.session_invalidated`, (data => {
                    if (this._gameData.isGameRunning) this._showGamePanel(false);
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
                    if (this._configuration.LogoutButtonMobileID) $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
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
                if (this._configuration.LogoutButtonMobileID) $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
                throw new Error(`Error occurred while subscribing to private channel: ${status.error}. Status code: ${status.status}`);
            }).bind(this));
            this._personalUserChannel.bind('pusher:error', (status => {
                alert(`Error occurred while subscribing to private channel. See console log for details.`);
                this._pusherClient = null;
                this._toggleStateOfGameControls(false);
                $(`#${this._configuration.RequestGameButtonID}`).attr('disabled', 1);
                $(`#${this._configuration.CancelRequestGameButtonID}`).attr('disabled', 1);
                $(`#${this._configuration.LogoutButtonID}`).attr('disabled', 1);
                if (this._configuration.LogoutButtonMobileID) $(`#${this._configuration.LogoutButtonMobileID}`).attr('disabled', 1);
                throw new Error(`Error occurred while subscribing to private channel: ${status.error}. Status code: ${status.status}`);
            }).bind(this));
            this._pusherClient.user.user_data = { id: pageId, user_info: {} };
            this._pusherClient.user.signin(); //This method is not yet available in pusher-python server library.
        }
        this._listOfPendingInputs = new PriorityQueue();
        this._listOfProcessedInputs = new Map();
    }
    public destroy(): void {
        if (this._isDestroyed) return;
        if (this.isEngineRunning) this.stop();
        this._gameData = {
            isGameRunning: false,
            isWaitingForGame: false,
            isWaitingForMove: false,
            totalPlayers: null,
            onlinePosition: null,
            channel: null,
            rows: null,
            columns: null
        }
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
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
        if (this._pusherClient) this._pusherClient.disconnect();
        this._pusherClient = null;
        this._isDestroyed = true;
    }
    public isConfigured(): boolean {
        if (!this._configuration) return false;
        if (!this._configuration.AudioElementID) return false;
        if (!this._configuration.BoardDimLabelID) return false;
        if (!this._configuration.BlockViewDivisionID) return false;
        if (!this._configuration.CancelRequestGameButtonID) return false;
        //if (!this._configuration.CanvasViewBlockerID) return false; //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
        if (!this._configuration.CanvasElementID) return false;
        if (!this._configuration.CanvasParentID) return false;
        if (!this._configuration.ColorSequenceMenuID) return false;
        if (!this._configuration.CommandForCancellingGameSearch) return false; //The server command for cancelling an ongoing search for a game in the server.
        if (!this._configuration.CommandForResettingGameState) return false; //The server command for resetting game state to the default in the server.
        if (!this._configuration.CommandForSearchingGame) return false; //The server command for requesting a game from the server.
        if (!this._configuration.CommandForStartingGame) return false; //The server command for telling the server to start the game once a lobby is full.
        if (!this._configuration.CommandForUpdatingMove) return false; //The server command for updating player's turn-state (isWaitingForMove) in the server.
        if (!this._configuration.CommandForQuittingCurrentGame) return false; //The command for quitting an ongoing game play in the server.
        if (!this._configuration.CurrentPlayerLabelID) return false;
        if (!this._configuration.CurrentPlayerMobileLabelID) return false;
        //if (!this._configuration.DefaultMaterialForParticles) return false; //DefaultMaterialForParticles specification is optional for game engine
        //if (!this._configuration.DefaultNumberOfColumn) return false; //DefaultNumberOfColumn specification is optional for game engine
        //if (!this._configuration.DefaultNumberOfRow) return false; //DefaultNumberOfRow specification is optional for game engine
        //if (!this._configuration.FrameCounterID) return false; //FrameCounterID specification is optional for game engine
        if (!this._configuration.HtmlMenuButtonID) return false;
        if (!this._configuration.InsideMenuDivisionID) return false;
        if (!this._configuration.ListOfColorSelectorID) return false;
        if (this._configuration.ListOfColorSelectorParentID) { //Optional, array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`. If provided, must have same number of ids as in `ListOfColorSelectorID`
            if (this._configuration.ListOfColorSelectorParentID.length != this._configuration.ListOfColorSelectorID.length) return false;
        }
        if (!this._configuration.ListOfHorizontalPanelID) return false;
        if (!this._configuration.ListOfResourceNames) return false;
        if (!this._configuration.LogoutButtonID) return false; //ID of the logout button
        if (!this._configuration.LogoutPath) return false; //Path to the logout url
        //if (!this._configuration.LogoutButtonMobileID) return false; //ID of the logout button in mobile view(applicable to media with smaller screen size).
        if (!this._configuration.MainmenuButtonID) return false;
        //if (!this._configuration.MessageBoxID) return false; //MessageBoxID specification is optional.
        if (!this._configuration.NewGameButtonID) return false;
        //if (!this._configuration.NumberOfBrownianParticles) return false; //NumberOfBrownianParticles specification is optional.
        if (!this._configuration.NumberOfColumnSelectorID) return false;
        if (!this._configuration.NumberOfPlayersLabelID) return false;
        if (!this._configuration.NumberOfPlayersSelectorID) return false;
        if (!this._configuration.NumberOfRowSelectorID) return false;
        if (!this._configuration.OutsideMenuDivisionID) return false;
        //if (!this._configuration.PageTokenID) return false; //Optional, ID of the html element containing the authentication token of the page. This is needed if the html page requires authentication with the server before every request.
        if (!this._configuration.PathToResource) return false;
        if (!this._configuration.PositionLabelID) return false;
        if (!this._configuration.PositionMobileLabelID) return false;
        //if (!this._configuration.ProgressBarID) return false; //Optional, ID of the progress bar element.
        if (this._configuration.PusherSettings.app_key.length === 0) return false;
        if (!this._configuration.RequestGameButtonID) return false;
        if (!this._configuration.VerticalMenubarID) return false;
        return true;
    }
    public start(alphabetMeshMap: OBJ.MeshMap, materialLibraryData: string): void {
        this._applyDefaultHTMLSettings();
        //Parse the matrial data
        this._currentMaterialLibrary = new OBJ.MaterialLibrary(materialLibraryData);
        let defaultMaterial = this._currentMaterialLibrary.materials[this._configuration.DefaultMaterialForParticles];
        if (defaultMaterial) Object.assign(this._defaultParticleMaterial, defaultMaterial);
        if (this._canvas == null) this._canvas = glUtilities.intialize(this._configuration.CanvasParentID, this._configuration.VerticalMenubarID, this._configuration.CanvasElementID);
        if (this._game == null) {
            let gameConfig: OnlineGameConfiguration = <OnlineGameConfiguration>{};
            gameConfig.AudioElementID = this._configuration.AudioElementID;
            gameConfig.CurrentPlayerLabelElementID = this._configuration.CurrentPlayerLabelID;
            gameConfig.CurrentPlayerLabelMobileElementID = this._configuration.CurrentPlayerMobileLabelID;
            this._game = new OnlineMainGame(gameConfig);
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
        if (this._pusherClient === null) {
            this._pusherClient = new this._pusherModule(this._configuration.PusherSettings.app_key, this._configuration.PusherSettings);
        }
        this._bindGameEngineWithHTML();
        if (this._configuration.RequestGameButtonID) $(`#${this._configuration.RequestGameButtonID}`).removeAttr('disabled');
        this._isDestroyed = false;
        if (!this.isEngineRunning) {
            this._isEngineRunning = true;
            this._startMainLoop();
        }
    }
    public stop(): void { this._isEngineRunning = false; }
    public get isEngineRunning(): boolean { return this._isEngineRunning; }
    public resize(): void {
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
    public radians(degree: number): number { return Math.PI * degree / 180; }
    public degrees(radian: number): number { return 180 * radian / Math.PI }
}