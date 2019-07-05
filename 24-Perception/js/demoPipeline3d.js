
class Pipeline3dDemo extends React.Component {

    constructor(props){
        super(props);
        this.imageId = 'pipeline3d';        // Image id
        this.position = {row: 0, col: 0};   // Indicator position
        this.size = 32;                     // Image resolution, needs to be power of 2
        this.steps = 5;                     // Steps to display
        this.separation = 1;                // Separation between images

        // Three js setup
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
        this.camera.position.z = 2;
        this.scene = new THREE.Scene();

        // Image material array
        this.imgMatArr = [];
        for(let i=0; i < this.steps; i++){
            this.imgMatArr.push(new THREE.MeshBasicMaterial({side: THREE.DoubleSide}));
        }
    }

    componentDidMount(){
        // Set up 3d scene

        // Renderer
        const canvas = document.getElementById(`${this.imageId}-canvas3d`);
        this.renderer = new THREE.WebGLRenderer({canvas});

        // Orbital controls
        const controls = new THREE.OrbitControls(this.camera, canvas);

        // Create main container
        const container = new THREE.Object3D();

        // Add images
        for(let i=0; i < this.steps; i++){
            const imgGeometry = new THREE.PlaneGeometry(1, 1);
            const img = new THREE.Mesh(imgGeometry, this.imgMatArr[i]);
            img.position.x = 0.5;
            img.position.y = 0.5;

            const imgPivot = new THREE.Object3D();
            imgPivot.add(img);
            imgPivot.position.z = i*this.separation;
            container.add(imgPivot);
        }

        // Add indicator
        const indicatorGeometry = new THREE.BoxGeometry(1/this.size, 1/this.size, (this.steps-1)*this.separation);
        const indicatorMat = new THREE.MeshBasicMaterial({color: 'red', transparent: true, opacity: 0.5})
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

        // BUGGY FIX ME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // Update for orbit controls
        let animate = ()=>{

            //time *= 0.001;

            controls.update();
            indicatorPivot.position.x = this.position.col/this.size;
            indicatorPivot.position.y = 1 - 1/this.size*(this.position.row+1);

            // Re-render
            this.renderer.render(this.scene, this.camera);
        }
        setInterval(animate, 10);
    }

    process(){
        const img = document.getElementById(`${this.imageId}-img`);

        // Resize
        const utilCanvas = document.getElementById(`${this.imageId}-util`);
        const context = utilCanvas.getContext('2d');
        context.clearRect(0, 0, this.size, this.size);
        context.drawImage(img, 0, 0, this.size, this.size);

        //Textures
        loadTexture(utilCanvas.toDataURL("image/png"))
            .then((texture)=>{
                swapTexture(this.imgMatArr[0], texture);
                this.imgMatArr[0].needsUpdate = true;
            })

            .then(()=>{
                let imgData = context.getImageData(0, 0, this.size, this.size);
                let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);
                
                // Convert to grayscale
                grayscale(source);

                fillArray(imgData.data, source.data, imgData.data.length);
                context.putImageData(imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.imgMatArr[1], texture);
                this.imgMatArr[1].needsUpdate = true;
            })

            .then(()=>{
                let imgData = context.getImageData(0, 0, this.size, this.size);
                let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);
                
                // Do gaussian blur with 5x5 filter
                convolve(source, gaussianBlur5);
                
                fillArray(imgData.data, source.data, imgData.data.length);
                context.putImageData(imgData, 0, 0);
            })
            .then(()=>loadTexture(utilCanvas.toDataURL("image/png")))
            .then((texture)=>{
                swapTexture(this.imgMatArr[2], texture);
                this.imgMatArr[2].needsUpdate = true;
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
    e(Pipeline3dDemo, null, null),
    document.getElementById('pipeline-grayscale-root')
);