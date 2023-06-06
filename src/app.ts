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

        // we need a camera to view the scene and ArcRotateCamera allows the camera to be controlled by the user
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 2, new Vector3(1, 1, 1), scene);
        camera.attachControl(canvas, true);

        // We need a light source to view the objects in the scene so that different faces of the cube have differenet shades
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        // We create a box mesh using MeshBuilder class and add it to the scene
        var box: Mesh = MeshBuilder.CreateBox("box", { width: 1, height: 1, depth: 1, updatable: true }, scene);

        // We pass the box mesh to the BoundingBoxGizmo to create a bounding box around it
        var boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(box);
        
        // Create bounding box gizmo
        var utilLayer = new UtilityLayerRenderer(scene)
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = true;
        var gizmo = new BoundingBoxGizmo(Color3.FromHexString("#0984e3"), utilLayer)
        // this sets the size of the sphere on the edge that is used for rotation of cube around a line parallel to that edge
        gizmo.rotationSphereSize = 0.05;
        // this sets the size of the box on the face of the cube that is used for extrusion of cube along a normal to that face
        gizmo.scaleBoxSize = 0.03;
        // this sets the speed to scale the cube w.r.t the drag speed of the mouse
        gizmo.scaleDragSpeed = 1.5;
        // attaching the mesh box to gizmo
        gizmo.attachedMesh = boundingBox;

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();