// 2D pipeline demos

// === HELPER FUNCS ===

/**
 * Change input method
 * @param {string} input - Input method identifier
 */
function pipelineChangeInput(input) {
    if (input == 'webcam') {
        this.img = document.getElementById(`${this.imageId}-webcam`);
    }
    else if (input == 'image') {
        this.img = document.getElementById(`${this.imageId}-img`);

        // Shut off webcam
        let video = document.getElementById(`${this.imageId}-webcam`);
        let stream = video.srcObject;
        if (stream) {
            let tracks = stream.getTracks();

            for (let i = 0; i < tracks.length; i++) {
                let track = tracks[i];
                track.stop();
            }

            video.srcObject = null;
        }
    }
}

/**
 * Render paired pipeline
 */
function pipelinePairRender() {
    return e('div', { className: 'demo-container' },


        e(PixelMagnifier, {
            imageId: `${this.imageId}-in`,
        }, null),
        e(PixelMagnifier, {
            imageId: `${this.imageId}-out`,
        }, null),


        e('div', { style: { display: 'flex', flexDirection: 'row' } },
            e(ImageUploader, {
                imageId: this.imageId,
                defaultImage: '../images/test.png',
                processHandler: () => this.process(),
                changeHandler: () => this.changeInput('image'),
            }, null),
            e(WebcamCapture, {
                imageId: this.imageId,
                processHandler: () => this.process(),
                changeHandler: () => this.changeInput('webcam'),
            }, null),
        ),

        e('br', null, null),
        e('div', {
            style: {
                display: 'flex',
                justifyContent: 'space-evenly'
            }
        },
            e('canvas', {
                id: `${this.imageId}-in-canvas`,
                width: this.canvasWidth,
                height: this.canvasHeight,
                style: {
                    width: '50%',
                }
            }, null),
            e('canvas', {
                id: `${this.imageId}-out-canvas`,
                width: this.canvasWidth,
                height: this.canvasHeight,
                style: {
                    width: '50%',
                }
            }, null),
        ),
    );
}

/**
 * Set image on mount
 */
function pipelineComponentDidMount() {
    this.img = document.getElementById(`${this.imageId}-img`);
}


// === COMPONENTS ===

/**
 * 2D pipeline top-level demo
 * Direct pipeline: color-> final
 */
class Pipeline2dDirectDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'pipeline2d-direct-image';
        this.canvasWidth = 200;
        this.canvasHeight = 200;
        this.canvas = null;

        this.changeInput = pipelineChangeInput.bind(this);
        this.render = pipelinePairRender.bind(this);
        this.componentDidMount = pipelineComponentDidMount.bind(this);
    }

    /**
     * Do edge detection pipeline on inputted image
     */
    process() {

        const size = 200;
        const inCanvas = document.getElementById(`${this.imageId}-in-canvas`);
        const inContext = inCanvas.getContext('2d');
        const outCanvas = document.getElementById(`${this.imageId}-out-canvas`);
        const outContext = outCanvas.getContext('2d');

        // Clear canvas
        inContext.clearRect(0, 0, inCanvas.width, inCanvas.height);
        outContext.clearRect(0, 0, outCanvas.width, outCanvas.height);

        inContext.drawImage(this.img, 0, 0, size, size);
        let imgData = inContext.getImageData(0, 0, size, size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

        // Convert to grayscale
        grayscale(source);

        // Do gaussian blur with 5x5 filter
        convolve(source, gaussianBlur5);

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelXData, sobelX);

        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelYData, sobelY);

        // Calculate magnitude of gradients
        const [magGrid, angleGrid] = computeGradients(sobelXData, sobelYData);
        stretchColor(magGrid);

        // Do non maximum suppression
        let suppressed = nonMaxSuppress(magGrid, angleGrid);

        // Do double threshold
        doubleThreshold(suppressed, 50, 25);

        // Do edge tracking
        edgeConnect(suppressed);

        // Draw final
        fillArray(imgData.data, suppressed.data, imgData.data.length);
        outContext.putImageData(imgData, 0, 0);
    }
}

/**
 * 2D pipeline top-level demo
 * Direct pipeline: color-> gray
 */
class Pipeline2dGrayscaleDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'pipeline2d-gray-image';
        this.canvasWidth = 200;
        this.canvasHeight = 200;

        this.changeInput = pipelineChangeInput.bind(this);
        this.render = pipelinePairRender.bind(this);
        this.componentDidMount = pipelineComponentDidMount.bind(this);
    }

    /**
     * Do edge detection pipeline on inputted image
     */
    process() {

        const size = 200;
        const inCanvas = document.getElementById(`${this.imageId}-in-canvas`);
        const inContext = inCanvas.getContext('2d');
        const outCanvas = document.getElementById(`${this.imageId}-out-canvas`);
        const outContext = outCanvas.getContext('2d');

        // Clear canvas
        inContext.clearRect(0, 0, inCanvas.width, inCanvas.height);
        outContext.clearRect(0, 0, outCanvas.width, outCanvas.height);

        inContext.drawImage(this.img, 0, 0, size, size);
        let imgData = inContext.getImageData(0, 0, size, size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

        // Convert to grayscale
        grayscale(source);

        fillArray(imgData.data, source.data, imgData.data.length);
        outContext.putImageData(imgData, 0, 0);
    }
}

/**
 * 2D pipeline top-level demo
 * Short pipeline: color-> gray-> sobelx+y-> grads
 */
class Pipeline2dShortDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'pipeline2d-short-image';
        this.canvasWidth = 850;
        this.canvasHeight = 420;
        this.canvas = null;

        this.changeInput = pipelineChangeInput.bind(this);
        this.componentDidMount = pipelineComponentDidMount.bind(this);
    }

    /**
     * Do edge detection pipeline on inputted image
     */
    process() {

        const size = 190;
        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(this.img, 0, 100, size, size);
        let imgData = context.getImageData(0, 100, size, size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

        // Convert to grayscale
        grayscale(source);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 220, 100);

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelXData, sobelX);

        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelYData, sobelY);

        // Calculate magnitude of gradients
        const [magGrid, angleGrid] = computeGradients(sobelXData, sobelYData);


        // Display sobels with red-green
        stretchColorRange(sobelXData, -1020, 1020, 0, 1);
        for (let i = 0; i < sobelXData.height; i++) {
            for (let j = 0; j < sobelXData.width; j++) {
                const colorVals = divergingColormap(sobelXData.getValue(i, j));
                sobelXData.setValue(colorVals[0], i, j, 0);
                sobelXData.setValue(colorVals[1], i, j, 1);
                sobelXData.setValue(colorVals[2], i, j, 2);
            }
        }
        fillArray(imgData.data, sobelXData.data, imgData.data.length);
        context.putImageData(imgData, 440, 0);

        stretchColorRange(sobelYData, -1020, 1020, 0, 1);
        for (let i = 0; i < sobelYData.height; i++) {
            for (let j = 0; j < sobelYData.width; j++) {
                const colorVals = divergingColormap(sobelYData.getValue(i, j));
                sobelYData.setValue(colorVals[0], i, j, 0);
                sobelYData.setValue(colorVals[1], i, j, 1);
                sobelYData.setValue(colorVals[2], i, j, 2);
            }
        }
        fillArray(imgData.data, sobelYData.data, imgData.data.length);
        context.putImageData(imgData, 440, 210);

        stretchColor(magGrid, 0, 255);
        fillArray(imgData.data, magGrid.data, imgData.data.length);
        context.putImageData(imgData, 660, 100);

        // Draw labels
        context.font = "11px Arial";
        context.fillText("Color", 0, 300);
        context.fillText("Grayscale", 220, 300);
        context.fillText("Sobel X", 440, 200);
        context.fillText("Sobel Y", 440, 410);
        context.fillText("Gradients", 660, 300);

        // Draw lines
        context.lineWidth = 2;
        context.beginPath();
        canvasArrowCurveX(context, 0 + size, 100 + size / 2, 220, 100 + size / 2);
        canvasArrowCurveX(context, 220 + size, 100 + size / 2, 440, 0 + size / 2);
        canvasArrowCurveX(context, 220 + size, 100 + size / 2, 440, 210 + size / 2);
        canvasArrowCurveX(context, 440 + size, 0 + size / 2, 660, 100 + size / 2);
        canvasArrowCurveX(context, 440 + size, 210 + size / 2, 660, 100 + size / 2);
        context.stroke();
    }

    render() {
        return e('div', { className: 'demo-container' },

            e('div', { style: { display: 'flex', flexDirection: 'row' } },
                e(ImageUploader, {
                    imageId: this.imageId,
                    defaultImage: '../images/test.png',
                    processHandler: () => this.process(),
                    changeHandler: () => this.changeInput('image'),
                }, null),
                e(WebcamCapture, {
                    imageId: this.imageId,
                    processHandler: () => this.process(),
                    changeHandler: () => this.changeInput('webcam'),
                }, null),
                e('div', { style: { display: 'flex', flex: 1 } }, null),
                e('div', { className: 'btn-group mr-2', role: 'group' },
                    e('div', {
                        className: 'btn btn-info', onClick: () => {
                            this.img.src = "../images/vertLines.png";
                            this.changeInput('image');
                            this.process();
                        }
                    }, '▥'),
                    e('div', {
                        className: 'btn btn-info', onClick: () => {
                            this.img.src = "../images/horiLines.png";
                            this.changeInput('image');
                            this.process();
                        }
                    }, '▤'),
                    e('div', {
                        className: 'btn btn-info', onClick: () => {
                            this.img.src = "../images/gridLines.png";
                            this.changeInput('image');
                            this.process();
                        }
                    }, '▦'),
                ),
            ),

            e('br', null, null),
            e('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                }
            },
                e('canvas', {
                    id: `${this.imageId}-canvas`,
                    width: this.canvasWidth,
                    height: this.canvasHeight,
                }, null),
            ),
        );
    }
}

/**
 * 2D pipeline top-level demo
 * Long pipeline: color-> gray-> blur-> grads-> nonmax-> dubthresh-> hystersis
 */
class Pipeline2dLongDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'pipeline2d-long-image';
        this.canvasWidth = 850;
        this.canvasHeight = 440;

        this.changeInput = pipelineChangeInput.bind(this);
        this.render = pipelineRender.bind(this);
        this.componentDidMount = pipelineComponentDidMount.bind(this);

        this.canvas = null;
    }

    /**
     * Do edge detection pipeline on inputted image
     */
    process() {

        const size = 190;
        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(this.img, 0, 0, size, size);
        let imgData = context.getImageData(0, 0, size, size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

        // Convert to grayscale
        grayscale(source);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 200, 0);

        // Do gaussian blur with 5x5 filter
        convolve(source, gaussianBlur5);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 400, 0);

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelXData, sobelX);

        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...source.data], source.width, source.height, 4);
        convolve(sobelYData, sobelY);

        // Calculate magnitude of gradients
        const [magGrid, angleGrid] = computeGradients(sobelXData, sobelYData);
        stretchColor(magGrid);

        fillArray(imgData.data, magGrid.data, imgData.data.length);
        context.putImageData(imgData, 600, 0);

        // Do non maximum suppression
        let suppressed = nonMaxSuppress(magGrid, angleGrid);
        fillArray(imgData.data, suppressed.data, imgData.data.length);
        context.putImageData(imgData, 200, 230);

        // Do double threshold
        doubleThreshold(suppressed, 50, 25);
        fillArray(imgData.data, suppressed.data, imgData.data.length);
        context.putImageData(imgData, 400, 230);

        // Do edge tracking
        edgeConnect(suppressed);
        fillArray(imgData.data, suppressed.data, imgData.data.length);
        context.putImageData(imgData, 600, 230);

        // Draw labels
        context.font = "11px Arial";
        context.fillText("Color", 0, 200);
        context.fillText("Grayscale", 200, 200);
        context.fillText("Blurred", 400, 200);
        context.fillText("Gradients", 600, 200);
        context.fillText("Non-Maximum Suppression", 200, 430);
        context.fillText("Double Thresholding", 400, 430);
        context.fillText("Edge Tracking by Hysteresis", 600, 430);
    }
}


// Render elements
if (document.getElementById('pipeline2d-direct-root')) {
    ReactDOM.render(
        e(Pipeline2dDirectDemo, null, null),
        document.getElementById('pipeline2d-direct-root')
    );
}
if (document.getElementById('pipeline2d-gray-root')) {
    ReactDOM.render(
        e(Pipeline2dGrayscaleDemo, null, null),
        document.getElementById('pipeline2d-gray-root')
    );
}

if (document.getElementById('pipeline2d-short-root')) {
    ReactDOM.render(
        e(Pipeline2dShortDemo, null, null),
        document.getElementById('pipeline2d-short-root')
    );
}
if (document.getElementById('pipeline2d-long-root')) {
    ReactDOM.render(
        e(Pipeline2dLongDemo, null, null),
        document.getElementById('pipeline2d-long-root')
    );
}
