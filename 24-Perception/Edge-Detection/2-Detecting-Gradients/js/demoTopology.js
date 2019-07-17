// Image intensity topology demo

class TopologyDemo extends React.Component {

    constructor(props){
        super(props);
        this.imageId = 'topology-image';
        this.size = 400;
        this.canvas = null;
        this.graphContainer = null;

        $(window).resize(()=>this.resize());
    }

    resize(){
        if(innerWidth > 700){
            this.canvas.style.width = (innerWidth / 4 - 80)+'px';
            this.graphContainer.childNodes[0].style.width = (innerWidth / 4 - 80)+'px';
            this.graphContainer.childNodes[0].style.height = (innerWidth / 4 - 80)+'px';
        }
        else{
            this.canvas.style.width = (innerWidth / 2 - 30)+'px';
            this.graphContainer.childNodes[0].style.width = (innerWidth / 2 - 30)+'px';
            this.graphContainer.childNodes[0].style.height = (innerWidth / 2 - 30)+'px';
        }
    }

    /**
     * Process image and build topology
     */
    process(){

        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');
        const img = document.getElementById(`${this.imageId}-img`);

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(img, 0, 0, this.size, this.size);
        let imgData = context.getImageData(0, 0, this.size, this.size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);
        
        // Convert to grayscale
        grayscale(source);
        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 0, 0);

        // Generate topological data
        let topoData = [];
        for(let i=0; i < source.height; i++){
            for(let j=0; j < source.width; j++){
                if( i % 8 == 0 && j % 8 == 0){
                    let value = source.getValue(i, j);
                    topoData.push({x: j, y: -i, z: value});
                }
            }
        }

        // Draw topology map
        let options = {
            width: `${this.size}px`,
            height: `${this.size}px`,
            style: 'surface',
            xBarWidth: 1,
            yBarWidth: 1,
            zMin: 0,
            showPerspective: true,
            showGrid: false,
            showXAxis: false,
            showYAxis: false,
            showZAxis: false,
            showShadow: false,
            keepAspectRatio: true,
            verticalRatio: 0.5,
            backgroundColor: 'white',
        };

        this.graphContainer = document.getElementById(`${this.imageId}-topology`);
        let graph = new vis.Graph3d(this.graphContainer, topoData, options);
        graph.setCameraPosition({horizontal: 0, vertical: Math.PI / 2, distance: 1.3});

        this.resize();
    }

    render(){

        return e('div', null,
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
            e('div', {className: 'demo-container'},
                e('div', {className: 'flex-container'},
                    e('canvas', {
                        id: `${this.imageId}-canvas`,
                        width: this.size,
                        height: this.size,
                    }, null),
                    e('div', {
                        id: `${this.imageId}-topology`,
                    }, null)
                ),
            ),
        );
    }
}

// Render elements
ReactDOM.render(
    e(TopologyDemo, null, null),
    document.getElementById('topology-root')
);
