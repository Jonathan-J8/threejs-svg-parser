import {
    Box3,
    BufferGeometry,
    Color,
    Group,
    Mesh,
    ShaderMaterial,
    Shape,
    ShapeGeometry,
    ShapePath,
    ShapeUtils,
    Vector2,
    Vector3,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import {
    vertexShader,
    fragmentShader,
    addColorAttribute,
    type GuiDatas,
    mergeGeometries,
    getGeomtryCenter,
} from "./commons";

const parse = (value: string, options: GuiDatas) => {
    let error = "";
    const svgData = new SVGLoader().parse(value);
    const strokeGeometries: BufferGeometry[] = [];
    const fillGeometries: BufferGeometry[] = [];
    const color = new Color();
    const group = new Group();

    /**
     * grab geometries datas
     */
    const drawFills = options.fills === "full" || options.fills === "wireframe";
    const drawStrokes = options.strokes === "full" || options.strokes === "wireframe";

    for (let i = 0, len = svgData.paths.length; i < len; ++i) {
        const path = svgData.paths[i] as ShapePath & { userData: any };
        const { fill, fillOpacity, stroke, strokeOpacity } = path.userData?.style;

        if (drawStrokes && stroke && stroke !== "none") {
            for (let j = 0, len = path.subPaths.length; j < len; ++j) {
                const subPath = path.subPaths[j];
                const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
                if (!geometry) continue;

                color.setStyle(stroke);
                addColorAttribute(geometry, color, strokeOpacity ?? 1);
                strokeGeometries.push(geometry);
            }
        }

        if (drawFills && fill && fill !== "none") {
            try {
                let shapes: Shape[];
                if (options.fn === "ShapePath.toShapes CW") shapes = path.toShapes(false);
                else if (options.fn === "ShapePath.toShapes CCW") shapes = path.toShapes(true);
                else if (options.fn === "ShapePath.toShapes Auto")
                    shapes = path.toShapes(ShapeUtils.isClockWise(path.subPaths[0].getPoints()));
                else shapes = SVGLoader.createShapes(path);

                const geometry = new ShapeGeometry(shapes);
                color.setStyle(fill);
                addColorAttribute(geometry, color, fillOpacity ?? 1);
                fillGeometries.push(geometry);
            } catch (err) {
                error += `${(err as Error)?.message}\n`;
                console.error(err);
                continue;
            }
        }
    }

    /**
     * merge geometries and setup meshes
     */

    if (fillGeometries.length > 0) {
        const geometry = mergeGeometries(fillGeometries);

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            depthWrite: false,
            side: options.side,
            wireframe: options.fills === "wireframe",
        });
        const mesh = new Mesh(geometry, material);
        mesh.renderOrder = 0;
        group.add(mesh);
    }

    if (strokeGeometries.length > 0) {
        const geometry = mergeGeometries(strokeGeometries);

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            depthWrite: false,
            side: options.side,
            wireframe: options.strokes === "wireframe",
        });
        const mesh = new Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);
    }

    /**
     * setup group, size group and geometry center
     */

    const box = new Box3();
    const size = new Vector3();
    box.setFromObject(group);
    box.getSize(size);

    const center = new Vector2();
    const firstMesh = group.children[0];
    if (firstMesh instanceof Mesh) center.copy(getGeomtryCenter(firstMesh.geometry));

    if (options.bottomView) {
        group.rotation.x = Math.PI * -0.5;
        group.position.z = center.y * 2;
    } else group.rotation.x = Math.PI * 0.5;

    return { group, width: size.x, height: size.y, center, error };
};

const parser = { parse };
export default parser;
