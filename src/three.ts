import { MOUSE, OrthographicCamera, Scene, TOUCH, Vector2, WebGLRenderer } from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";

let renderer: WebGLRenderer | undefined,
    camera: OrthographicCamera | undefined,
    controls: MapControls | undefined,
    resizeObserver: ResizeObserver | undefined;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new Scene();
const userData = { frustum: 100 };

const _dispose = () => {
    if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
    }
    if (controls) controls.dispose();
    if (camera) camera.clear();
    if (resizeObserver) resizeObserver.unobserve(canvas);

    scene.clear();
    renderer = undefined;
    camera = undefined;
    controls = undefined;
    resizeObserver = undefined;
};

const _resize = () => {
    window.requestAnimationFrame(() => {
        if (!renderer || !camera) return;

        const canvas = renderer.domElement;
        const pixelRatio = Math.min(window.devicePixelRatio, 1);
        const width = Math.floor(canvas.clientWidth * pixelRatio);
        const height = Math.floor(canvas.clientHeight * pixelRatio);

        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.left = (userData.frustum * aspect) / -2;
        camera.right = (userData.frustum * aspect) / 2;
        camera.top = userData.frustum / 2;
        camera.bottom = userData.frustum / -2;
        camera.updateProjectionMatrix();
    });
};

let once = false;
const _animateFromControls = () => {
    if (!renderer || !camera) return;
    if (once) {
        renderer.setAnimationLoop(null);
        once = false;
    }
    renderer.render(scene, camera);
};
const _animateFromRenderer = () => {
    if (!renderer || !camera) return;
    renderer.render(scene, camera);
};

const _init = (canvas: HTMLCanvasElement) => {
    _dispose();

    const pixelRatio = Math.min(window.devicePixelRatio, 1);
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const aspect = width / height;
    const w = userData.frustum * aspect;
    const h = userData.frustum;

    camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 0.1, 1000);
    controls = new MapControls(camera, canvas);
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });

    camera.zoom = 1;
    camera.position.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    controls.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: null };
    controls.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN };
    controls.target.set(0, 0, 0);
    controls.zoomToCursor = true;

    renderer.setAnimationLoop(_animateFromRenderer); // first renders
    controls.addEventListener("change", _animateFromControls);

    resizeObserver = new ResizeObserver(_resize);
    resizeObserver.observe(canvas);

    _resize();
};

_init(canvas);

const useThree = () => ({
    scene,

    setCamera: ({
        frustum,
        target,
        bottomView,
    }: {
        frustum?: number;
        target?: Vector2;
        bottomView?: boolean;
    }) => {
        if (!controls || !camera) return;
        camera.zoom = 1;
        const y = bottomView ? -1 : 1;

        if (target) {
            camera.position.x = target.x;
            camera.position.z = target.y;
            controls.target.set(target.x, 0, target.y);
        } else {
            camera.position.y = y;
        }
        controls.update();

        if (typeof frustum === "number") userData.frustum = frustum;
        _resize();
    },
});

export default useThree;
