
/**
 * Top level RGB demo
 */
class RGBDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'rgb';
        this.size = 800;

        this.showR = true;
        this.showG = true;
        this.showB = true;

        $(window).resize(() => this.resize());
    }

    componentDidMount() {
        document.getElementById(`${this.imageId}-rButton`).style.backgroundColor = this.showR ? "red" : "gray";
        document.getElementById(`${this.imageId}-gButton`).style.backgroundColor = this.showG ? "green" : "gray";
        document.getElementById(`${this.imageId}-bButton`).style.backgroundColor = this.showB ? "blue" : "gray";
    }

    resize() {
        if (innerWidth > 700) {
            this.canvas.style.width = (innerWidth / 3) + 'px';
        }
        else {
            this.canvas.style.width = (innerWidth - 30) + 'px';
        }
    }

    process() {
        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');
        const img = document.getElementById(`${this.imageId}-img`);

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(img, 0, 0, this.size, this.size);
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
            e(ImageUploader, {
                imageId: this.imageId,
                defaultImage: '/third-party/leds.jpg',
                processHandler: () => this.process(),
            }, null),
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
                        style: { border: 'none', padding: 15 },
                        onClick: () => this.toggleColor(0)
                    },
                        'R'),
                    e('button', {
                        id: `${this.imageId}-gButton`,
                        style: { border: 'none', padding: 15 },
                        onClick: () => this.toggleColor(1),
                    }, 'G'),
                    e('button', {
                        id: `${this.imageId}-bButton`,
                        style: { border: 'none', padding: 15 },
                        onClick: () => this.toggleColor(2),
                    }, 'B'),
                ),
            ),
        );
    }
}

// Render
ReactDOM.render(
    e(RGBDemo, null, null),
    document.getElementById('rgb-root')
);