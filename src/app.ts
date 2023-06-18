import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, BoundingBoxGizmo, UtilityLayerRenderer, Color3, SixDofDragBehavior, VertexBuffer, Matrix, Color4, Vector2, AxesViewer } from "@babylonjs/core";

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "cubeCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 4, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        var light: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        var boxHeight = 1, boxWidth = 1, boxDepth = 1;
        var box: Mesh = MeshBuilder.CreateBox("box", { width: boxWidth, height: boxHeight, depth: boxDepth, updatable: true }, scene);
        box.position = Vector3.Zero();
        box.enableEdgesRendering();
        box.edgesColor = new Color4(255, 69, 0, 1);

        // const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2});

        // box.rotation.x = Math.PI / 4;

        // var axes = new AxesViewer(scene, 2);

        // mouseHit is 1 when the user is not selecting a face and then 2 when the user selects a face and then after second mouse click mouseHit is again set to 1.
        var mouseHit = 1;
        var selectedFacet = -1;
        // firstPos is recorded when the user selects a face
        var firstPos = new Vector3(0, 0, 0);
        // secondPos is recorded as the user moves the cursor to the direction they want to extrude
        var secondPos = new Vector3(0, 0, 0);
        var dist = 0;
        var faceIndicesSel :any;
        var pos :any;
        var fNorm :any;
        var prevX: any = 0;
        var prevY: any = 0;

        // this function is called when user does a mouse click
        scene.onPointerDown = function (evt, pickResult) {
            // this is the first mouse click of the user on a face
            if(mouseHit == 1 && pickResult.hit) {
                selectedFacet = pickResult.faceId;
                mouseHit = 2; // updating mouseHit so that next time when user clicks it will be 1
                // firstPos is recorded on the first mouse click
                prevX = scene.pointerX;
                prevY = scene.pointerY;
                firstPos = Vector3.Unproject(
                    new Vector3(scene.pointerX,scene.pointerY,1),
                    engine.getRenderWidth(),
                    engine.getRenderHeight(),
                    Matrix.Identity(), scene.getViewMatrix(),
                    scene.getProjectionMatrix());
                secondPos = firstPos; // setting the secondPos to firstPos as the current secondPos after cursor movement
                // would become the firstPos and the new secondPos would be recorded on the next mouse move
                setIndAttToFace();
                fNorm = new Vector3(box.getFacetNormal(selectedFacet).x, box.getFacetNormal(selectedFacet).y, box.getFacetNormal(selectedFacet).z);
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
                // var moveVec = mmove(evt, prevX, prevY);
                // calculating the distance between firstPos and secondPos
                let dist = Vector3.Distance(firstPos, secondPos);
                var moveVec = secondPos.subtract(firstPos);

                if(selectedFacet == 2 || selectedFacet == 3 || selectedFacet == 6 || selectedFacet == 7 || selectedFacet == 10 || selectedFacet == 11) {
                    moveVec = moveVec.negate();
                }
                
                // Dot product of normal to the face and movement of mouse, which will be later used to determine the direction of extrusion
                var dotProd = Vector3.Dot(fNorm, moveVec);
                
                var scaleVec = fNorm;

                if(dotProd < 0 && Vector3.Dot(fNorm, new Vector3(1, 1, 1)) > 0) {
                    scaleVec = fNorm.negate();
                }
                else if(dotProd > 0 && Vector3.Dot(fNorm, new Vector3(1, 1, 1)) < 0) {
                    scaleVec = fNorm.negate();
                }

                scaleVec = scaleVec.scale(dist/5e3);
                // Positions of vertices of the selected face of the cube are updated
                for(let i = 0; i < faceIndicesSel.length; i++) {
                    var index = faceIndicesSel[i];
                    pos[index * 3] +=  scaleVec.x;
                    pos[index * 3 + 1] +=  scaleVec.y;
                    pos[index * 3 + 2] +=  scaleVec.z;
                }
                box.updateVerticesData(VertexBuffer.PositionKind, pos);
                box.refreshBoundingInfo();
                box.enableEdgesRendering();
            }
        }

        scene.onAfterRenderObservable.add(() => {
            const cursorPos = new Vector3(scene.pointerX, scene.pointerY, 0.99);
        });

        // scene.onAfterRenderObservable.add(() => {
        //     const screenPosition = new Vector3(scene.pointerX, scene.pointerY, 0.99);
        //     const vector = Vector3.Unproject(
        //         screenPosition,
        //         engine.getRenderWidth(),
        //         engine.getRenderHeight(),
        //         Matrix.Identity(),
        //         scene.getViewMatrix(),
        //         scene.getProjectionMatrix()
        //     );
        //     sphere.position = vector;
        // })
        
        function mmove(evt: any, prevX: number, prevY: number) {
            var startViewportPos = new Vector2(prevX/canvas.width, prevY/canvas.height);
            var endViewportPos = new Vector2(scene.pointerX/canvas.width, scene.pointerY/canvas.height);
            prevX = scene.pointerX;
            prevY = scene.pointerY;
            var fray = scene.createPickingRay(startViewportPos.x, startViewportPos.y, Matrix.Identity(), camera);
            var sray = scene.createPickingRay(endViewportPos.x, endViewportPos.y, Matrix.Identity(), camera);
            var spt = fray.origin;
            var ept = sray.origin;
            var moveVec = ept.subtract(spt);
            return moveVec;
        }

        function setIndAttToFace() {
            // returns an array of 72 values which are the positions of the vertices of the cube
            // 4 vertices for each face in 3d space gives 12 values
            // and for 6 faces it 12 x 6 = 72 values.
            pos = box.getVerticesData(VertexBuffer.PositionKind);
            //returns an array of 36 elements which are the indices of the mesh points
            // Each face is made of 2 triangles and each triangle has 3 points
            // so 2 x 3 = 6 points for each face
            // and for 6 faces it is 6 x 6 = 36 points
            var fInd = box.getIndices();
            var stInd = Math.floor(selectedFacet / 2) * 6;
            faceIndicesSel = [
                fInd![stInd], fInd![stInd + 1], fInd![stInd + 2], fInd![stInd + 3], fInd![stInd + 4], fInd![stInd + 5]
            ];

            faceIndicesSel = Array.from(new Set(faceIndicesSel));

            var selectedVertices :any = [[]];

            for(let i = 0; i < faceIndicesSel.length; i++) {
                var idx = faceIndicesSel[i];
                selectedVertices[i] = [pos![idx * 3], pos![idx * 3 + 1], pos![idx * 3 + 2]];
            }

            for(let i = 0; i < pos.length; i+=3) {
                var curVertex = [pos![i], pos![i + 1], pos![i + 2]];
                if(isSubArray(curVertex, selectedVertices)) {
                    faceIndicesSel.push(i / 3);
                }
            }
            faceIndicesSel = Array.from(new Set(faceIndicesSel));
        }

        function isSubArray(subArr :any, arr :any) {
            return arr.some((item: any) => {
                return item.length === subArr.length && item.every((el :any, i :any) => el === subArr[i]);
            });
        }

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

    }
}
new App();