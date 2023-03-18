import { data } from "jquery";
import $ = require("jquery");
import OBJ = require("webgl-obj-loader");

import { OfflineEngineConfiguration, OfflineEngine } from "./offlineEngine";
/**
 * Downloads and parses the `.obj` data for each of the 26 alphabets (and their materials if any) and also a `.mtl` data specified in
 * the last entry of the resource list.
 * @param {Array<string} listOfResource A list of strings with length 27 which contains the names of the 26 `.obj` files 
 * (mapping to each alphabet is done their positions in the list) and a (`.mtl`) material file.
 * @param {string} pathToResource The absoule (url) path to resource names contained in `listOfResource`.
 **/
function DownloadAlphabetMeshData(listOfResource: Array<string>, pathToResource: string): [Promise<OBJ.MeshMap>[], Promise<Response>] {
    let modelList: Array<OBJ.DownloadModelsOptions> = [];
    if (listOfResource.length < 26) {
        alert("The list of resource names must contain all 26 '.obj' data for each alphabets.");
        throw new Error("Specified list of resource names must contain at least 26 entries corresponding to the '.obj' data for each 26 alphabets. ")
    }
    let alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 26; i++) { //Collect info on .obj data for each of the 26 alphabets.
        let entryFile = listOfResource[i];
        let resourceName: string = entryFile.replace(/\.[^/.]+$/, ""); //Get the file name without the extension.
        let resourceExtension: string = entryFile.substring(entryFile.lastIndexOf("."));
        if (resourceExtension !== '.obj') {
            alert("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
            throw new Error("Invalid resource for alphabet '" + alphabets.charAt(i) + "'. Must have .obj data, instead recieved '" + resourceExtension + "' data");
        }
        let objEntry: OBJ.DownloadModelsOptions = {
            obj: pathToResource + entryFile,
            name: alphabets.charAt(i),
            downloadMtlTextures: false,
            mtl: false //By default, does not download material. Rather a common material library (downloaded only once) is added to each mesh later.
        };
        modelList.push(objEntry);
    }
    let promiseMaterial: Promise<Response> = undefined;
    if (listOfResource.length > 26) { //Collect info on .mtl data for each of the 26 alphabets.
        let materialFilePath = listOfResource[26]; //Retrieve the 27 the entry of the resource list.
        let resourceExtension: string = materialFilePath.substring(materialFilePath.lastIndexOf("."));
        if (resourceExtension !== '.mtl') {
            alert("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
            throw new Error("Invalid resource (must have .mtl data) for alphabet material. Instead recieved '" + resourceExtension + " ' data.");
        }
        promiseMaterial = fetch(pathToResource + materialFilePath);
    }
    let promiseMeshMapArray: Array<Promise<OBJ.MeshMap>> = [];
    modelList.forEach(entry => { let promise = OBJ.downloadModels([entry]); promiseMeshMapArray.push(promise); });
    return [promiseMeshMapArray, promiseMaterial];
}
function OnDocumentReady(config: OfflineEngineConfiguration, engine?: OfflineEngine): void {
    if (!engine) engine = new OfflineEngine(config);
    //**************************************************************
    //************* Download mesh objects and initilize engine (webgl renderer)
    if (config.ListOfResourceNames) {
        let totalNumberOfResources: number = config.ListOfResourceNames.length;
        let resourceDownloaded: number = 0;
        let promiseForMeshDataAndMaterial: [Promise<OBJ.MeshMap>[], Promise<Response>] = DownloadAlphabetMeshData(config.ListOfResourceNames, config.PathToResource);
        let promiseForMeshDataArray: Promise<OBJ.MeshMap>[] = promiseForMeshDataAndMaterial[0];
        let promiseForMaterial: Promise<Response> = promiseForMeshDataAndMaterial[1];
        let materialData: string = undefined;
        let alphabetMeshList: OBJ.MeshMap = <OBJ.MeshMap>{};
        let isCanvasBlockerVisible: boolean = false;
        let canvasBlockerDisplay: string = $(`#${config.CanvasViewBlockerID}`).css('display');
        if (canvasBlockerDisplay === 'none') canvasBlockerDisplay = 'block';
        $(`#${config.CanvasViewBlockerID}`).attr('data-display', canvasBlockerDisplay);
        let messageBoxID: string = config.MessageBoxID ? `#${config.MessageBoxID}` : undefined;
        let progressBarID: string = config.ProgressBarID ? `#${config.ProgressBarID}` : undefined;
        let canvasBlockerID: string = config.CanvasViewBlockerID ? `#${config.CanvasViewBlockerID}` : undefined;
        promiseForMaterial.then(
            response => {
                if (!response.ok) {
                    if (messageBoxID) {
                        $(messageBoxID).html("Failed to fetch material data from specified url. HTTP status: ");
                    }
                    throw new Error("Failed to fetch material data from specified url. HTTP status: " + response.status.toString());
                }
                let materialResponse = response.text();
                materialResponse.then(
                    data => {
                        materialData = data;
                        resourceDownloaded += 1;
                        if (canvasBlockerID) {
                            if (!isCanvasBlockerVisible) {
                                $(canvasBlockerID).css("display", canvasBlockerDisplay);
                                isCanvasBlockerVisible = true;
                            }
                        }
                        if (messageBoxID) $(messageBoxID).html(`Loading resources. Please wait ...`);
                        if (progressBarID) {
                            let width: number = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                            $(progressBarID).css('width', `${width}%`);
                        }
                        if (resourceDownloaded == totalNumberOfResources) {
                            if (messageBoxID) $(messageBoxID).html("Starting game engine ...");
                            if (canvasBlockerID) $(canvasBlockerID).css("display", "none");
                            engine.start(alphabetMeshList, materialData);
                        }
                    }
                )
                    .catch(reason => { console.error(reason); });
            }
        )
            .catch(reason => { console.error(reason) });
        promiseForMeshDataArray.forEach(
            promise => {
                promise.then(
                    objMeshData => {
                        Object.keys(objMeshData).forEach(
                            key => {
                                alphabetMeshList[key] = objMeshData[key];
                                resourceDownloaded += 1;
                                if (canvasBlockerID) {
                                    if (!isCanvasBlockerVisible) {
                                        $(canvasBlockerID).css("display", canvasBlockerDisplay);
                                        isCanvasBlockerVisible = true;
                                    }
                                }
                                if (messageBoxID) $(messageBoxID).html(`Loading resources. Please wait ...`);
                                if (progressBarID) {
                                    let width: number = Math.floor(100 * resourceDownloaded / totalNumberOfResources);
                                    $(progressBarID).css('width', `${width}%`);
                                }
                                if (resourceDownloaded == totalNumberOfResources) {
                                    if (messageBoxID) $(messageBoxID).html("Starting game engine ...");
                                    if (canvasBlockerID) $(canvasBlockerID).css("display", "none");
                                    engine.start(alphabetMeshList, materialData);
                                }
                            }
                        );
                    }
                )
                    .catch(reason => { console.error(reason); });
            }
        );
    }
}
export function EntryPoint(config: OfflineEngineConfiguration) {
    $(function () {
        var engine: OfflineEngine = new OfflineEngine(config);
        OnDocumentReady(config, engine);
        window.onunload = (function (event) { //Free engine resources before browser is closed.
            if (engine) {
                engine.destroy();
                engine = null;
            }
            return null;
        }).bind(this);
    });
}