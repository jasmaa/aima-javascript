// RGB channel demo

/**
 * Displays RGB grid
 */
class RGBGrid extends React.Component {

    render(){

        let cells = [];
        for(let i=0; i < this.props.grid.height; i++){
            for(let j=0; j < this.props.grid.width; j++){
                const r = this.props.grid.getValue(i, j, 0);
                const g = this.props.grid.getValue(i, j, 1);
                const b = this.props.grid.getValue(i, j, 2);
                cells.push(
                    e(Cell, {
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
 * Top level RGB demo
 */
class RGBDemo extends React.Component {

    constructor(props) {
        super(props);
        this.imageId = 'rgb';
        this.size = 800;
        this.magnifySize = 11;
        this.cellSize = 0.5;

        this.showR = true;
        this.showG = true;
        this.showB = true;

        this.state = {
            cursorX: 0,
            cursorY: 0,
            magnifyGrid: new Array2D([], 5, 5, 4),
            magnifyVisible: false,
        }

        $(window).resize(() => this.resize());
    }

    componentDidMount() {
        document.getElementById(`${this.imageId}-rButton`).style.backgroundColor = this.showR ? "red" : "gray";
        document.getElementById(`${this.imageId}-gButton`).style.backgroundColor = this.showG ? "green" : "gray";
        document.getElementById(`${this.imageId}-bButton`).style.backgroundColor = this.showB ? "blue" : "gray";

        // Create magnifier
        const canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = canvas.getContext('2d');
        const magnifier = document.getElementById('rgb-magnifier');
        const updateFunc = (e)=>{

            e.preventDefault();

            const a = canvas.getBoundingClientRect();

            // Lock magnifier to image
            let cursorX = e.pageX - magnifier.offsetWidth/2;
            let cursorY = e.pageY - magnifier.offsetHeight/2;
            cursorX = Math.min(a.right+window.pageXOffset - magnifier.offsetWidth, Math.max(a.left+window.pageXOffset, cursorX));
            cursorY = Math.min(a.bottom+window.pageYOffset - magnifier.offsetHeight, Math.max(a.top + window.pageYOffset, cursorY));

            // Get selected area
            const ratioX = (e.pageX-a.left-window.pageXOffset) / a.width;
            const ratioY = (e.pageY-a.top-window.pageYOffset) / a.height;
            const imgData = context.getImageData(
                Math.floor(ratioX*this.size)-Math.floor(this.magnifySize/2),
                Math.floor(ratioY*this.size)-Math.floor(this.magnifySize/2),
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
        magnifier.addEventListener('mouseleave', (e)=>{
            this.setState({magnifyVisible: false,});
        });
        canvas.addEventListener('mouseleave', (e)=>{
            this.setState({magnifyVisible: false,});
        });
        canvas.addEventListener('mousemove', updateFunc);
        magnifier.addEventListener('mousemove', updateFunc);
        canvas.addEventListener('touchmove', updateFunc);
        magnifier.addEventListener('touchmove', updateFunc);
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

            e('div', {
                id: 'rgb-magnifier',
                style: {
                    position: 'absolute',
                    border: '0.5vmax solid pink',
                    cursor: 'none',
                    visibility: this.state.magnifyVisible ? 'visible' : 'hidden',

                    width: `${this.cellSize*(this.state.magnifyGrid.width+0.5)}vmax`,
                    height: `${this.cellSize*(this.state.magnifyGrid.height+0.5)}vmax`,
                    left: this.state.cursorX,
                    top: this.state.cursorY,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            },
                e(RGBGrid, {grid: this.state.magnifyGrid, cellSize: this.cellSize}, null),
            ),

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
                    style: {cursor: 'none'}
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