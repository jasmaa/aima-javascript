// 3D pipeline demo with threejs

class AbortError extends Error {}

/**
 * Top-level 3d pipeline demo
 */
class Pipeline3dDemo extends React.Component {

    constructor(props){
        super(props);
        this.imageId = this.props.imageId;  // Image id
        this.position = {row: 0, col: 0};   // Indicator position
        this.size = 64;                     // Image resolution, needs to be power of 2
        this.steps = this.props.steps;      // Steps to display
        this.separation = 1;                // Separation between images

        // Image processing
        this.imgData = null;
        this.inputSource = null;
        this.graySource = null;
        this.sobelXData = null;
        this.sobelYData = null;

        // Three js setup
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
        this.camera.position.z = 4*Math.cos(Math.PI/6);
        this.camera.position.y = 4*Math.sin(Math.PI/6);
        this.scene = new THREE.Scene();

        // Image material dictionary
        this.matDict = {};
    }

    componentDidMount(){
        // Set up 3d scene

        // Renderer
        const canvas = document.getElementById(`${this.imageId}-canvas3d`);
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor('white');

        // Orbit controls
        this.controls = new THREE.OrbitControls(this.camera, canvas);

        // Create main container
        const container = new THREE.Object3D();

        const textCanvas = document.getElementById(`${this.imageId}-text`);
        const context = textCanvas.getContext('2d');
        this.textData = context.getImageData(0, 0, this.size, this.size);

        // Add panels
        if(this.steps >= 1){
            this.colorPanel = this.addPanel(container, 'color', new THREE.Vector3());
            this.colorTextPanel = this.addPanel(container,'colorText', new THREE.Vector3(this.separation, 0, 0));

            this.drawLabel(context, 'Color', 'cyan');
            swapCanvasTexture(textCanvas, this.matDict['colorText']);
        }
        if(this.steps >= 2){
            this.redPanel = this.addPanel(container, 'red', new THREE.Vector3(0, 0, 0.8*this.separation));
            this.greenPanel = this.addPanel(container, 'green', new THREE.Vector3(0, 0, 0.9*this.separation));
            this.bluePanel = this.addPanel(container, 'blue', new THREE.Vector3(0, 0, 1*this.separation));

            this.redTextPanel = this.addPanel(container, 'redText', new THREE.Vector3(this.separation, -0.4*this.separation, 0.8*this.separation));
            this.greenTextPanel = this.addPanel(container, 'greenText', new THREE.Vector3(this.separation, -0.2*this.separation, 0.9*this.separation));
            this.blueTextPanel = this.addPanel(container, 'blueText', new THREE.Vector3(this.separation, 0, 1*this.separation));

            this.drawLabel(context, 'Red', 'red');
            swapCanvasTexture(textCanvas, this.matDict['redText'])
                .then(()=>this.drawLabel(context, 'Green', 'green'))
                .then(()=>swapCanvasTexture(textCanvas, this.matDict['greenText']))
                .then(()=>this.drawLabel(context, 'Blue', 'blue'))
                .then(()=>swapCanvasTexture(textCanvas, this.matDict['blueText']));
        }
        if(this.steps >= 3){
            this.grayPanel = this.addPanel(container, 'grayscale', new THREE.Vector3(0, 0, 2*this.separation));
            this.grayTextPanel = this.addPanel(container, 'grayText', new THREE.Vector3(this.separation, 0, 2*this.separation));

            this.drawLabel(context, 'Grayscale', 'cyan');
            swapCanvasTexture(textCanvas, this.matDict['grayText']);
        }
        if(this.steps >= 4){
            this.sobelXPanel = this.addPanel(container, 'sobelX', new THREE.Vector3(0, 0, 2.9*this.separation));
            this.sobelYPanel = this.addPanel(container, 'sobelY', new THREE.Vector3(0, 0, 3*this.separation));

            this.sobelXTextPanel = this.addPanel(container, 'sobelXText', new THREE.Vector3(this.separation, -0.2*this.separation, 2.9*this.separation));
            this.sobelYTextPanel = this.addPanel(container, 'sobelYText', new THREE.Vector3(this.separation, 0, 3*this.separation));
            
            this.drawLabel(context, 'Sobel X', 'yellow');
            swapCanvasTexture(textCanvas, this.matDict['sobelXText'])
                .then(()=>this.drawLabel(context, 'Sobel Y', 'coral'))
                .then(()=>swapCanvasTexture(textCanvas, this.matDict['sobelYText']));
        }
        if(this.steps >= 5){
            this.gradPanel = this.addPanel(container, 'gradient', new THREE.Vector3(0, 0, 4*this.separation));
            this.gradTextPanel = this.addPanel(container, 'gradText', new THREE.Vector3(this.separation, 0, 4*this.separation));

            this.drawLabel(context, 'Gradient', 'cyan');
            swapCanvasTexture(textCanvas, this.matDict['gradText']);
        }

        // Add indicator
        const indicatorGeometry = new THREE.BoxGeometry(1/this.size, 1/this.size, (this.steps-1)*this.separation + 0.001);
        const indicatorMat = new THREE.MeshBasicMaterial({color: 'red', transparent: true, opacity: 0.5});
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMat);
        indicator.position.x = 0.5/this.size;
        indicator.position.y = 0.5/this.size;
        indicator.position.z = 0.5*(this.steps-1)*this.separation;

        const indicatorPivot = new THREE.Object3D();
        indicatorPivot.add(indicator);
        container.add(indicatorPivot);
        this.scene.add(container);

        container.position.x = -0.5;
        container.position.y = -0.5;
        container.position.z = -0.5*(this.steps-1)*this.separation;

        // Animation
        let cycleCounter = 0;
        let animate = (time)=>{

            time *= 0.001;

            // Update for orbit controls
            this.controls.update();

            // Update indicator position
            indicatorPivot.position.x = this.position.col/this.size;
            indicatorPivot.position.y = 1 - 1/this.size*(this.position.row+1);

            // Cycle panels
            cycleCounter++;
            if(cycleCounter % 50 == 0){
                if(this.steps >= 2){
                    this.cyclePanels(this.redPanel, this.greenPanel, this.bluePanel);
                    this.cyclePanels(this.redTextPanel, this.greenTextPanel, this.blueTextPanel);
                }
                if(this.steps >= 4){
                    this.cyclePanels(this.sobelXPanel, this.sobelYPanel);
                    this.cyclePanels(this.sobelXTextPanel, this.sobelYTextPanel);
                }
                cycleCounter = 0;
            }

            // Re-render
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    /**
     * Adds image panel to container
     * @param {THREE.Object3D} container 
     * @param {string} name 
     * @param {THREE.Vector3} pos 
     */
    addPanel(container, name, pos){

        // Add material to dict
        this.matDict[name] = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
        });
    
        // Create image mesh and container
        const imgGeometry = new THREE.PlaneGeometry(1, 1);
        const img = new THREE.Mesh(imgGeometry, this.matDict[name]);
        img.position.x = 0.5;
        img.position.y = 0.5;
    
        const imgPivot = new THREE.Object3D();
        imgPivot.add(img);
        imgPivot.position.set(pos.x, pos.y, pos.z);
        container.add(imgPivot);

        return imgPivot;
    }

    /**
     * Draw label for grid
     * @param {CanvasRenderingContext2D} context 
     * @param {string} text 
     * @param {*} color 
     */
    drawLabel(context, text, color){
        context.font = "30px Arial";
        context.lineWidth = 3;
        context.fillStyle = color;
        context.textAlign = 'right';
        
        context.clearRect(0, 0, 200, 200);
        context.fillRect(0, 0, 200, 40);
        context.strokeText(text, 190, 30);
    }

    /**
     * Cycles location of panels along z axis
     * @param  {...any} panels 
     */
    cyclePanels(...panels){

        let temp = panels[0].position.z;
        for(let i=0; i < panels.length-1; i++){
            panels[i].position.set(panels[i].position.x, panels[i].position.y, panels[i+1].position.z);
        }
        panels[panels.length-1].position.set(panels[panels.length-1].position.x, panels[panels.length-1].position.y, temp);
    }

    /**
     * Process image and update pipeline textures
     */
    process(){
        const img = document.getElementById(`${this.imageId}-img`);

        // Resize image and setup image data
        const utilCanvas = document.getElementById(`${this.imageId}-util`);
        const context = utilCanvas.getContext('2d');
        context.clearRect(0, 0, this.size, this.size);
        context.drawImage(img, 0, 0, this.size, this.size);

        this.imgData = context.getImageData(0, 0, this.size, this.size);
        this.inputSource = new Array2D([...this.imgData.data], this.imgData.width, this.imgData.height, 4);

        // Update textures
        swapCanvasTexture(utilCanvas, this.matDict['color'])
            .then(()=>{
                if(this.steps < 2){
                    throw new AbortError('abort chain');
                }
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 0);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['red']))
            .then(()=>{
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 1);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['green']))
            .then(()=>{
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 2);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['blue']))
            
            .then(()=>{
                if(this.steps < 3){
                    throw new AbortError('abort chain');
                }
                // Convert to grayscale
                this.graySource = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                grayscale(this.graySource);
                fillArray(this.imgData.data, this.graySource.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['grayscale']))

            .then(()=>{
                if(this.steps < 4){
                    throw new AbortError('abort chain');
                }
                // Apply Sobel operator horizontally
                this.sobelXData = new Array2D([...this.graySource.data], this.graySource.width, this.graySource.height, 4);
                convolve(this.sobelXData, sobelX);
                const temp = new Array2D([...this.sobelXData.data], this.sobelXData.width, this.sobelXData.height, 4);
                stretchColor(temp);
                fillArray(this.imgData.data, temp.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['sobelX']))
            .then(()=>{
                // Apply Sobel operator vertically
                this.sobelYData = new Array2D([...this.graySource.data], this.graySource.width, this.graySource.height, 4);
                convolve(this.sobelYData, sobelY);
                const temp = new Array2D([...this.sobelYData.data], this.sobelYData.width, this.sobelYData.height, 4);
                stretchColor(temp);
                fillArray(this.imgData.data, temp.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['sobelY']))

            .then(()=>{
                if(this.steps < 5){
                    throw new AbortError('abort chain');
                }
                // Calculate gradient
                const [magGrid, angleGrid] = computeGradients(this.sobelXData, this.sobelYData);
                stretchColor(magGrid);
                fillArray(this.imgData.data, magGrid.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>swapCanvasTexture(utilCanvas, this.matDict['gradient']))
            
            .catch((error)=>{
                // Catch aborts
                if(!error instanceof AbortError){
                    throw(error);
                }
            })

            .finally(()=>{
                 // Render scene
                 this.renderer.render(this.scene, this.camera);
            });
            
    }

    render(){
        return e('div', null,
            e('canvas', {
                id: `${this.imageId}-util`,
                width: this.size,
                height: this.size,
                hidden: true,
            }, null),
            e('canvas', {
                id: `${this.imageId}-text`,
                width: 200,
                height: 200,
                hidden: true,
            }, null),

            e('div', {className: 'row'},
                e('div', {className: 'col-md-12'},
                    e(ImageUploader, {
                        imageId: this.imageId,
                        defaultImage: '../images/test.png',
                        processHandler: () => this.process(),
                    }, null)
                )
            ),
            e('br', null, null),
            e('div', {className: 'jumbotron'},
                e(PositionControl, {
                    moveHandler: (r, c)=>{
                        if(this.position.row + r < 0 || this.position.row + r == this.size ||
                            this.position.col + c < 0 || this.position.col + c == this.size){
                                return;
                            }
                        this.position.row += r;
                        this.position.col += c;
                    },
                    resetHandler: ()=>{
                        this.position.row = 0;
                        this.position.col = 0;
                        this.controls.reset();
                    },
                }, null),
                e('br', null, null),
                e('canvas', {
                    id: `${this.imageId}-canvas3d`,
                    className: 'center',
                    width: 600,
                    height: 300
                }, null),
            )
        );
    }
}

// Render elements
/*
ReactDOM.render(
    e(Pipeline3dDemo, {steps: 3, imageId: 'pipeline3d-grayscale' }, null),
    document.getElementById('pipeline-grayscale-root')
);
*/

ReactDOM.render(
    e(Pipeline3dDemo, {steps: 5, imageId: 'pipeline3d-grad'}, null),
    document.getElementById('pipeline-grad-root')
);