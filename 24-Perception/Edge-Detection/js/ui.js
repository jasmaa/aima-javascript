// Common component elements
/*
import { readURL, canvasCross, heatMapColorforValue, canvas_arrow } from './util.js';
import { Array2D } from './imageProcessing.js';
*/

/**
 * Fallback component for loading
 */
class FallbackComponent extends React.Component {
    render() {
        return e('div', { className: "loader center" }, null);
    }
}

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
            this.props.children
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

        return e('div', { style: { marginRight: 10 } },
            e('img', {
                src: this.props.defaultImage,
                id: `${this.props.imageId}-img`,
                hidden: true,
                onLoad: () => this.props.processHandler(),
            }, null),

            e('div', { className: 'btn-group' },
                e('label', { className: 'btn btn-success' },
                    e('input', {
                        id: `${this.props.imageId}-input`,
                        type: 'file',
                        name: `${this.props.imageId}-input`,
                        accept: 'image/x-png,image/gif,image/jpeg',
                        style: { display: 'none' },
                        onChange: () => {
                            this.props.changeHandler && this.props.changeHandler();
                            document.body.style.opacity = '0.3';
                            readURL(`${this.props.imageId}-img`, document.getElementById(`${this.props.imageId}-input`))
                                .then((result) => this.props.processHandler())
                                .finally(() => {
                                    document.body.style.opacity = '';
                                });
                        },
                    }, null),
                    e('i', { className: 'fas fa-upload' }, null),
                ),
                e('div', {
                    className: 'btn btn-info',
                    onClick: () => {
                        this.props.changeHandler && this.props.changeHandler();
                        let img = document.getElementById(`${this.props.imageId}-img`);
                        img.src = this.props.defaultImage;
                        this.props.processHandler();
                    }
                },
                    e('i', { className: 'fas fa-undo' }, null)
                ),
            ),
        );
    }
}

/**
 * Webcam capture
 */
class WebcamCapture extends React.Component {

    render() {
        return e('div', { style: { marginRight: 10 } },
            e('video', {
                autoPlay: true,
                id: `${this.props.imageId}-webcam`,
                hidden: true,
            }, null),
            e('div', {
                className: this.props.isRecording ? 'btn btn-danger' : 'btn btn-primary',
                onClick: () => {
                    this.props.changeHandler();
                },
            },
                e('i', { className: this.props.isRecording ? 'fas fa-stop' : 'fas fa-video' }, null)),
        );
    }
}

/**
 * Cell with gradient arrow
 */
class GradientCell extends React.Component {

    constructor(props) {
        super(props);
        $(window).resize(() => this.resize());
    }

    componentDidMount() {
        this.canvas = document.getElementById(`${this.props.idBase}-canvas`);
        this.updateCanvas();
        this.resize();
    }

    resize() {
        this.canvas.style.width = (0.5 * innerWidth / this.props.gridWidth) + 'px';
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
                backgroundColor: `rgb(${this.props.value}, ${this.props.value}, ${this.props.value})`,
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
        const maxMag = 1141;

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

                // Calculate arrow color
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
                    gridWidth: this.props.source.width,
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
 * Displays RGB grid
 */
class RGBGrid extends React.Component {

    render() {

        let cells = [];
        for (let i = 0; i < this.props.grid.height; i++) {
            for (let j = 0; j < this.props.grid.width; j++) {
                const r = this.props.grid.getValue(i, j, 0);
                const g = this.props.grid.getValue(i, j, 1);
                const b = this.props.grid.getValue(i, j, 2);
                cells.push(
                    e(Cell, {
                        key: `rgbcell-${i}-${j}`,
                        bgColor: `rgb(${r}, ${g}, ${b})`,
                    }, null)
                );
            }
        }

        return e('div', {
            className: 'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.grid.width}, ${this.props.cellSize}vmax)`,
                gridTemplateRows: `repeat(${this.props.grid.height}, ${this.props.cellSize}vmax)`,
            }
        }, cells);
    }
}

/**
 * Magnifies pixel array
 */
class PixelMagnifier extends React.Component {

    constructor(props) {
        super(props);

        this.magnifySize = 20;
        this.cellSize = 0.3;

        this.state = {
            cursorX: 0,
            cursorY: 0,
            magnifyGrid: new Array2D([], 5, 5, 4),
            magnifyVisible: false,
        }
    }

    componentDidMount() {
        // Create magnifier
        const canvas = document.getElementById(`${this.props.imageId}-canvas`);
        const context = canvas.getContext('2d');
        const magnifier = document.getElementById(`${this.props.imageId}-rgb-magnifier`);
        const updateFunc = (e) => {

            e.preventDefault();

            const a = canvas.getBoundingClientRect();

            // Lock magnifier to image
            let cursorX = e.pageX - magnifier.offsetWidth / 2;
            let cursorY = e.pageY - magnifier.offsetHeight / 2;
            cursorX = Math.min(a.right + window.pageXOffset - magnifier.offsetWidth, Math.max(a.left + window.pageXOffset, cursorX));
            cursorY = Math.min(a.bottom + window.pageYOffset - magnifier.offsetHeight, Math.max(a.top + window.pageYOffset, cursorY));

            // Get selected area
            const ratioX = (cursorX + magnifier.offsetWidth / 2 - a.left - window.pageXOffset) / a.width;
            const ratioY = (cursorY + magnifier.offsetHeight / 2 - a.top - window.pageYOffset) / a.height; //(e.pageY-a.top-window.pageYOffset) / a.height;
            const imgData = context.getImageData(
                Math.floor(ratioX * canvas.width) - Math.floor(this.magnifySize / 2),
                Math.floor(ratioY * canvas.height) - Math.floor(this.magnifySize / 2),
                this.magnifySize, this.magnifySize
            );

            this.setState({
                cursorX: cursorX,
                cursorY: cursorY,
                magnifyGrid: new Array2D([...imgData.data], this.magnifySize, this.magnifySize, 4),
                magnifyVisible: true,
            });
        }

        // Magnifier events
        magnifier.addEventListener('mouseleave', (e) => {
            this.setState({ magnifyVisible: false });
        });
        canvas.addEventListener('mouseleave', (e) => {
            this.setState({ magnifyVisible: false });
        });
        canvas.addEventListener('mousemove', updateFunc);
        magnifier.addEventListener('mousemove', updateFunc);

        magnifier.addEventListener('touchend', (e) => {
            this.setState({ magnifyVisible: false });
        });
        canvas.addEventListener('touchend', (e) => {
            this.setState({ magnifyVisible: false });
        });
        canvas.addEventListener('touchmove', updateFunc);
        magnifier.addEventListener('touchmove', updateFunc);

        $(window).resize(() => {
            this.setState({ magnifyVisible: false });
        });
    }

    render() {
        return e('div', {
            id: `${this.props.imageId}-rgb-magnifier`,
            style: {
                position: 'absolute',
                border: '3.2vmax solid pink',
                cursor: 'none',
                visibility: this.state.magnifyVisible && !this.props.isRecording ? 'visible' : 'hidden',

                width: `${this.cellSize * (this.state.magnifyGrid.width + 0.5)}vmax`,
                height: `${this.cellSize * (this.state.magnifyGrid.height + 0.5)}vmax`,
                left: this.state.cursorX,
                top: this.state.cursorY,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }
        },
            e(RGBGrid, { grid: this.state.magnifyGrid, cellSize: this.cellSize }, null),
        );
    }
}