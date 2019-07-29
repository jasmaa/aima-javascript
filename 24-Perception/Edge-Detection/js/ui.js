// Common UI elements

/**
 * Grid cell
 */
class Cell extends React.Component {

    render() {

        return e('div', {
            className: 'square',
            style: {
                border: this.props.highlightColor ? `0.1vw solid ${this.props.highlightColor}` : '0.05vw solid gray',
                backgroundColor: this.props.bgColor,
                cursor: this.props.handleMouseOver ? 'none' : null,
            },
            onMouseOver: this.props.handleMouseOver ? this.props.handleMouseOver : null,
        },
            e('div', null, this.props.value)
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

    render() {

        return e('div', {style: {marginRight: 10}},
            e('label', {className: 'btn btn-success'},
                e('input', {
                    id: `${this.props.imageId}-input`,
                    type: 'file',
                    name: `${this.props.imageId}-input`,
                    accept: 'image/x-png,image/gif,image/jpeg',
                    style: { display: 'none' },
                    onChange: () => {
                        this.props.changeHandler();
                        document.body.style.opacity = '0.3';
                        readURL(`${this.props.imageId}-img`, document.getElementById(`${this.props.imageId}-input`))
                            .then((result) => this.props.processHandler())
                            .finally(() => {
                                document.body.style.opacity = '';
                            });
                    },
                }, null),
                e('img', {
                    src: this.props.defaultImage,
                    id: `${this.props.imageId}-img`,
                    hidden: true,
                    onLoad: () => this.props.processHandler(),
                }, null),
                'Upload Image'
            )
        );
    }
}

/**
 * Webcam capture
 */
class WebcamCapture extends React.Component {

    componentDidMount() {
        setInterval(() => {
            this.props.processHandler();
        }, 100);
    }

    render() {
        return e('div', null,
            e('video', {
                autoPlay: true,
                id: `${this.props.imageId}-webcam`,
                hidden: true,
            }, null),
            e('div', {
                className: 'btn btn-info',
                onClick: () => {
                    this.props.changeHandler();
                    
                    if (navigator.mediaDevices.getUserMedia) {
                        let video = document.getElementById(`${this.props.imageId}-webcam`);

                        navigator.mediaDevices.getUserMedia({ video: true })
                            .then((stream) => {
                                video.srcObject = stream;
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                },
            }, 'Webcam Capture'),
        );
    }
}


/**
 * Cell with gradient arrow
 */
class GradientCell extends React.Component {

    componentDidMount() {
        this.canvas = document.getElementById(`${this.props.idBase}-canvas`);
        this.updateCanvas();
    }

    /**
     * Updates canvas with magnitude arrow
     */
    updateCanvas() {
        if (this.canvas) {
            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, 80, 80);

            context.lineWidth = 3;
            context.beginPath();

            if (Number.isNaN(this.props.dx) && Number.isNaN(this.props.dy)) {
                context.globalAlpha = 0.5;
                context.strokeStyle = 'pink';
                canvasCross(context, 40, 40)
            }
            else {
                context.globalAlpha = (this.props.ratio + 1) / 2;
                context.lineWidth = 9 * this.props.ratio + 2;
                context.strokeStyle = heatMapColorforValue(this.props.ratio);
                const lenWeight = 15 * this.props.ratio + 8;
                canvas_arrow(context, 40, 40, lenWeight * this.props.dx + 40, -lenWeight * this.props.dy + 40);
            }
            context.stroke();
        }
    }

    render() {

        if (this.props.isShowGrad) {
            this.updateCanvas();
        }

        return e('div', {
            className: 'square',
            style: {
                backgroundColor: gray2RGB(this.props.value),
                border: this.props.isHighlighted ? 'solid red 0.5em' : 'solid gray 0.05em',
            },
            onMouseOver: () => {
                if (!isMouseDown) {
                    return;
                }
                this.props.drawHandler()
            },
            onClick: () => this.props.drawHandler(),
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

    renderCells() {

        // Set max and min mags
        const minMag = 0;
        const maxMag = 1020;

        let cells = [];
        for (let i = 0; i < this.props.magGrid.height; i++) {
            for (let j = 0; j < this.props.magGrid.width; j++) {

                // Hide gradient on border
                const isShowGrad = i > 0 && j > 0 && i < this.props.magGrid.height - 1 && j < this.props.magGrid.width - 1;

                // Highlight cell
                let isHighlighted = false;
                if (this.props.highlightMask) {
                    isHighlighted = this.props.highlightMask.getValue(i, j);
                }

                // Calculate arrow color from
                const ratio = (this.props.magGrid.getValue(i, j) - minMag) / (maxMag - minMag);

                cells.push(e(GradientCell, {
                    key: `${this.props.idBase}-gradient-cell-${i}-${j}`,
                    idBase: `${this.props.idBase}-gradient-cell-${i}-${j}`,
                    value: this.props.source.getValue(i, j),
                    ratio: ratio,
                    dx: this.props.sobelX.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    dy: this.props.sobelY.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    isShowGrad: isShowGrad,
                    isHighlighted: isHighlighted,
                    drawHandler: () => this.props.drawHandler(i, j),
                }, null));
            }
        }
        return cells;
    }

    render() {
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

/**
 * Remove: Four direction control panel
 */
class PositionControl extends React.Component {

    render() {
        return e('div', {
            className: 'square-grid-3'
        },
            e('div', null, null),
            e('div', { className: 'control-btn btn btn-primary', onClick: () => this.props.moveHandler(-1, 0) },
                e('i', { className: 'fas fa-arrow-up' }, null)
            ),
            e('div', null, null),
            e('div', { className: 'control-btn btn btn-primary', onClick: () => this.props.moveHandler(0, -1) },
                e('i', { className: 'fas fa-arrow-left' }, null)
            ),
            e('div', { className: 'control-btn btn btn-danger', onClick: () => this.props.resetHandler() },
                e('i', { className: 'fas fa-undo' }, null)
            ),
            e('div', { className: 'control-btn btn btn-primary', onClick: () => this.props.moveHandler(0, 1) },
                e('i', { className: 'fas fa-arrow-right' }, null)
            ),
            e('div', null, null),
            e('div', { className: 'control-btn btn btn-primary', onClick: () => this.props.moveHandler(1, 0) },
                e('i', { className: 'fas fa-arrow-down' }, null)
            ),
            e('div', null, null),
        );
    }
}