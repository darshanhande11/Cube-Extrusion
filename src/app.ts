import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, BoundingBoxGizmo, UtilityLayerRenderer, Color3, SixDofDragBehavior, VertexBuffer, Matrix } from "@babylonjs/core";
import { SelectionPanel, Control, AdvancedDynamicTexture, CheckboxGroup } from "@babylonjs/gui"

// random comment 1
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
        var light: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        var boxHeight = 1, boxWidth = 1, boxDepth = 1;
        // firstPos is recorded when the user selects a face
        var firstPos = new Vector3(0, 0, 0);
        // secondPos is recorded as the user moves the cursor to the direction they want to extrude
        var secondPos = new Vector3(0, 0, 0);

        var box: Mesh = MeshBuilder.CreateBox("box", { width: boxWidth, height: boxHeight, depth: boxDepth }, scene);

        // mouseHit is 1 when the user is not selecting a face and then 2 when the user selects a face and then after second mouse click mouseHit is again set to 1.
        let mouseHit = 1;
        let selectedFacet = -1;

        // this function is called when user does a mouse click
        scene.onPointerDown = function (evt, pickResult) {
            // since cube has 12 faces, 6 inner and 6 outer, we calculate facet since we only want to select outer faces
            var face = pickResult.faceId / 2
            var facet = 2 * Math.floor(face);
            
            // this is the first mouse click of the user on a face
            if(mouseHit == 1 && pickResult.hit) {
                selectedFacet = facet;
                mouseHit = 2; // updating mouseHit so that next time when user clicks it will be 1
                // firstPos is recorded on the first mouse click
                firstPos = Vector3.Unproject(
                    new Vector3(scene.pointerX,scene.pointerY,1),
                    engine.getRenderWidth(),
                    engine.getRenderHeight(),
                    Matrix.Identity(), scene.getViewMatrix(),
                    scene.getProjectionMatrix());
                secondPos = firstPos; // setting the secondPos to firstPos as the current secondPos after cursor movement
                // would become the firstPos and the new secondPos would be recorded on the next mouse move
            } else if(mouseHit == 2) {
                // this is the second mouse click of the user when extrusion is completed
                mouseHit = 1;
                // since extrusion of a face is completed setting the selectedFacet to -1
                selectedFacet = -1;
            }
        };

        // this function is called when user moves the cursor
        scene.onPointerMove = function (evt, pickResult) {
            // only if the user has selected a face
            if(selectedFacet != -1) {
                // updating the firstPos to earlier secondPos
                firstPos = secondPos;
                // calculating the new secondPos since cursor has moved
                secondPos = Vector3.Unproject(
                    new Vector3(scene.pointerX,scene.pointerY,1),
                    engine.getRenderWidth(),
                    engine.getRenderHeight(),
                    Matrix.Identity(), scene.getViewMatrix(),
                    scene.getProjectionMatrix());

                // calculating the distance between firstPos and secondPos
                let dist = Vector3.Distance(firstPos, secondPos);
                
                // so to do the extrusion and update the mesh, I am scaling the mesh dist / 2 * 10^4 along the axis parallel to the perpendicular edges to the selected face and then translating the mesh by dist / 2 * 10^4 along the axis parallel to the selected face so as to compensate for the scaling in both directions.

                // I am dividing by 10^4 so that the extrusion is proportional to the cursor movement and controllable by the user
                
                // I am also checking the selectedFacet as the scaling and translation equations would be different for different faces
                
                // I am comparing the respective axis coordinate of the firstPos and secondPos to determine the direction of extrusion
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

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();