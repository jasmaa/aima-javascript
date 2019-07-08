// 3D pipeline demo with threejs

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
        this.camera.position.z = 2;
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
        const controls = new THREE.OrbitControls(this.camera, canvas);

        // Create main container
        const container = new THREE.Object3D();

        // Add images
        if(this.steps >= 1){
            this.colorPanel = this.addPanel(container, 'color', new THREE.Vector3());
        }
        if(this.steps >= 2){
            this.redPanel = this.addPanel(container, 'red', new THREE.Vector3(0, 0, 0.8*this.separation));
            this.greenPanel = this.addPanel(container, 'green', new THREE.Vector3(0, 0, 0.9*this.separation));
            this.bluePanel = this.addPanel(container, 'blue', new THREE.Vector3(0, 0, 1*this.separation));
        }
        if(this.steps >= 3){
            this.grayPanel = this.addPanel(container, 'grayscale', new THREE.Vector3(0, 0, 2*this.separation));
        }
        if(this.steps >= 4){
            this.sobelXPanel = this.addPanel(container, 'sobelX', new THREE.Vector3(0, 0, 2.9*this.separation));
            this.sobelYPanel = this.addPanel(container, 'sobelY', new THREE.Vector3(0, 0, 3*this.separation));
        }
        if(this.steps >= 5){
            this.gradPanel = this.addPanel(container, 'gradient', new THREE.Vector3(0, 0, 4*this.separation));
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
        container.rotation.x = Math.PI / 4;
        container.rotation.y = Math.PI / 4;

        // Update for orbit controls
        let rotateCounter = 0;
        let animate = (time)=>{

            time *= 0.001;

            controls.update();
            indicatorPivot.position.x = this.position.col/this.size;
            indicatorPivot.position.y = 1 - 1/this.size*(this.position.row+1);

            // Rotate rgb panels
            rotateCounter++;
            if(rotateCounter % 100 == 0){
                if(this.steps >= 2){
                    this.rotatePanels(this.redPanel, this.greenPanel, this.bluePanel);
                }
                if(this.steps >= 4){
                    this.rotatePanels(this.sobelXPanel, this.sobelYPanel);
                }
                rotateCounter = 0;
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

        this.matDict[name] = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
    
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
     * Rotates location of panels
     * @param  {...any} panels 
     */
    rotatePanels(...panels){
        let temp = new THREE.Vector3(panels[0].position.x, panels[0].position.y, panels[0].position.z);
        for(let i=0; i < panels.length-1; i++){
            panels[i].position.set(panels[i+1].position.x, panels[i+1].position.y, panels[i+1].position.z);
        }
        panels[panels.length-1].position.set(temp.x, temp.y, temp.z);
    }

    /**
     * Process image and update pipeline textures
     */
    process(){
        const img = document.getElementById(`${this.imageId}-img`);

        // Resize
        const utilCanvas = document.getElementById(`${this.imageId}-util`);
        const context = utilCanvas.getContext('2d');
        context.clearRect(0, 0, this.size, this.size);
        context.drawImage(img, 0, 0, this.size, this.size);

        this.imgData = context.getImageData(0, 0, this.size, this.size);
        this.inputSource = new Array2D([...this.imgData.data], this.imgData.width, this.imgData.height, 4);

        //Textures
        loadTexture(utilCanvas.toDataURL("image/png"))
            .then((texture)=>{
                if(this.steps < 1){
                    throw new Error('abort chain');
                }
                swapTexture(this.matDict['color'], texture);
                this.matDict['color'].needsUpdate = true;
            })

            .then(()=>{
                if(this.steps < 2){
                    throw new Error('abort chain');
                }
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 0);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['red'], texture);
                this.matDict['red'].needsUpdate = true;
            })
            .then(()=>{
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 1);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['green'], texture);
                this.matDict['green'].needsUpdate = true;
            })
            .then(()=>{
                let source = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                isolateColor(source, 2);
                fillArray(this.imgData.data, source.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['blue'], texture);
                this.matDict['blue'].needsUpdate = true;
            })
            
            .then(()=>{
                if(this.steps < 3){
                    throw new Error('abort chain');
                }
                // Convert to grayscale
                this.graySource = new Array2D([...this.inputSource.data], this.imgData.width, this.imgData.height, 4);
                grayscale(this.graySource);
                fillArray(this.imgData.data, this.graySource.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['grayscale'], texture);
                this.matDict['grayscale'].needsUpdate = true;
            })

            .then(()=>{
                if(this.steps < 4){
                    throw new Error('abort chain');
                }
                // Apply Sobel operator horizontally
                this.sobelXData = new Array2D([...this.graySource.data], this.graySource.width, this.graySource.height, 4);
                convolve(this.sobelXData, sobelX);
                const temp = new Array2D([...this.sobelXData.data], this.sobelXData.width, this.sobelXData.height, 4);
                stretchColor(temp);
                fillArray(this.imgData.data, temp.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['sobelX'], texture);
                this.matDict['sobelX'].needsUpdate = true;
            })

            .then(()=>{
                // Apply Sobel operator vertically
                this.sobelYData = new Array2D([...this.graySource.data], this.graySource.width, this.graySource.height, 4);
                convolve(this.sobelYData, sobelY);
                const temp = new Array2D([...this.sobelYData.data], this.sobelYData.width, this.sobelYData.height, 4);
                stretchColor(temp);
                fillArray(this.imgData.data, temp.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['sobelY'], texture);
                this.matDict['sobelY'].needsUpdate = true;
            })

            .then(()=>{
                if(this.steps < 5){
                    throw new Error('abort chain');
                }
                // Calculate gradient
                const [magGrid, angleGrid] = computeGradients(this.sobelXData, this.sobelYData);
                stretchColor(magGrid);
                fillArray(this.imgData.data, magGrid.data, this.imgData.data.length);
                context.putImageData(this.imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.matDict['gradient'], texture);
                this.matDict['gradient'].needsUpdate = true;
            })
            
            .finally(()=>{
                 // Render scene
                 this.renderer.render(this.scene, this.camera);
                 console.log('done');
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

            e('div', {className: 'row'},
                e('div', {className: 'col-md-12'},
                    e(ImageUploader, {
                        imageId: this.imageId,
                        defaultImage: 'images/test.png',
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


ReactDOM.render(
    e(Pipeline3dDemo, {steps: 3, imageId: 'pipeline3d-grayscale' }, null),
    document.getElementById('pipeline-grayscale-root')
);

ReactDOM.render(
    e(Pipeline3dDemo, {steps: 5, imageId: 'pipeline3d-grad'}, null),
    document.getElementById('pipeline-grad-root')
);