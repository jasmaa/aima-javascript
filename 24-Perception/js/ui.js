// Common UI elements

/**
 * Grid cell
 */
class Cell extends React.Component {

    render(){
        const highlightColor = this.props.highlightColor ? this.props.highlightColor : "red";
        const highlightTextColor = this.props.highlightTextColor ? this.props.highlightTextColor : "white";

        let bgColor = this.props.isHighlighted ? highlightColor : this.props.bgColor;
        let textColor = this.props.isHighlighted ? highlightTextColor : "black";

        return e('div', {
                className:'square',
                style: {
                    backgroundColor: bgColor,
                    cursor: this.props.handleMouseOver ? 'none' : null,
                },
                onMouseOver: this.props.handleMouseOver ? this.props.handleMouseOver : null,
            },
            e('div', {style: {color: textColor}},
                this.props.value
            )
        );
    }    
}

/**
 * Colored number display
 */
class DisplayNumber extends React.Component {

    render(){
        return e('span', {
            style: {
                color: this.props.highlightColor,
                fontSize: '1.7vmax',
            }
        }, this.props.value);
    }
}

/**
 * Numerical input grid
 */
class GridInput extends React.Component {

    renderCells(){

        let cells = [];

        for(let i=0; i < this.props.grid.height; i++){
            for(let j=0; j < this.props.grid.width; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `${this.props.idBase}-${i}-${j}`,
                    type: 'number',
                    style: {
                        backgroundColor: this.props.gridColor ? this.props.gridColor.data[this.props.gridColor.channels*(this.props.gridColor.width*i + j) + 0] : "white",
                    },
                    value: this.props.grid.data[this.props.grid.channels*(this.props.grid.width*i + j) + 0],

                    onChange: ()=>this.props.updateGridHandler(
                        document.getElementById(`${this.props.idBase}-${i}-${j}`).value, i, j
                    ),
                }, null));
            }
        }

        return cells;
    }

    render(){

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.grid.width}, 3vmax)`,
                gridTemplateRows: `repeat(${this.props.grid.height}, 3vmax)`,
            },
        },
            this.renderCells()
        );
    }
}

/**
 * Upload image button
 * 
 * Provides button for uploading image to document
 * and processing it
 */
class ImageUploader extends React.Component {

    render(){
        
        return e('div', null,
            e('label', {className: 'btn btn-success'},
                e('input', {
                    id: `${this.props.imageId}-input`,
                    type: 'file',
                    name: `${this.props.imageId}-input`,
                    accept: 'image/x-png,image/gif,image/jpeg',
                    style: {display: 'none'},
                    onChange: ()=>{
                        document.body.style.opacity = '0.3';
                        readURL(`${this.props.imageId}-img`, document.getElementById(`${this.props.imageId}-input`))
                            .then((result) => this.props.processHandler())
                            .finally(()=>{
                                document.body.style.opacity = '';
                            });
                    },
                }, null),
                e('img', {
                    src: this.props.defaultImage,
                    id: `${this.props.imageId}-img`,
                    hidden: true,
                    onLoad: ()=>this.props.processHandler(),
                }, null),
                'Upload Image'
            )
        );
    }
}

/**
 * Four direction control panel
 */
class PositionControl extends React.Component {

    render(){
        return e('div', {
            className:'square-grid-3'
        },
            e('div', null, null),
            e('div', {className: 'control-btn btn btn-primary', onClick: ()=>this.props.moveHandler(-1, 0)},
                e('i', {className: 'fas fa-arrow-up'}, null)
            ),
            e('div', null, null),
            e('div', {className: 'control-btn btn btn-primary', onClick: ()=>this.props.moveHandler(0, -1)},
                e('i', {className: 'fas fa-arrow-left'}, null)
            ),
            e('div', {className: 'control-btn btn btn-danger', onClick: ()=>this.props.resetHandler()},
                e('i', {className: 'fas fa-undo'}, null)
            ),
            e('div', {className: 'control-btn btn btn-primary', onClick: ()=>this.props.moveHandler(0, 1)},
                e('i', {className: 'fas fa-arrow-right'}, null)
            ),
            e('div', null, null),
            e('div', {className: 'control-btn btn btn-primary', onClick: ()=>this.props.moveHandler(1, 0)},
                e('i', {className: 'fas fa-arrow-down'}, null)
            ),
            e('div', null, null),
        );
    }
}


/**
 * Cell with gradient arrow
 */
class GradientCell extends React.Component {

    componentDidMount(){
        this.canvas = document.getElementById(`${this.props.idBase}-canvas`);
        this.updateCanvas();
    }

    /**
     * Updates canvas with magnitude arrow
     */
    updateCanvas(){
        if(this.canvas){
            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, 80, 80);
            
            context.strokeStyle = this.props.color;
            context.beginPath();
            canvas_arrow(context, 40, 40, 20*this.props.dx + 40, -20*this.props.dy + 40);
            context.stroke();
        }
    }

    render(){        

        if(this.props.isShowGrad){
            this.updateCanvas();
        }

        return e('div', {
            className: 'square',
            style: {
                backgroundColor: gray2RGB(this.props.value),
                border: this.props.isHighlighted ? 'solid red 1em' : 'none',
            },
            onMouseOver: ()=>{
                if(!isMouseDown){
                    return;
                }
                this.props.drawHandler()
            },
            onClick: ()=>this.props.drawHandler(),
        },
            e('canvas', {
                id: `${this.props.idBase}-canvas`,
                width: '80px',
                height: '80px',
            }, null),
        );
    }
}

/**
 * Gradient grid container
 */
class GradientGrid extends React.Component {

    renderCells(){

        let minMag = Math.min(...this.props.magGrid.data);
        let maxMag = Math.max(...this.props.magGrid.data);

        let cells = [];
        for(let i=0; i < this.props.magGrid.height; i++){
            for(let j=0; j < this.props.magGrid.width; j++){

                // Hide gradient on border
                const isShowGrad = i > 0 && j > 0 && i < this.props.source.height-1 && j < this.props.source.width-1;

                // Highlight cell
                let isHighlighted = false;
                if(this.props.highlightMask){
                    isHighlighted = this.props.highlightMask.getValue(i, j);
                }

                cells.push(e(GradientCell, {
                    key: `${this.props.idBase}-gradient-cell-${i}-${j}`,
                    idBase: `${this.props.idBase}-gradient-cell-${i}-${j}`,
                    value: this.props.source.getValue(i, j),
                    color: wavelengthToColor((this.props.magGrid.getValue(i, j) - minMag) / (maxMag - minMag) * 250 + 450)[0],
                    dx: this.props.sobelX.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    dy: this.props.sobelY.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    isShowGrad: isShowGrad,
                    isHighlighted: isHighlighted,
                    drawHandler: ()=>this.props.drawHandler(i, j),
                }, null));
            }
        }
        return cells;
    }

    render(){
        return e('div', {
            className: 'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.magGrid.width}, ${this.props.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${this.props.magGrid.height}, ${this.props.gridUnit}vmax)`,
            }
        },
            this.renderCells(),
        )
    }
}