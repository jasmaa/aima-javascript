// Convolution demo UI

/**
 * Convolution demo grid
 */
class ConvolutionGrid extends React.Component {

    renderCells() {

        // Add cells
        let cells = [];
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {

                let value = this.props.grid.getValue(i, j);
                let isTarget = this.props.filterLocation.col == j && this.props.filterLocation.row == i;

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    highlightColor: isTarget ? '#fd6600' : null,
                    bgColor: gray2RGB(value),
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

/**
 * Convolution demo grid with filter applied
 */
class ConvolutionFilterGrid extends React.Component {

    renderCells() {

        let cells = []
        for (let i = 0; i < this.props.source.height; i++) {
            for (let j = 0; j < this.props.source.width; j++) {

                // Highlight cells
                let isWithinFilter = i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                    i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                    j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                    j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.getValue(i, j);
                let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                if (isWithinFilter) {
                    value *= this.props.filter.getValue(filterRow, filterCol);
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    highlightColor: isWithinFilter ? this.props.filterColor.getValue(filterRow, filterCol) : null,
                    bgColor: gray2RGB(this.props.source.getValue(i, j)),
                    handleMouseOver: () => this.props.handleMouseOver(i, j),
                }, null));
            }
        }

        return cells;
    }

    render() {
        return e('div', {
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
 * Label with magnitude of change at indicated location
 */
class ConvolutionChangeLabel extends React.Component {
    render() {

        let signLabel = this.props.value > 127 ? 'Positive ' : 'Negative ';
        let magLabel = Math.abs(this.props.value - 127) > 63 ? 'Large ' : 'Small ';

        return e('p', { align: 'center' },
            magLabel, signLabel, 'Change'
        );
    }
}

/**
 * Displays topological representation of grid
 */
class ConvolutionTopologyDisplay extends React.Component {
    constructor(props) {
        super(props);

        // Three js setup
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
        this.camera.position.z = 4 * Math.cos(Math.PI / 4);
        this.camera.position.y = 4 * Math.sin(Math.PI / 4);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene = new THREE.Scene();

        this.clearColor = 'pink';
        this.objArr = new Array2D(new Array(this.props.grid.width * this.props.grid.height), this.props.grid.width, this.props.grid.height, 1);
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

        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {
                let pillarGeo = new THREE.BoxGeometry(1, 1, 1);
                let pillarMat = new THREE.MeshBasicMaterial({ color: 'red' });
                let pillar = new THREE.Mesh(pillarGeo, pillarMat);
                pillar.position.y = 0.5;
                pillar.position.x = 0.5;
                pillar.position.z = 0.5;

                let pillarContainer = new THREE.Object3D();
                pillarContainer.add(pillar);

                pillarContainer.position.x = j;
                pillarContainer.position.z = i;

                this.objArr.setValue({
                    obj: pillarContainer,
                    mat: pillarMat,
                }, i, j);
                container.add(pillarContainer);
            }
        }

        // Create scene
        this.scene.add(container);

        this.updateScene();
    }

    updateScene() {
        // Update topo
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {

                let value = this.props.grid.getValue(i, j);
                let item = this.objArr.getValue(i, j);

                if (value != null) {
                    item.obj.scale.y = value / 255 + 0.1;
                    item.mat.color.set(gray2RGB(value));
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
 * Top-level convolution demo
 */
class ConvolutionDemo extends React.Component {

    constructor(props) {
        super(props);

        const size = 30;
        let source = new Array2D(
            Array.from({ length: 4 * size * size }, () => 0),
            size, size, 4
        );
        createVerticalLine(source);

        this.state = {
            filter: new Array2D([...sobelX.data], sobelX.width, sobelX.height, sobelX.channels),
            source: source,
            filterLocation: { row: 0, col: 0 },
            filterColor: new Array2D([
                '#0078ff', '#0078ff', '#0078ff',
                '#0078ff', '#fd6600', '#0078ff',
                '#0078ff', '#0078ff', '#0078ff',
            ], 3, 3),
            gridSize: 0.5,
        };
    }

    /**
     * Move filter
     * @param {integer} r - Rows to move filter
     * @param {integer} c - Columns to move filter
     */
    move(r, c) {

        if (this.state.filterLocation.col + c >= this.state.source.width || this.state.filterLocation.col + c < 0 ||
            this.state.filterLocation.row + r >= this.state.source.height || this.state.filterLocation.row + r < 0) {
            return;
        }

        this.setState({
            filterLocation: {
                row: this.state.filterLocation.row + r,
                col: this.state.filterLocation.col + c
            },
        });
    }

    /**
     * Reset convolution demo
     */
    reset() {
        this.setState({
            filterLocation: { row: 0, col: 0 },
        });
    }

    /**
     * Updates position when cell is moused over
     * @param {integer} row 
     * @param {integer} col 
     */
    handleMouseOver(row, col) {
        this.setState({
            filterLocation: {
                row: row,
                col: col,
            }
        });
    }

    render() {

        // Recalculate convolution
        let convolveResult = new Array2D(
            [...this.state.source.data],
            this.state.source.width, this.state.source.height, this.state.source.channels
        );
        convolve(convolveResult, this.state.filter);
        stretchColor(convolveResult);

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

        return e('div', { className: 'demo-container' },
            e('div', { className: 'flex-container' },
                e('div', null,
                    e('h4', { align: 'center' }, "Source"),
                    e(ConvolutionFilterGrid, {
                        gridSize: this.state.gridSize,
                        filter: this.state.filter,
                        filterColor: this.state.filterColor,
                        filterLocation: this.state.filterLocation,
                        source: this.state.source,
                        handleMouseOver: (r, c) => this.handleMouseOver(r, c),
                    }, null)
                ),
                e('div', null,
                    e('h4', { align: 'center' }, "Local Map"),
                    e(ConvolutionTopologyDisplay, {
                        imageId: 'convolution-topology-local',
                        grid: localSource,
                    }, null),
                ),
                e('div', null,
                    e('h4', { align: 'center' }, "Result"),
                    e(ConvolutionGrid, {
                        gridSize: this.state.gridSize,
                        grid: convolveResult,
                        filterLocation: this.state.filterLocation,
                        handleMouseOver: (r, c) => this.handleMouseOver(r, c),
                    }, null)
                ),
            ),
        );
    }
}

// Render elements
ReactDOM.render(
    e(ConvolutionDemo, null, null),
    document.getElementById('convolution-root')
);
