import $ = require("jquery")
import * as offlineGame from "./offlineMaingame"
import { gl } from "./gl"
import { BoardValue } from "./offlineMaingame"

export interface OnlineGameConfiguration extends offlineGame.OfflineGameConfiguration {
   Data: string
}

export class OnlineMainGame extends offlineGame.MainGame{
    private _onlinePosition: number = null;
    private _hasGameEnded: boolean = null;
    private _haveIWon: boolean = null;
    private _isWatchingGame: boolean = null;
//***************************************************************************************************** */
//************************************** Private methods ***********************************************
    //***************************************************************************************************** */
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
                    if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0] + 1, boardCoordinate[1]))) {
                        let displacedCenter: [number, number, number] = [
                            center[0] + this._blastDisplacement,
                            center[1],
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0] - 1, boardCoordinate[1]))) {
                        let displacedCenter: [number, number, number] = [
                            center[0] - this._blastDisplacement,
                            center[1],
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] + 1))) {
                        let displacedCenter: [number, number, number] = [
                            center[0],
                            center[1] + this._blastDisplacement,
                            center[2]
                        ];
                        this._drawOrb(displacedCenter, boardValue.rotationAxes, angle, 1, color);
                    }
                    if (this._currentAllNeighbours.has(offlineGame.MainGame.cantorValue(boardCoordinate[0], boardCoordinate[1] - 1))) {
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
                    newBoardValue.boardCoordinate = offlineGame.MainGame.inverseCantorValue(key_value[0]);
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
            //Check if you have lost the game after a blast:
            let myColor: string = this._players[this._onlinePosition - 1];
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
                        else this._isWatchingGame = true;
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
//************************************************************************************************** */
///**************************************** Public methods **********************************************
    //************************************************************************************************** */
    constructor(gameConfig: OnlineGameConfiguration) {
        super(gameConfig);
    }
    public get currentActivePlayers(): number {
        return this._players.length - this._eliminated.length;
    }
    public drawBoard(deltaTime: number): boolean {
        let hasGameEnded: boolean = false; //Boolean flag to detect the end of a game.
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
        if (hasGameEnded) super.resetGameVariables();
        return hasGameEnded;
    }
    public getColorOfPlayer(playerNumber: number): string {
        if (this._players.length > 0) {
            return playerNumber <= this._players.length ? this._players[playerNumber - 1] : "";
        }
        return "";
    }
    public getTurnValue(): number { return this._turn; }
    public get hasEnded(): boolean { return this._hasGameEnded; }
    public get haveIWon(): boolean { return this._haveIWon; }
    /**
     * Checks if it is the turn of the player with the current `onlinePosition`.
     * Returns {int} -1 if `onlinePosition` or `players` attribute are not yet set or the current board contains explosives. Otherwise, returns 0 
     * if it is not the player's turn, 1 if it is.
    */
    public isItMyTurn(): number {
        if (!(this._onlinePosition && this._players.length) || this.isBlastAnimationRunning) return -1;
        if (1 + this._turn % this._players.length == this._onlinePosition) return 1
        return 0;
    }
    public get isWatching(): boolean { return this._isWatchingGame; }
    public resetGameVariables() {
        this._onlinePosition = null;
        this._hasGameEnded = false;
        this._haveIWon = null;
        this._isWatchingGame = null;
        super.resetGameVariables();
    }
    public setAttribute(numberOfRows: number, numberOfColumns: number, playerList: Array<string>, onlinePosition?: number) {
        if (!onlinePosition) throw new Error("Game attribute `onlinePosition` is missing.");
        super.setAttribute(numberOfRows, numberOfColumns, playerList);
        this._onlinePosition = onlinePosition;
    }
    
    
}