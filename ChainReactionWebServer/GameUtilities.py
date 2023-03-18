import io, copy, base64, pickle
import math, json

COLOR_MAP = dict()
COLOR_MAP["red"] =  (1, 0, 0)
COLOR_MAP["green"] =  (0, 1, 0)
COLOR_MAP["blue"] =  (0.1, 0.3, 1)
COLOR_MAP["yellow"] =  (1, 1, 0)
COLOR_MAP["cyan"] =  (0, 1, 1)
COLOR_MAP["purple"] =  (0.58, 0, 0.83)
COLOR_MAP["violet"] =  (0.431, 0.392, 1)
COLOR_MAP["pink"] =  (1, 0.412, 0.706)
COLOR_MAP["orange"] =  (1, 0.27, 0)
COLOR_MAP["brown"] =  (0.706, 0.314, 0.196)
COLOR_MAP["maroon"] =  (0.70, 0.18, 0.36)
COLOR_MAP["grey"] =  (0.67, 0.67, 0.67)

class BoardValue():
    """
    A class to represent value of a coordinate in a game board.
    A BoardValue is a dictionary with the following keys and values:
        1. 'level' : level of the orb, possible values 1,2,3
        2. 'color' : color of the ord
        3. 'boardCoordinateX': x-coordinate of the associated board position (key).
        4. 'boardCoordinateY': y-coordinate of the associated board position (key).
    """
    def __init__(self, other = {}):
        self.__value = {"level": other.get("level"),
                                               "color": other.get("color"),
                                               "boardCoordinateX": other.get("boardCoordinateX"),
                                               "boardCoordinateY": other.get("boardCoordinateY")
                                               }
    def __getitem__(self, __k): 
        return self.__value.__getitem__(__k)
    def __getattr__(self, __name):
        if __name == "_BoardValue__value":
            return super(BoardValue, self).__getattr__(__name)
        else: return self.__value.__getitem__(__name)
    def __setattr__(self, __name, __v):
        if __name == "_BoardValue__value":
            return super(BoardValue, self).__setattr__(__name,__v)
        elif __name in self.__value:
            return self.__value.__setitem__(__name,__v)
    def __setitem__(self, __k, __v) -> None:
        if __k in self.__value:
            return self.__value.__setitem__(__k, __v)
    def __repr__(self): return self.__value.__repr__()
    def __delitem__(self, __v) -> None: return self.__setitem__(__v, None)
    def __delattr__(self, __v) ->None:
        if __v in self.__value: self.__value[__v]=None
    def __len__(self): return self.__value.__len__()
    def keys(self):
        return self.__value.keys()

class GameState(object):
    """
    A class to keep track of a game state.
    """
    def __init__(self):
        self.__hasGameStarted = False
        self.__isWaitingForGame = False
        self.__isWaitingForMove = False
        self.__numberOfBoardRows = None
        self.__numberOfBoardColumns = None
        self.__playerList = ()
        self.__eliminatedPlayers = []
        self.__currentBoard = {}
        self.__previousBoard = {}
        self.__channelName = None
        self.__onlinePosition = None
    def cantorValue(self, x, y): return round(0.5 * (x + y) * (x + y + 1) + y)
    def inverseCantorValue(self, z):
        w = math.floor(0.5 * (math.sqrt(8 * z + 1) - 1))
        y = round(z - 0.5 * w * (w + 1))
        x = w - y
        return [x, y]
#*****************************************************************************
#*************************************** Get methods ************************
#******************************************************************************
    def getChannelName(self): return self.__channelName
    def getEliminatedPlayers(self):
        copiedObject = copy.deepcopy(self.__eliminatedPlayers)
        return copiedObject
    def getEncodedCurrentBoard(self):
        """ Returns base64 encoded string value of the bytes obtained from using pickle.dump on the current board.
            To decode the string output, one must first use base64 decode and then load it via pickle.
        """
        with io.BytesIO() as fileInMemory:
            pickle.dump(self.__currentBoard, fileInMemory)
            fileInMemory.seek(0)
            pickedData = base64.b64encode(fileInMemory.read())
            return pickedData.decode()
    def getEncodedPreviousBoard(self)->str:
        """ Returns base64 encoded string value of the bytes obtained from using pickle.dump on the previous board.
            To decode the string output, one must first use base64 decode and then load it via pickle.
        """
        with io.BytesIO() as fileInMemory:
            pickle.dump(self.__previousBoard, fileInMemory)
            fileInMemory.seek(0)
            pickedData = base64.b64encode(fileInMemory.read())
            return pickedData.decode()
    def getJsonObject(self):
        data = {"isGameRunning": self.__hasGameStarted, 
                "isWaitingForGame": self.__isWaitingForGame,
                "isWaitingForMove": self.__isWaitingForMove,
                "rows": self.__numberOfBoardRows,
                "columns": self.__numberOfBoardColumns,
                "totalPlayers": None if self.__playerList.__len__() == 0 else self.__playerList.__len__(),
                "channel": self.__channelName,
                'onlinePosition': self.__onlinePosition
                #"eliminatedPlayers": self.__eliminatedPlayers
                }
        return data
    def getJsonString(self):
        jsonEncoder = json.JSONEncoder(ensure_ascii = True)
        return jsonEncoder.encode(self.getJsonObject())
    def getNumberOfColumns(self): return self.__numberOfBoardColumns
    def getNumberOfEliminatedPlayers(self): return self.__eliminatedPlayers.__len__()
    def getNumberOfPlayers(self): return self.__playerList.__len__()
    def getNumberOfRows(self): return self.__numberOfBoardRows
    def getOnlinePosition(self): return self.__onlinePosition
    def getPlayerList(self):
        copiedObject = copy.deepcopy(self.__playerList)
        return copiedObject
    def getRawCurrentBoard(self):
        """
        Returns a copy of the current board.
        """
        copiedObject = copy.deepcopy(self.__currentBoard)
        return copiedObject
    def getRawPreviousBoard(self):
        """
        Returns a copy of the previous board.
        """
        copiedObject = copy.deepcopy(self.__previousBoard)
        return copiedObject
    def hasGameStarted(self): return self.__hasGameStarted
    def isWaitingForGame(self): return self.__isWaitingForGame
    def isWaitingForMove(self): return self.__isWaitingForMove
#**********************************************************************
#*************************************** Set methods ******************
    def eliminatePlayer(self, player): self.__eliminatedPlayers.append(player)
    def setChannelName(self, value):
        if type(value)==str and len(value)>0: self.__channelName = value
        elif value == None or value == "": self.__channelName = None
    def setHasGameStarted(self, value):
        if type(value) == bool: self.__hasGameStarted = value
    def setOnlinePosition(self, value):
        if type(value) == int or value == None: self.__onlinePosition = value
    def setNumberOfColumns(self, value):
        if type(value) == int or value == None: self.__numberOfBoardColumns = value
    def setNumberOfEliminatedPlayers(self, value):
        if type(value) == int and 1 <= value < self.getNumberOfPlayers():
            for i in range(value):
                player = self.__playerList.pop()
                self.eliminatePlayer(player)
        elif value == None: self.__eliminatedPlayers = []
    def setNumberOfPlayers(self, value):
        if type(value) == int and value >= 0:
            allPlayerColors = [colorName for colorName in COLOR_MAP.keys()]
            self.__playerList = tuple(allPlayerColors[:value])
        elif value == None: self.__playerList = ()
    def setNumberOfRows(self, value):
        if type(value) == int or value == None: self.__numberOfBoardRows = value
    def setWaitingForGame(self, value):
        if type(value) == bool: self.__isWaitingForGame = value
    def setWaitingForMove(self, value):
        if type(value) == bool: self.__isWaitingForMove = value
    def updateBoard(self, value): self.__currentBoard = copy.deepcopy(value)
    def updateEliminatedPlayers(self, value):
        copiedObject = copy.deepcopy(value)
        self.__eliminatedPlayers = copiedObject
    def updateFromJson(self, jsonData):
        if 'isGameRunning' in jsonData and type(jsonData['isGameRunning']) == bool: self.setHasGameStarted(jsonData['isGameRunning'])
        if 'isWaitingForGame' in jsonData and type(jsonData['isWaitingForGame']) == bool: self.setWaitingForGame(jsonData['isWaitingForGame'])
        if 'isWaitingForMove' in jsonData and type(jsonData['isWaitingForMove']) == bool: self.setWaitingForMove(jsonData['isWaitingForMove'])
        if 'rows' in jsonData and (type(jsonData['rows']) == int or jsonData['rows'] == None): self.setNumberOfRows(jsonData['rows'])
        if 'columns' in jsonData and (type(jsonData['columns']) == int or jsonData['columns'] == None): self.setNumberOfColumns(jsonData['columns'])
        if 'totalPlayers' in jsonData and (type(jsonData['totalPlayers']) == int or jsonData['totalPlayers'] == None): self.setNumberOfPlayers(jsonData['totalPlayers'])
        if 'channel' in jsonData and (type(jsonData['channel']) == str or jsonData['channel'] == None) : self.setChannelName(jsonData['channel'])
        if 'onlinePosition' in jsonData and (type(jsonData['onlinePosition']) == int or jsonData['onlinePosition'] == None): self.setOnlinePosition(jsonData['onlinePosition'])
    def updatePlayersList(self, value): self.__playerList = copy.deepcopy(value)
    def updatePreviousBoard(self, value): self.__previousBoard = copy.deepcopy(value)
    


