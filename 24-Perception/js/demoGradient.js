// Gradient detection demo

/**
 * Top level gradient demo
 */
class GradientDemo extends React.Component {

    constructor(props){
        super(props);

        // Generate 5x5 array2d of random values
        let src = Array.from({length: 4*5*5}, ()=>0);
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){
                let value = Math.floor(Math.random() * 10);
                src[4*(5*i + j) + 0] = value;
                src[4*(5*i + j) + 1] = value;
                src[4*(5*i + j) + 2] = value;
                src[4*(5*i + j) + 3] = 255;
            }
        }

        this.source = new Array2D(src, 5, 5, 4);
    }

    /**
     * Updates Array2D grid with value at (row, col)
     * @param {Array2D} grid 
     * @param {integer} value 
     * @param {integer} row 
     * @param {integer} col 
     */
    updateData(grid, value, row, col){
        
        // Prevent non-numerical input
        if(isNaN(value)){
            return;
        }

        // Clamp input
        let clampedValue = +value;

        if(clampedValue >= 10){
            return;
        }
        else if(clampedValue < 0){
            return;
        }

        grid.data[grid.channels*(grid.width*row + col) + 0] = clampedValue;

        this.setState({
            grid: this.source,
        });
    }

    render(){
        return e('div', null, [
            e(GridInput, {
                key: 'source-input',
                idBase: 'gradient-cell',
                grid: this.source,
                updateGridHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
            }, null),
        ]);
    }

}

// Render elements
ReactDOM.render(
    e(GradientDemo, null, null),
    document.getElementById('gradient-root')
);
