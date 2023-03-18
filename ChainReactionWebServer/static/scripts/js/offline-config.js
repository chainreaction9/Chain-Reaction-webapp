
requirejs.config({
    baseUrl: "chainreaction-offline/scripts/js",
    waitSeconds: 200,
    paths: {
        "gl-matrix": ["https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix"],
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min"],
        "webgl-obj-loader": ["https://chainserver.pythonanywhere.com/static/scripts/js/webgl-obj-loader"]
    }
});

require(["chain-reaction-module"], function () {
    require(["offlineApp"], function (offlineAppModule) {
        /**
         * An interface specifying element IDs to bind functions from the game engine with the elements in HTML document.
         * @property AudioElementID : ID of the html audio element containing the audio resources.
         * @property BoardDimLabelID : ID of the html label element displaying the current board dimension (row & column).
         * @property BlockViewDivisionID : ID of the div which blocks the background after opening the vertical Menu (applicable to media with smaller screen size such as mobile).
         * @property CanvasViewBlockerID: Optional, ID of the div element blocking from viewing the canvas.It also contains the progress bar and the message container.
         * @property CanvasElementID : ID of the HTML canvas element on which the game engine uses.
         * @property CanvasParentID: ID of the parent of HTML canvas element on which the game engine uses.
         * @property ColorSequenceMenuID : ID of the popup menu button which displays the order of player turns in a running game.
         * @property CurrentPlayerLabelID : ID of the label displaying name of the current player in a running game (applicable to media with bigger screen size).
         * @property CurrentPlayerMobileLabelID : ID of the label displaying name of the current player in a running game (applicable to media with smaller screen size).
         * @property DefaultMaterialForParticles : Optional, Name of the default material for brownian particles. The material must be defined in the provided .mtl data.
         * @property DefaultNumberOfColumn: Optional, Default number of columns in board.
         * @property DefaultNumberOfRow: Optional, Default number of rows in board.
         * @property FrameCounterID: Optional, ID of the div in html document containing the frame count.
         * @property HtmlMenuButtonID: ID of the div in html docoument containing the Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile).
         * @property HorizontalPanelID: ID of the div in html containing current player information (applicable to media with smaller screen size).
         * @property InsideMenuDivisionID : ID of the div in html which contains menu options that are available after starting a game.
         * @property ListOfColorSelectorID : Array containing the IDs for the color selectors associated with each player.
         * @property ListOfColorSelectorParentID: Array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
         * @property ListOfResourceNames: A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
         * @property MainmenuButtonID: ID of the html button which stops a running game and goes back to the main menu.
         * @property MessageBoxID: ID of the html element displaying interactive messages from engine to the html document.
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
         * @property UndoButtonID : ID of the html button which undoes a player move in a running game.
         * @property UndoButtonMobileID: ID of the html button which undoes a player move in a running game (applicable to media with smaller screen size such as mobile).
         * @property VerticalMenubarID: ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC)
         */
        var config = {
            AudioElementID: "gameAudio",
            BoardDimLabelID: "boardSizeLabel",
            BlockViewDivisionID: "blockView",
            CanvasElementID: "canvasObj",
            CanvasParentID: "canvasParent",
            CanvasViewBlockerID: "canvasBlocker",
            ColorSequenceMenuID: "colSeq",
            CurrentPlayerLabelID: "playerLabel",
            CurrentPlayerMobileLabelID: "playerLabelHorizontal",
            DefaultMaterialForParticles: "Gold",
            DefaultNumberOfColumn: 6,
            DefaultNumberOfRow: 8,
            FrameCounterID: "FrameNum",
            HtmlMenuButtonID: "htmlMenuBtn",
            HorizontalPanelID: "gamePanelHorizontal",
            InsideMenuDivisionID: "insideGame",
            ListOfColorSelectorID: [
                "_ColorChoiceForPlayer_1", "_ColorChoiceForPlayer_2",
                "_ColorChoiceForPlayer_3", "_ColorChoiceForPlayer_4",
                "_ColorChoiceForPlayer_5", "_ColorChoiceForPlayer_6",
                "_ColorChoiceForPlayer_7", "_ColorChoiceForPlayer_8"
            ],
            ListOfColorSelectorParentID: [
                "player-1", "player-2",
                "player-3", "player-4",
                "player-5", "player-6",
                "player-7", "player-8"
            ],
            ListOfResourceNames: [
                "A.obj", "B.obj", "C.obj", "D.obj", "E.obj",
                "F.obj", "G.obj", "H.obj", "I.obj", "J.obj",
                "K.obj", "L.obj", "M.obj", "N.obj", "O.obj",
                "P.obj", "Q.obj", "R.obj", "S.obj", "T.obj",
                "U.obj", "V.obj", "W.obj", "X.obj", "Y.obj",
                "Z.obj", "alphabet.mtl"
            ],
            MainmenuButtonID: "mainMenuBtn",
            MessageBoxID: "messageFromGameEngine",
            NewGameButtonID: "newGameBtn",
            NumberOfBrownianParticles: 100,
            NumberOfColumnSelectorID: "size_x",
            NumberOfRowSelectorID: "size_y",
            NumberOfPlayersLabelID: "numPlayerLabel",
            NumberOfPlayersSelectorID: "numPlayer",
            OutsideMenuDivisionID: "outsideGame",
            PathToResource: "./chainreaction-offline/content/assets/",
            ProgressBarID: "progressBar",
            StartGameButtonID: "startBtn",
            UndoButtonID: "undoBtn",
            UndoButtonMobileID: "undoBtnHorizontal",
            VerticalMenubarID: "menubar"
        };
        offlineAppModule.EntryPoint(config);
    });
});