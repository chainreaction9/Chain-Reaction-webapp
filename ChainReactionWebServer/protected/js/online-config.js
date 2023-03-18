/**
 * Client side configuration script for loading the online game engine on an HTLM document.
 */
requirejs.config({
    baseUrl: "/chainreaction-offline/scripts/js",
    waitSeconds: 200,
    paths: {
        "pusher-js": ["https://cdnjs.cloudflare.com/ajax/libs/pusher/8.0.1/pusher.min"],
        "gl-matrix": ["https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix"],
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min"],
        "webgl-obj-loader": ["https://chainserver.pythonanywhere.com/static/scripts/js/webgl-obj-loader"]
    }
});

require(["pusher-js", "jquery", "chain-reaction-module"], function (Pusher, $, moduleBundle) {
    require(["onlineApp"], function (onlineApp) {
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
         * @property HtmlMenuButtonID: ID of the html Menu button which opens the vertical Menu (applicable to media with smaller screen size such as mobile).
         * @property HorizontalPanelID: ID of the div in html containing current player information (applicable to media with smaller screen size).
         * @property InsideMenuDivisionID : ID of the div in html which contains menu options that are available after starting a game.
         * @property ListOfColorSelectorID : Array containing the IDs for the color selectors associated with each player.
         * @property ListOfColorSelectorParentID: Array containing the IDs for the parent element of the color selectors listed in `ListOfColorSelectorParentID`.
         * @property ListOfResourceNames: A List of length 27, containing names of the '.obj' files for each 26 alphabets (the names are ordered as in a-z) and a single '.mtl' file for all the alphabets (last entry of the list).
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
         * @property PageTokenID: Optional, ID of the html element containing the authentication token of the page.This is needed if the html page requires authentication with the server before every request.
         * @property PathToResource: Path to the '.obj' and '.mtl' files specified in ListOfResourceNames.
         * @property PositionLabelID: ID of the html label displaying player's position in the game.
         * @property PositionMobileLabelID: ID of the html label displaying player's position in the game (applicable to media with smaller screen size).
         * @property ProgressBarID: Optional, ID of the progress bar element.
         * @property StartGameButtonID: ID of the button which start a game.
         * @property VerticalMenubarID: ID of the div in html docoument containing the vertical main Menu (applicable to media with bigger screen size, such as PC)
         */
        let config = {
            AudioElementID: "gameAudio",
            BoardDimLabelID: "boardSizeLabel",
            BlockViewDivisionID: "blockView",
            CancelRequestGameButtonID: "cancelBtn",
            CanvasViewBlockerID: "canvasBlocker", //Optional, ID of the div element blocking from viewing the canvas. It also contains the progress bar and the message container.
            CanvasElementID: "canvasObj",
            CanvasParentID: "canvasParent",
            ColorSequenceMenuID: "colSeq",
            CommandForCancellingGameSearch: "cancel-search", //The command for cancelling an ongoing search for a game in the server.
            CommandForResettingGameState: "reset-state", //The server command for resetting game state to the default in the server.
            CommandForSearchingGame: "search-game", //The command for requesting a game from the server.
            CommandForStartingGame: "start-game", //The command for telling the server to start the game once a lobby is full.
            CommandForUpdatingMove: "update-move", //The server command for updating player's turn-state (isWaitingForMove) in the server.
            CommandForQuittingCurrentGame: "quit-game", //The command for quitting an ongoing game play in the server.
            CurrentPlayerLabelID: "playerLabel",
            CurrentPlayerMobileLabelID: "playerLabelHorizontal",
            DefaultMaterialForParticles: "Gold",
            DefaultNumberOfColumn: 6,
            DefaultNumberOfRow: 8,
            FrameCounterID: "FrameNum",
            HtmlMenuButtonID: "htmlMenuBtn",
            InsideMenuDivisionID: "insideGame",
            ListOfColorSelectorID: ["color_1", "color_2", "color_3"],
            ListOfColorSelectorParentID: [
                "player-1", "player-2",
                "player-3"
            ],
            ListOfHorizontalPanelID: ["gamePanelHorizontal-1", "gamePanelHorizontal-2"], //array containing IDs of the div elements in html containing current player information (applicable to media with smaller screen size).
            ListOfResourceNames: [
                "A.obj", "B.obj", "C.obj", "D.obj", "E.obj",
                "F.obj", "G.obj", "H.obj", "I.obj", "J.obj",
                "K.obj", "L.obj", "M.obj", "N.obj", "O.obj",
                "P.obj", "Q.obj", "R.obj", "S.obj", "T.obj",
                "U.obj", "V.obj", "W.obj", "X.obj", "Y.obj",
                "Z.obj", "alphabet.mtl"
            ],
            LogoutButtonID: "logoutBtn", //ID of the logout button
            LogoutButtonMobileID: "logoutBtnHorizontal", //Optional, ID of the logout button in mobile view(applicable to media with smaller screen size).
            LogoutPath: "chainreaction-online/logout", //Path to the logout url
            MainmenuButtonID: "mainMenuBtn",
            MessageBoxID: "messageFromGameEngine",
            NewGameButtonID: "newGameBtn",
            NumberOfBrownianParticles: 100,
            NumberOfColumnSelectorID: "size_x",
            NumberOfRowSelectorID: "size_y",
            NumberOfPlayersLabelID: "numPlayerLabel",
            NumberOfPlayersSelectorID: "numPlayer",
            OutsideMenuDivisionID: "outsideGame",
            PageTokenID: "token",
            PathToResource: "/chainreaction-offline/content/assets/",
            PositionLabelID: "positionLabel", //ID of the html label displaying player's position in the game.
            PositionMobileLabelID: "positionLabelHorizontal", //ID of the html label displaying player's position in the game (applicable to media with smaller screen size).
            ProgressBarID: "progressBar", //Optional, ID of the progress bar element.
            PusherSettings: {}, //Pusher settings for connecting to the pusher client.
            RequestGameButtonID: "searchBtn",
            ServerEndpoint: "/game-server-endpoint", //The endpoint to the game server. Only posts method is allowed. The 'command' parameter must be included in the post data.
            ServerMessageFieldID: "serverMessage", //ID of the html field where server/engine post updates.
            VerticalMenubarID: "menubar"
        };
        let pusherSettingsEndpoint = '/pusher/application-settings';
        //Pusher.log = msg => { console.log(msg); }
        $.ajax({
            type: 'POST',
            url: pusherSettingsEndpoint, //Endpoint in game server to obtain pusher settings
            success: response => {
                if (response.success) {
                    config.PusherSettings = response.settings;
                    if (response.token && config.PageTokenID) $(`#${config.PageTokenID}`).val(response.token);
                    onlineApp.EntryPoint(config, Pusher);
                }
                else {
                    alert(`Failed to start game engine. Server denied to provide configuration settings for pusher client for the following reason: ${respons.reason}.`);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Failed to start game engine. See console log.");
                throw new Error(`Could not obtain settings client configuration for pusher from game server at endpoint ${pusherSettingsEndpoint}.`);
            }
        });
    });
});