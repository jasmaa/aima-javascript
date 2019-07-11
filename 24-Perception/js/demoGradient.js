// Gradient detection demo

/**
 * Top level gradient demo
 */
class GradientDemo extends React.Component {

    constructor(props){
        super(props);

        // Generate source array2d
        const size = 20;

        this.source = new Array2D(Array.from({length: 4*size*size}, ()=>255), size, size, 4);
        this.process();
    }

    componentDidMount(){
        // Set starter image
        const img = new Image(20, 20);
        img.onload = ()=>{
            const canvas = document.getElementById('gradient-starter-canvas');
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, 20, 20);
            const imgData = context.getImageData(0, 0, 20, 20);
            this.source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

            this.setState({
                grid: this.source,
            });
        };
        img.src = "./images/starter.png";
    }

    /**
     * Computes gradient and draws vector field
     */
    process(){

        // Apply Sobel operator horizontally
        this.sobelXData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(this.sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        this.sobelYData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(this.sobelYData, sobelY);

        // Compute mag and angle
        let [magGrid, angleGrid] = computeGradients(this.sobelXData, this.sobelYData);
        this.magGrid = magGrid;
        this.angleGrid = angleGrid;
    }

    /**
     * Updates source when drawing with mouse
     * 
     * @param {integer} row 
     * @param {integer} col 
     */
    drawHandler(row, col){
        for(let i=-2; i <= 2; i++){
            for(let j=-2; j <= 2; j++){
                // Stamp circle on drawing
                if(row+i >= 0 && row+i < this.source.height && col+j >= 0 && col+j < this.source.width){
                    let value = Math.min(255, 100*mag2d(i, j), this.source.getValue(row+i, col+j));
                    this.source.setValue(value, row+i, col+j);
                }
            }
        }

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Clears drawing
     */
    reset(){
        createClear(this.source);

        this.setState({
            grid: this.source,
        });
    }

    render(){
        this.process();

        return e('div', null,
            e('canvas', {
                id: 'gradient-starter-canvas',
                width: '20',
                height: '20',
                hidden: true,
            }, null),
            e('div', {className: 'jumbotron'},
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-6 text-left'},
                        e('div', {className: 'btn btn-danger', onClick: ()=>this.reset()},
                            e('i', {className: 'fas fa-eraser'}, null)
                        ),
                    ),
                    e('div', {className: 'col-xs-6 text-right'},
                        e('div', {
                            className: 'btn-group mr-2',
                            role: 'group',
                        },
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createVerticalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '1'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createHorizontalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '2'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createRadialGradient(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '3'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createDiagonalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '4'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createLineGradient(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '5'),
                        ),
                    ),
                ),
                e('br', null, null),
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-12'},
                        e(GradientGrid, {
                            idBase: 'gradient',
                            gridUnit: 1.8,
                            source: this.source,
                            magGrid: this.magGrid,
                            sobelX: this.sobelXData,
                            sobelY: this.sobelYData,
                            drawHandler: (i, j)=>this.drawHandler(i, j),
                        }, null),
                    ),
                ),
            )
        );
    }

}

// Render elements
ReactDOM.render(
    e(GradientDemo, null, null),
    document.getElementById('gradient-root')
);
