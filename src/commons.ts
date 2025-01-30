import { BoxHelper, BufferAttribute, BufferGeometry, Color, Material, Mesh } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const vertexShader = `
    in vec4 color;
    out vec4 vColor;

    void main() {
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    in vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;

export const addColorAttribute = (geometry: BufferGeometry, color: Color, opacity: number) => {
    const count = geometry.getAttribute("position").count;
    const colors = new Float32Array(count * 4);
    for (let r = 0; r < count; ++r) {
        const i4 = r * 4;
        colors[i4] = color.r;
        colors[i4 + 1] = color.g;
        colors[i4 + 2] = color.b;
        colors[i4 + 3] = opacity;
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 4));
};

export const mergeGeometries = (geometries: BufferGeometry[]) => {
    const geometry = BufferGeometryUtils.mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    geometries.length = 0;
    geometry.computeBoundingBox();
    return geometry;
};

export const guiDatas = {
    url: "",
    fn: "SVGLoader.createShapes",
    strokes: true,
    fills: true,
    strokesWireframe: false,
    fillsWireframe: false,
    boxHelper: false,
};

export type GuiDatas = typeof guiDatas;
