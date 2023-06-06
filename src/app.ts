import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, BoundingBoxGizmo, UtilityLayerRenderer, Color3, SixDofDragBehavior, VertexBuffer } from "@babylonjs/core";
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
        var box: Mesh = MeshBuilder.CreateBox("box", { width: 1, height: 1, depth: 1, updatable: true }, scene);
        console.log(box);
        var boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(box);
        
        // Create bounding box gizmo
        var utilLayer = new UtilityLayerRenderer(scene)
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = true;
        var gizmo = new BoundingBoxGizmo(Color3.FromHexString("#0984e3"), utilLayer)
        gizmo.rotationSphereSize = 0.05;
        gizmo.scaleBoxSize = 0.03;
        gizmo.onScaleBoxDragEndObservable.add(function(){
            console.log("scale ended")
        })
        gizmo.onScaleBoxDragEndObservable.add(function (){
            console.log(gizmo.scaleBoxSize, "scale box size");
            console.log(gizmo.scaleRatio, "scale ratio");
            box.scaling.x = gizmo.scaleRatio;
            box.scaling.y = gizmo.scaleRatio;
            box.scaling.z = gizmo.scaleRatio;
        })
        gizmo.scaleDragSpeed = 1.5;
        gizmo.attachedMesh = boundingBox;

        // // Create behaviors to drag and scale with pointers in VR
        // var sixDofDragBehavior = new SixDofDragBehavior()
        // boundingBox.addBehavior(sixDofDragBehavior)
        // var multiPointerScaleBehavior = new MultiPointerScaleBehavior()
        // boundingBox.addBehavior(multiPointerScaleBehavior)
        
        // scene.registerBeforeRender(function(){
        //     // CoT.rotation.y = angle;
        //     box.scaling.x += 0.0025;
        // });

        // let mouseHit = 1;

        // scene.onPointerDown = function (evt, pickResult) {
        //     var face = pickResult.faceId / 2
        //     var facet = 2 * Math.floor(face);
        //     console.log("facet::",facet);
        //     console.log("mouseHit::",mouseHit);
        //     console.log("box", box);
        //     if(pickResult.hit && mouseHit == 1) {
        //         if(facet == 4 || facet == 6) {
        //             box.scaling.x += 0.1;
        //         } else if(facet == 8 || facet == 10) {
        //             box.scaling.y += 0.1;
        //         } else if(facet == 0 || facet == 2) {
        //             box.scaling.z += 0.1;
        //         }
        //         mouseHit = 2;
        //     } else if(pickResult.hit && mouseHit == 2) {
        //         if(facet == 4 || facet == 6) {
        //             box.scaling.x -= 0.1;
        //         } else if(facet == 8 || facet == 10) {
        //             box.scaling.y -= 0.1;
        //         } else if(facet == 0 || facet == 2) {
        //             box.scaling.z -= 0.1;
        //         }
        //         mouseHit = 1;
        //     }
        // };

        // scene.onPointerMove = function (evt, pickResult) {
        //     var face = pickResult.faceId / 2;
        //     var facet = 2 * Math.floor(face);

        // }

        // add selection panel
        // var advTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // var selectionPanel = new SelectionPanel("customPanel");
        // selectionPanel.width = 0.25;
        // selectionPanel.height = 0.48;
        // selectionPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // selectionPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        // advTexture.addControl(selectionPanel);

        // var resizeToDefault = function() {
        //     var positions = box.getVerticesData(VertexBuffer.PositionKind);
        //     var numberOfVertices = positions!.length/3;	
        //     for(var i = 0; i<numberOfVertices; i++) {
        //         positions![i*3] = Math.sin(positions![i*3]) * 2;
        //         positions![i*3+1] = Math.tan(positions![i*3+1]) * 3;
        //         positions![i*3+2] = Math.cos(positions![i*3+2]) * 4;
        //     }
            
        //     box.updateVerticesData(VertexBuffer.PositionKind, positions!);
        //     box.scaling.x = 1;
        //     box.scaling.y = 1;
        //     box.scaling.z = 1;
        // }

        // add button to resize the cube
        // var transformGroup = new CheckboxGroup("Transformation");
	    // transformGroup.addCheckbox("Resize", resizeToDefault);

        // selectionPanel.addGroup(transformGroup);

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