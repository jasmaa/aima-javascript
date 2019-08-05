// Pipeline 2d helpers
import { ImageUploader, WebcamCapture, PixelMagnifier } from '../../ui.js';

/**
 * Change input method
 * @param {string} input - Input method identifier
 */
export function pipelineChangeInput(input) {
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
export function pipelinePairRender() {
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
export function pipelineComponentDidMount() {
    this.img = document.getElementById(`${this.imageId}-img`);
}