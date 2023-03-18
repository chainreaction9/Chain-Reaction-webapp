import $ = require("jquery");
export var gl: WebGL2RenderingContext;

export class glUtilities {
    public static intialize(parentID: string, menubarID: string, elementID?: string): HTMLCanvasElement {
        let canvas: HTMLCanvasElement;
        if (elementID !== undefined) {
            canvas = document.getElementById(elementID) as HTMLCanvasElement;
            if (!canvas || canvas === undefined) {
                alert("Could not locate html canvas element with ID: " + elementID);
                throw new Error("Could not find canvas element with ID: " + elementID);
            }
        }
        else {
            canvas = document.createElement("canvas") as HTMLCanvasElement;
            document.getElementById(parentID).appendChild(canvas);
            
        }
        gl = canvas.getContext("webgl2");
        if (gl === undefined) {
            alert("Unable to initialize WebGL 2. Please check if your browser supports this context!")
            throw new Error("Unable to initialize WebGL 2. Your browser may not support it.");
        }
        else {
            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
        }
        let w = $("#"+parentID).width();
        let h = $("#" + parentID).height();
        canvas.setAttribute("width", w.toString());
        canvas.setAttribute("height", h.toString());
        if ($(window).width() <= 600) {
            $("#" + menubarID).attr("data-state", "0");
        }
        return canvas;
    }
    

}