// Convolution demo UI
import { createVerticalLine, divergingColormap, canvas_arrow } from '../util.js';
import { Array2D, sobelX, convolve, stretchColorRange } from '../imageProcessing.js';
import { Cell } from '../ui.js';

/**
 * Top-level convolution demo
 */
export default class ConvolutionDemo extends React.Component {

    constructor(props) {
        super(props);

        const size = 20;
        let source = new Array2D(
            Array.from({ length: 4 * size * size }, () => 0),
            size, size, 4
        );

        createVerticalLine(source);
        
        this.state = {
            filter: sobelX,
            source: source,
            filterLocation: { row: 1, col: 1 },
            filterColor: new Array2D([
                '#0078ff', '#0078ff', '#0078ff',
                '#0078ff', '#fd6600', '#0078ff',
                '#0078ff', '#0078ff', '#0078ff',
            ], 3, 3),
            gridSize: 1.5,
        };

        // Calculate convolution
        this.convolveResult = new Array2D(
            [...this.state.source.data],
            this.state.source.width, this.state.source.height, this.state.source.channels
        );
        convolve(this.convolveResult, this.state.filter);
        stretchColorRange(this.convolveResult, -1020, 1020, 0, 1);
    }

    componentDidMount(){
        // Paint arrows
        for(let i = 0; i < this.convolveResult.height; i++){
            for(let j = 0; j < this.convolveResult.width; j++){
                const canvas = document.getElementById(`convolution-cell-${i}-${j}`);
                const context = canvas.getContext('2d');

                context.lineWidth = 8;

                const arrowColors = divergingColormap(this.convolveResult.getValue(i, j))
                context.strokeStyle = `rgb(${arrowColors[0]}, ${arrowColors[1]}, ${arrowColors[2]})`;
                canvas_arrow(context, 40, 40, 20, 40);
                context.stroke();
            } 
        }        
    }

    render() {

        // Get local source at filter
        let localSourceData = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let chan = 0; chan < this.state.source.channels; chan++) {

                    let value = null;
                    if (this.state.filterLocation.row + i >= 0 && this.state.filterLocation.row + i < this.state.source.height &&
                        this.state.filterLocation.col + j >= 0 && this.state.filterLocation.col + j < this.state.source.width) {
                        value = this.state.source.getValue(this.state.filterLocation.row + i, this.state.filterLocation.col + j);
                    }

                    localSourceData.push(value);
                }
            }
        }
        let localSource = new Array2D(localSourceData, this.state.filter.width, this.state.filter.height, this.state.source.channels);

        // Get current gradient value
        const resValue = this.convolveResult.getValue(this.state.filterLocation.row, this.state.filterLocation.col);

        return e('div', { className: 'demo-container' },

            e(ConvolutionMagnifier, null,
                e(ConvolutionLocalTopologyDisplay, {
                    imageId: 'convolution-local-topology-local',
                    grid: localSource,
                    filterColor: this.state.filterColor,
                    currGradValue: resValue,
                }, null),
            ),

            e('div', { className: 'flex-container', style: { alignItems: 'baseline' } },
                e('div', null,
                    e(ConvolutionInputGrid, {
                        gridSize: this.state.gridSize,
                        filter: this.state.filter,
                        filterColor: this.state.filterColor,
                        filterLocation: this.state.filterLocation,
                        source: this.state.source,
                        handleMouseOver: (r, c) => this.setState({ filterLocation: {row: r, col: c}}),
                    }, null)
                ),
                /*
                e('div', null,
                    e('h4', { align: 'center' }, "Local Area"),
                    
                    e(ConvolutionChangeLabel, {
                        grid: localSource,
                        value: resValue,
                    }, null),
                ),
                e('div', null,
                    e('h4', { align: 'center' }, "Sobel X Result"),
                    e(ConvolutionOutputGrid, {
                        gridSize: this.state.gridSize,
                        grid: this.convolveResult,
                        filterLocation: this.state.filterLocation,
                        handleMouseOver: (r, c) => this.handleMouseOver(r, c),
                    }, null),
                ),
                */
            ),
        );
    }
}

/**
 * Convolution demo grid with filter applied
 */
class ConvolutionInputGrid extends React.Component {

    renderCells() {

        let cells = []
        for (let i = 0; i < this.props.source.height; i++) {
            for (let j = 0; j < this.props.source.width; j++) {

                // Highlight cells
                let isWithinFilter =
                    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                    i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                    j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                    j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;

                const value = this.props.source.getValue(i, j);
                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    highlightColor: isWithinFilter ? this.props.filterColor.getValue(filterRow, filterCol) : null,
                    bgColor: `rgb(${value}, ${value}, ${value})`,
                    handleMouseOver: () => this.props.handleMouseOver(i, j),
                },
                    e('canvas', {
                        id: `convolution-cell-${i}-${j}`,
                        width: 80,
                        height: 80,
                    }, null),
                ));
            }
        }

        return cells;
    }

    render() {
        return e('div', {
            id: 'convolution-filter-grid',
            className: 'square-grid-5',
            style: {
                'gridTemplateColumns': `repeat(${this.props.source.width}, ${this.props.gridSize}vmax)`,
                'gridTemplateRows': `repeat(${this.props.source.height}, ${this.props.gridSize}vmax)`,
            },
        },
            this.renderCells()
        );
    }
}

/**
 * Displays local topology of grid
 */
class ConvolutionLocalTopologyDisplay extends React.Component {
    constructor(props) {
        super(props);

        // Three js setup
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
        this.camera.position.z = 5 * Math.cos(Math.PI / 4);
        this.camera.position.y = 5 * Math.sin(Math.PI / 4);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene = new THREE.Scene();

        this.clearColor = 'pink';
        this.objArr = new Array2D(
            new Array(this.props.grid.width * this.props.grid.height),
            this.props.grid.width, this.props.grid.height, 1
        );

        $(window).resize(() => this.resize());
    }

    componentDidMount() {
        // Set up 3d scene

        // Renderer
        const canvas = document.getElementById(`${this.props.imageId}-canvas3d`);
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setClearColor(this.clearColor);

        // Create main container
        const container = new THREE.Object3D();
        container.position.x = -1.5;
        container.position.z = -1.5;

        // Create pillars
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {
                // Pillar mesh
                const pillarGeo = new THREE.BoxBufferGeometry(1, 1, 1);
                const pillarMat = new THREE.MeshBasicMaterial({ color: 'red' });
                const pillar = new THREE.Mesh(pillarGeo, pillarMat);
                pillar.position.set(0.5, 0.5, 0.5);

                // Pillar edges
                const pillarEdgeGeo = new THREE.EdgesGeometry(pillarGeo);
                const pillarLines = new THREE.LineSegments(
                    pillarEdgeGeo,
                    new THREE.LineBasicMaterial({ color: this.props.filterColor.getValue(i, j) })
                );
                pillarLines.position.set(0.5, 0.5, 0.5);

                // Pillar container
                let pillarContainer = new THREE.Object3D();
                pillarContainer.add(pillar);
                pillarContainer.add(pillarLines);

                pillarContainer.position.x = 1.06 * j;
                pillarContainer.position.z = 1.06 * i;

                this.objArr.setValue({
                    obj: pillarContainer,
                    mat: pillarMat,
                }, i, j);
                container.add(pillarContainer);
            }
        }

        // Create tilt plane
        this.planeContainer = new THREE.Object3D();
        this.planeMat = new THREE.MeshToonMaterial({ color: 'red' });
        const arrowHead = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 1, 32),
            this.planeMat,
        );
        const arrowBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 1, 32),
            this.planeMat,
        );
        arrowHead.rotation.set(0, 0, Math.PI / 2);
        arrowBody.rotation.set(0, 0, Math.PI / 2);
        arrowHead.position.set(-0.5, 0, 0);
        arrowBody.position.set(0.5, 0, 0);
        this.planeContainer.add(arrowHead);
        this.planeContainer.add(arrowBody);
        this.planeContainer.position.set(0, 2, 0);

        // Create light
        let light = new THREE.PointLight('white', 1, 100);
        light.position.set(5, 5, 5);

        // Create scene
        this.scene.add(container);
        this.scene.add(this.planeContainer);
        this.scene.add(light);
        this.updateScene();
        this.resize();
    }

    resize() {
        const canvas = document.getElementById(`${this.props.imageId}-canvas3d`);
        canvas.style.height = (innerHeight / 4) + 'px';
    }

    /**
     * Updates pillars and re-renders
     */
    updateScene() {
        // Calculate and update rotation and material
        const right = this.props.grid.getValue(1, 2);
        const left = this.props.grid.getValue(1, 0);
        const up = this.props.grid.getValue(0, 1);
        const down = this.props.grid.getValue(2, 1);

        // Update arrow
        if (right != null && left != null && up != null && down != null) {
            const diff = right / 255 - left / 255;
            this.planeContainer.rotation.set(0, 0, Math.atan(diff));
            this.planeContainer.position.set(0, 2, 0);

            const colorVals = divergingColormap(this.props.currGradValue);
            this.planeMat.color.set(`rgb(${colorVals[0]}, ${colorVals[1]}, ${colorVals[2]})`);
        }
        else {
            // Hide arrow
            this.planeContainer.position.set(0, -2, 0);
        }

        // Update pillars
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {

                let value = this.props.grid.getValue(i, j);
                let item = this.objArr.getValue(i, j);

                if (value != null) {
                    item.obj.scale.y = value / 255 + 0.1;
                    item.mat.color.set(`rgb(${value}, ${value}, ${value})`);
                }
                else {
                    item.obj.scale.y = 0.001;
                    item.mat.color.set(this.clearColor);
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    render() {
        if (this.renderer) {
            this.updateScene();
        }

        return e('div', null,
            e('canvas', {
                id: `${this.props.imageId}-canvas3d`,
                width: 200,
                height: 200,
            }, null),
        );
    }
}

/**
 * Convolution demo magnifier
 */
class ConvolutionMagnifier extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cursorX: 0,
            cursorY: 0,
            magnifyVisible: false,
        }
    }

    componentDidMount() {
        // Create magnifier
        const container = document.getElementById('convolution-filter-grid');
        const magnifier = document.getElementById('convolution-magnifier');
        const updateFunc = (e) => {

            e.preventDefault();

            const a = container.getBoundingClientRect();

            // Lock magnifier to image
            let cursorX = e.pageX - magnifier.offsetWidth / 2;
            let cursorY = e.pageY - magnifier.offsetHeight / 2;

            this.setState({
                cursorX: cursorX,
                cursorY: cursorY - a.height/2.5,
                magnifyVisible: true,
            });
        }

        // Magnifier events
        container.addEventListener('mouseleave', (e) => {
            this.setState({ magnifyVisible: false, });
        });
        container.addEventListener('mousemove', updateFunc);
        container.addEventListener('touchmove', updateFunc);
    }

    render() {
        return e('div', {
            id: `convolution-magnifier`,
            style: {
                position: 'absolute',
                //border: '1vmax solid pink',
                cursor: 'none',
                visibility: this.state.magnifyVisible ? 'visible' : 'hidden',

                width: `10vmax`,
                left: this.state.cursorX,
                top: this.state.cursorY,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }
        },
            this.props.children
        );
    }
}



// === OLD ===



/**
 * Label with magnitude of change at indicated location
 */
class ConvolutionChangeLabel extends React.Component {
    render() {

        const right = this.props.grid.getValue(1, 2);
        const left = this.props.grid.getValue(1, 0);
        const up = this.props.grid.getValue(0, 1);
        const down = this.props.grid.getValue(2, 1);

        // Update text
        let outStr = 'No Change';
        if (right == null || left == null || up == null || down == null) {
            outStr = 'Out of Bounds';
        }
        else if (Math.abs(Math.abs(this.props.value) - 0.5) > 0.0001) {
            const signLabel = this.props.value > 0.5 ? 'Positive ' : 'Negative ';
            const magLabel = Math.abs(this.props.value - 0.5) > 0.2 ? 'Large ' : 'Small ';
            outStr = `${magLabel} ${signLabel} Change`;
        }

        return e('p', { align: 'center' }, outStr);
    }
}

/**
 * Convolution demo grid
 */
class ConvolutionOutputGrid extends React.Component {

    renderCells() {
        // Add cells
        let cells = [];
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {

                const value = this.props.grid.getValue(i, j);
                const isTarget = this.props.filterLocation.col == j && this.props.filterLocation.row == i;

                // Mark edge cells as out of bounds
                const colorVals = divergingColormap(value);
                let bgColor = `rgb(${colorVals[0]}, ${colorVals[1]}, ${colorVals[2]})`;
                if (i == 0 || i == this.props.grid.height - 1 || j == 0 || j == this.props.grid.width - 1) {
                    bgColor = 'pink';
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    highlightColor: isTarget ? '#fd6600' : null,
                    bgColor: bgColor,
                    handleMouseOver: () => this.props.handleMouseOver(i, j),
                }, null));
            }
        }

        return cells;
    }

    render() {
        return e('div', {
            className: 'square-grid-base',
            style: {
                'gridTemplateColumns': `repeat(${this.props.grid.width}, ${this.props.gridSize}vmax)`,
                'gridTemplateRows': `repeat(${this.props.grid.height}, ${this.props.gridSize}vmax)`,
            }
        },
            this.renderCells()
        );
    }
}