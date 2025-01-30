import {
    AmbientLight,
    AxesHelper,
    GridHelper,
    MOUSE,
    OrthographicCamera,
    Scene,
    TOUCH,
    WebGLRenderer,
} from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { beforeUpdate } from "./helpers";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
let renderer: WebGLRenderer | undefined,
    camera: OrthographicCamera | undefined,
    controls: MapControls | undefined,
    resizeObserver: ResizeObserver | undefined;
const scene = new Scene();
const userData = {
    frustum: 100,
};

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

    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const aspect = width / height;

    camera = new OrthographicCamera(
        (userData.frustum * aspect) / -2,
        (userData.frustum * aspect) / 2,
        userData.frustum / 2,
        userData.frustum / -2,
        0.1,
        1000
    );

    camera.zoom = 1;
    camera.position.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    controls = new MapControls(camera, canvas);

    controls.mouseButtons = {
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: null,
    };
    controls.touches = {
        ONE: TOUCH.PAN,
        TWO: TOUCH.DOLLY_PAN,
    };
    controls.target.set(0, 0, 0);
    controls.zoomToCursor = true;

    scene.add(new AxesHelper(1000));
    scene.add(new GridHelper(1000));
    scene.add(new AmbientLight(0xffffff, 10));
    scene.add(camera);

    renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    renderer.setAnimationLoop(_animateFromRenderer); // first renders
    controls.addEventListener("change", _animateFromControls);

    _resize();
    resizeObserver = new ResizeObserver(_resize);
    resizeObserver.observe(canvas);
};

_init(canvas);
beforeUpdate(_dispose);

const useThree = () => ({
    scene,

    resetCamera: (frustum: number) => {
        if (controls && camera) {
            camera.zoom = 1;
            camera.position.set(0, 1, 0);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
        }

        userData.frustum = frustum;
        _resize();
    },
});

export default useThree;
