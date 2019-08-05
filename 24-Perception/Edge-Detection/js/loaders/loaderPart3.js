import { FallbackComponent } from '../ui.js';

// Render elements
ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/SuppressionDemo.js')), null, null),
    ),
    document.getElementById('suppression-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/ThresholdDemo.js')), null, null),
    ),
    document.getElementById('threshold-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dLongDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-long-root')
);