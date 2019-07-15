// Convolution demo UI

/**
 * Convolution demo grid
 */
class ConvolutionGrid extends React.Component {

    renderCells(){

        // Add cells
        let cells = [];
        for(let i=0; i < this.props.grid.height; i++){
            for(let j=0; j < this.props.grid.width; j++){

                let value = this.props.grid.getValue(i, j);
                let isTarget = this.props.filterLocation.col == j && this.props.filterLocation.row == i;

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    isHighlighted: isTarget,
                    highlightColor: '#fd6600',
                    bgColor: gray2RGB(value),
                    handleMouseOver: ()=>this.props.handleMouseOver(i, j),
                }, null));
            }
        }
        
        return cells;
    }

    render(){
        return e('div', {
                className:'square-grid-base',
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

    renderCells(){

        let cells = []
        for(let i=0; i < this.props.source.height; i++){
            for(let j=0; j < this.props.source.width; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                                        i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                                        j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                                        j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.data[4*(this.props.source.width*i + j) + 0];
                let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                if(isWithinFilter){
                    value *= this.props.filter.getValue(filterRow, filterCol);
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    isHighlighted: isWithinFilter,
                    highlightColor: this.props.filterColor.getValue(filterRow, filterCol),
                    bgColor: gray2RGB(value),
                    handleMouseOver: ()=>this.props.handleMouseOver(i, j),
                }, null));
            }
        }

        return cells;
    }

    render(){
        return e('div', {
                className:'square-grid-5',
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
 * Displays weighted sum operation
 */
class ConvolutionMathDisplay extends React.Component {

    renderNumList(){
        let nums = []

        let res = 0;
        for(let i=0; i < this.props.source.height; i++){
            for(let j=0; j < this.props.source.width; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                                        i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                                        j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                                        j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.data[4*(this.props.source.width*i + j) + 0];
                if(isWithinFilter){
                    let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                    let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                    let weight = this.props.filter.data[this.props.filter.width*filterRow + filterCol];
                    res += value * weight;

                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-weight`,
                        value: weight,
                        highlightColor: this.props.filterColor.data[this.props.filterColor.width*filterRow + filterCol],
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-mult`,
                        value: '×',
                        highlightColor: 'black',
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-value`,
                        value: value,
                        highlightColor: 'black',
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-plus`,
                        value: ' + ',
                        highlightColor: 'black',
                    }, null));
                }
            }
        }

        nums.pop();
        nums.push(e(DisplayNumber, {
            key: 'equals',
            value: ' = ',
            highlightColor: 'black',
        }, null));
        nums.push(e(DisplayNumber, {
            key: 'res',
            value: res,
            highlightColor: 'red',
        }, null));
        return nums;
    }

    render(){
        return e('p', {
            style: {
                margin: '3vmax 0vmax 3vmax 0vmax',
            },
            align: 'center',
        }, this.renderNumList());
    }
}

/**
 * Label with magnitude of change at indicated location
 */
class ConvolutionChangeLabel extends React.Component {
    render(){

        let signLabel = this.props.value > 127 ? 'Positive ' : 'Negative ';
        let magLabel = Math.abs(this.props.value - 127) > 63 ? 'Large ' : 'Small ';

        return e('p', {align: 'center'},
            magLabel, signLabel, 'Change'
        );
    }
}

/**
 * Displays topological representation of grid
 */
class ConvolutionTopologyDisplay extends React.Component {
    constructor(props){
        super(props);

        this.size = 200;
        this.options = {
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
        this.graphContainer = null;
        this.graph = null;
        this.horiRot = 0;
    }

    componentDidMount(){
        // Init graph
        let topoData = this.getTopologicalData();
        this.graphContainer = document.getElementById(this.props.imageId);
        this.graph = new vis.Graph3d(this.graphContainer, topoData, this.options);
        this.graph.setCameraPosition({horizontal: this.horiRot, vertical: Math.PI / 4, distance: 2});
        /*
        this.graphRotater = setInterval(()=>{
            this.horiRot += Math.PI / 50;
            this.graph.setCameraPosition({horizontal: this.horiRot});
            this.graph.redraw();
        }, 50);
        */
    }

    componentWillUnmount(){
        clearInterval(this.graphRotater);
    }

    /**
     * Generates topological data for grid
     */
    getTopologicalData(){
        let topoData = [];
        for(let i=0; i < this.props.grid.height; i++){
            for(let j=0; j < this.props.grid.width; j++){    
                let value = this.props.grid.getValue(i, j);
                if(value != null){
                    topoData.push({x: j, y: -i, z: value});
                }
            }
        }
        return topoData;
    }

    render(){
        if(this.graph){
            this.graph.setCameraPosition({horizontal: 0, vertical: Math.PI / 4, distance: 2});
            this.graph.setData(this.getTopologicalData());
            this.graph.redraw();
        }
        return e('div', {id: this.props.imageId}, null);
    }
}

/**
 * Top-level convolution demo
 */
class ConvolutionDemo extends React.Component {

    constructor(props){
        super(props);

        const size = 20;
        let source = new Array2D(
            Array.from({length: 4*size*size}, ()=>0),
            size, size, 4
        );
        createDiagonalLine(source);
            
        this.state = {
            filter: new Array2D([...sobelX.data], sobelX.width, sobelX.height, sobelX.channels),
            source: source,
            filterLocation: {row: 0, col: 0},
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
    move(r, c){
        
        if(this.state.filterLocation.col + c >= this.state.source.width || this.state.filterLocation.col + c < 0 ||
            this.state.filterLocation.row + r >= this.state.source.height || this.state.filterLocation.row + r < 0){
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
    reset(){
        this.setState({
            filterLocation: {row: 0, col: 0},
        });
    }

    /**
     * Updates Array2D grid with value at (row, col)
     * @param {Array2D} grid 
     * @param {integer} value 
     * @param {integer} row 
     * @param {integer} col 
     */
    updateData(grid, value, row, col){

        grid.setValue(value, row, col);

        this.setState({
            filter: this.filter,
            source: this.source,
        });
    }

    /**
     * Updates position when cell is moused over
     * @param {integer} row 
     * @param {integer} col 
     */
    handleMouseOver(row, col){
        this.setState({
            filterLocation: {
                row: row,
                col: col,
            }
        });
    }

    render(){

        // Recalculate convolution
        let convolveResult = new Array2D(
            [...this.state.source.data],
            this.state.source.width, this.state.source.height, this.state.source.channels
        );
        convolve(convolveResult, this.state.filter);
        stretchColor(convolveResult);

        // Get local source at filter
        let localSourceData = [];
        for(let i=-1; i <= 1; i++){
            for(let j=-1; j <= 1; j++){
                for(let chan=0; chan < this.state.source.channels; chan++){

                    let value = null;
                    if(this.state.filterLocation.row + i >= 0 && this.state.filterLocation.row + i < this.state.source.height &&
                        this.state.filterLocation.col + j >= 0 && this.state.filterLocation.col + i < this.state.source.width){
                            value = this.state.source.getValue(this.state.filterLocation.row + i, this.state.filterLocation.col + j);
                    }

                    localSourceData.push(value);
                }
            }
        }
        let localSource = new Array2D(localSourceData, this.state.filter.width, this.state.filter.height, this.state.source.channels);

        return e('div', {className: 'jumbotron'}, 
            e('div', {className: 'row'}, 
                e('div', {className: 'col-xs-4'},
                    e('h4', {align: 'center'}, "Source"),
                    e(ConvolutionGrid, {
                        gridSize: this.state.gridSize,
                        grid: this.state.source,
                        filterLocation: this.state.filterLocation,
                        handleMouseOver: (r, c)=>this.handleMouseOver(r, c),
                    }, null)
                ),
                e('div', {className: 'col-xs-4'},
                    e('h4', {align: 'center'}, "Filter Applied"),
                    e(ConvolutionFilterGrid, {
                        gridSize: this.state.gridSize,
                        filter: this.state.filter,
                        filterColor: this.state.filterColor,
                        filterLocation: this.state.filterLocation,
                        source: this.state.source,
                        handleMouseOver: (r, c)=>this.handleMouseOver(r, c),
                    }, null)
                ),
                e('div', {className: 'col-xs-4'},
                    e('h4', {align: 'center'}, "Result"),
                    e(ConvolutionGrid, {
                        gridSize: this.state.gridSize,
                        grid: convolveResult,
                        filterLocation: this.state.filterLocation,
                        handleMouseOver: (r, c)=>this.handleMouseOver(r, c),
                    }, null)
                ),
            ),
            e('div', {className: 'row'},
                e('div', {className: 'col-xs-4'},
                    e('br', null, null),
                    e(PositionControl, {
                        moveHandler: (r, c)=>this.move(r, c),
                        resetHandler: ()=>this.reset(),
                    }, null)
                ),
                e('div', {className: 'col-xs-4'},
                    e('br', null, null),
                    e(ConvolutionTopologyDisplay, {
                        imageId: 'convolution-topology-local',
                        grid: localSource,
                    }, null),
                ),
                e('div', {className: 'col-xs-4'},
                    e('br', null, null),
                    e('br', null, null),
                    e(ConvolutionChangeLabel, {
                        value: convolveResult.getValue(this.state.filterLocation.row, this.state.filterLocation.col)
                    }, null),
                ),
            )
        );
    }
}

// Render elements
ReactDOM.render(
    e(ConvolutionDemo, null, null),
    document.getElementById('convolution-root')
);
