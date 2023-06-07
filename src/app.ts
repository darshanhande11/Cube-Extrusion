import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, BoundingBoxGizmo, UtilityLayerRenderer, Color3, SixDofDragBehavior, VertexBuffer, Matrix } from "@babylonjs/core";
import { SelectionPanel, Control, AdvancedDynamicTexture, CheckboxGroup } from "@babylonjs/gui"

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 2, new Vector3(1, 1, 1), scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        var boxHeight = 1, boxWidth = 1, boxDepth = 1;
        var firstPos = new Vector3(0, 0, 0);
        var secondPos = new Vector3(0, 0, 0);

        var box: Mesh = MeshBuilder.CreateBox("box", { width: boxWidth, height: boxHeight, depth: boxDepth }, scene);

        let mouseHit = 1;
        let selectedFacet = -1;

        scene.onPointerDown = function (evt, pickResult) {
            var face = pickResult.faceId / 2
            var facet = 2 * Math.floor(face);
            
            if(mouseHit == 1 && pickResult.hit) {
                console.log("mouseHit::",mouseHit);
                selectedFacet = facet;
                mouseHit = 2;
                console.log("selected facet::",selectedFacet);
                firstPos = Vector3.Unproject(
                    new Vector3(scene.pointerX,scene.pointerY,1),
                    engine.getRenderWidth(),
                    engine.getRenderHeight(),
                    Matrix.Identity(), scene.getViewMatrix(),
                    scene.getProjectionMatrix());
                secondPos = firstPos;
            } else if(mouseHit == 2) {
                console.log("mouseHit::",mouseHit);
                mouseHit = 1;
                selectedFacet = -1;
            }
        };

        scene.onPointerMove = function (evt, pickResult) {
            if(selectedFacet != -1) {
                console.log(selectedFacet);
                firstPos = secondPos;
                secondPos = Vector3.Unproject(
                    new Vector3(scene.pointerX,scene.pointerY,1),
                    engine.getRenderWidth(),
                    engine.getRenderHeight(),
                    Matrix.Identity(), scene.getViewMatrix(),
                    scene.getProjectionMatrix());
                console.log("firstPos::",firstPos);
                console.log("secondPos::",secondPos);
                let dist = Vector3.Distance(firstPos, secondPos);
                if(firstPos.x === secondPos.x || firstPos.y === secondPos.y || firstPos.z === secondPos.z) {
                    return;
                }

                if(selectedFacet == 0) {
                    if(firstPos.z == secondPos.z)
                        return;
                    else if(firstPos.z < secondPos.z) {
                        box.scaling.z += dist/2e4;
                        box.position.z += dist/2e4;
                    }
                    else {
                        box.scaling.z -= dist/2e4;
                        box.position.z -= dist/2e4;
                    }
                } else if (selectedFacet == 2) {
                    if(firstPos.z == secondPos.z)
                        return;
                    else if(firstPos.z > secondPos.z) {
                        box.scaling.z += dist/2e4;
                        box.position.z -= dist/2e4;
                    }
                    else {
                        box.scaling.z -= dist/2e4;
                        box.position.z += dist/2e4;
                    }
                } else if (selectedFacet == 4) {
                    if(firstPos.x == secondPos.x)
                        return;
                    else if(firstPos.x < secondPos.x) {
                        box.scaling.x += dist/2e4;
                        box.position.x += dist/2e4;
                    }
                    else {
                        box.scaling.x -= dist/2e4;
                        box.position.x -= dist/2e4;
                    }
                } else if (selectedFacet == 6) {
                    if(firstPos.x == secondPos.x)
                        return;
                    else if(firstPos.x > secondPos.x) {
                        box.scaling.x += dist/2e4;
                        box.position.x -= dist/2e4;
                    }
                    else {
                        box.scaling.x -= dist/2e4;
                        box.position.x += dist/2e4;
                    }
                } else if (selectedFacet == 8) {
                    if(firstPos.y == secondPos.y)
                        return;
                    else if(firstPos.y < secondPos.y) {
                        box.scaling.y += dist/2e4;
                        box.position.y += dist/2e4;
                    }
                    else {
                        box.scaling.y -= dist/2e4;
                        box.position.y -= dist/2e4;
                    }
                } else if (selectedFacet == 10) {
                    if(firstPos.y == secondPos.y)
                        return;
                    else if(firstPos.y > secondPos.y) {
                        box.scaling.y += dist/2e4;
                        box.position.y -= dist/2e4;
                    }
                    else {
                        box.scaling.y -= dist/2e4;
                        box.position.y += dist/2e4;
                    }
                }
            }
        }

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();