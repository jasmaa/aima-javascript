// Sobel operator image demo UI

/**
 * Sobel operator image demo
 */
class SobelImageDemo extends React.Component {

    constructor(props){
        super(props);
        this.imageId = 'sobel-image';
    }

    /**
     * Do edge detection pipeline on inputted image
     */
    process(){

        const canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = canvas.getContext('2d');
        const img = document.getElementById(`${this.imageId}-img`);

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, 0, 0, 200, 200);
        let imgData = context.getImageData(0, 0, 200, 200);
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
        for(let i=0; i < source.height; i++){
            for(let j=0; j < source.width; j++){
                let value = Math.sqrt(
                                Math.pow(sobelXData.data[4*(source.width*i + j) + 0], 2) +
                                Math.pow(sobelYData.data[4*(source.width*i + j) + 0], 2));
                
                source.data[4*(source.width*i + j) + 0] = value;
                source.data[4*(source.width*i + j) + 1] = value;
                source.data[4*(source.width*i + j) + 2] = value;
            }
        }

        // Stretch color for display
        stretchColor(source);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 600, 0);
    }

    render(){
        return e('div', null, [
            e('div', {key: 'control-row', className: 'row'},
                e('div', {key: 'col-1', className: 'col-md-9'},
                    e(ImageUploader, {
                        imageId: this.imageId,
                        defaultImage: 'images/test.png',
                        processHandler: () => this.process(),
                    }, null)
                )
            ),
            e('br', {key: 'space-1'}, null),
            e('br', {key: 'space-2'}, null),
            e('canvas', {
                key: `${this.imageId}-canvas`,
                id: `${this.imageId}-canvas`,
                width: '800',
                height: '200'
            }, null),
        ]);
    }
}

// Render elements
ReactDOM.render(
    e(SobelImageDemo, null, null),
    document.getElementById('sobel-image-root')
);
