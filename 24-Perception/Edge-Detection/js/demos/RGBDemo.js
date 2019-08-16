// RGB channel demo

/**
 * Top level RGB demo
 */
class RGBDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'rgb';
        this.size = 200;
        this.state = { isRecording: false };

        this.showR = true;
        this.showG = true;
        this.showB = true;

        this.changeInput = pipelineChangeInput.bind(this);

        $(window).resize(() => this.resize());
    }

    componentDidMount() {
        this.img = document.getElementById(`${this.imageId}-img`);

        document.getElementById(`${this.imageId}-rButton`).style.backgroundColor = this.showR ? "red" : "gray";
        document.getElementById(`${this.imageId}-gButton`).style.backgroundColor = this.showG ? "green" : "gray";
        document.getElementById(`${this.imageId}-bButton`).style.backgroundColor = this.showB ? "blue" : "gray";
    }

    resize() {
        if (innerWidth > 700) {
            this.canvas.style.width = (innerWidth / 3) + 'px';
        }
        else {
            this.canvas.style.width = (innerWidth - 70) + 'px';
        }
    }

    process() {

        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(this.img, 0, 0, this.size, this.size);
        let imgData = context.getImageData(0, 0, this.size, this.size);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

        filterColor(source, this.showR, this.showG, this.showB);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 0, 0);

        this.resize();
    }

    toggleColor(channel) {
        if (channel == 0) {
            this.showR = !this.showR;
            document.getElementById(`${this.imageId}-rButton`).style.backgroundColor = this.showR ? "red" : "gray";
        }
        else if (channel == 1) {
            this.showG = !this.showG;
            document.getElementById(`${this.imageId}-gButton`).style.backgroundColor = this.showG ? "green" : "gray";
        }
        else if (channel == 2) {
            this.showB = !this.showB;
            document.getElementById(`${this.imageId}-bButton`).style.backgroundColor = this.showB ? "blue" : "gray";
        }

        this.process();
    }

    render() {
        return e('div', { className: 'demo-container' },

            e(PixelMagnifier, {
                imageId: this.imageId,
                isRecording: this.state.isRecording,
            }, null),

            e('div', { style: { display: 'flex', flexDirection: 'row' } },
                e(ImageUploader, {
                    imageId: this.imageId,
                    defaultImage: '/third-party/leds.jpg',
                    processHandler: () => this.process(),
                    changeHandler: () => this.changeInput('image'),
                }, null),
                e(WebcamCapture, {
                    imageId: this.imageId,
                    isRecording: this.state.isRecording,
                    processHandler: () => this.process(),
                    changeHandler: () => this.changeInput('webcam'),
                }, null),
            ),
            e('br', null, null),


            e('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            },
                e('canvas', {
                    id: `${this.imageId}-canvas`,
                    width: this.size,
                    height: this.size,
                }, null),
                e('div', null,
                    e('button', {
                        id: `${this.imageId}-rButton`,
                        className: 'rgb-control-button',
                        onClick: () => this.toggleColor(0)
                    },
                        'R'),
                    e('button', {
                        id: `${this.imageId}-gButton`,
                        className: 'rgb-control-button',
                        onClick: () => this.toggleColor(1),
                    }, 'G'),
                    e('button', {
                        id: `${this.imageId}-bButton`,
                        className: 'rgb-control-button',
                        onClick: () => this.toggleColor(2),
                    }, 'B'),
                ),
            ),
        );
    }
}