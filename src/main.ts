import "./style.css";
import GUI from "lil-gui";
import useThree from "./three";
import parser from "./parser";
import { guiDatas } from "./commons";
import { BoxHelper } from "three";

const gui = new GUI();
const three = useThree();
const svgContainer = document.getElementById("svg") as HTMLElement;
const errorContainer = document.getElementById("error") as HTMLElement;

let prevUrl = "";
guiDatas.url = "/svg_optimize_part1.svg";

const update = async () => {
    const { url, boxHelper } = guiDatas;
    const res = await fetch(url);
    svgContainer.innerHTML = await res.text();

    three.scene.clear();
    const { group, width, error } = parser.parse(svgContainer.innerHTML, guiDatas);

    if (boxHelper) {
        const box = new BoxHelper(group);
        three.scene.add(box);
    }
    three.scene.add(group);
    if (url !== prevUrl) {
        // reset camera to default
        three.resetCamera(width);
    }

    errorContainer.innerText = error || "";
    prevUrl = url;
};

update();

gui.add(guiDatas, "url", [
    "/svg_original_fill_only.svg",
    "/svg_optimize_fill_only.svg",
    "/svg_optimize_part1.svg",
    "/svg_optimize_part1_bis.svg",
    "/svg_optimize_part1_modified.svg",
    "/svg_optimize_part2.svg",
    "/svg_optimize_part3.svg",
])
    .name("SVG file")
    .onChange(update);
gui.add(guiDatas, "fn", [
    "SVGLoader.createShapes",
    "ShapePath.toShapes CW",
    "ShapePath.toShapes CCW",
    "ShapePath.toShapes Auto",
])
    .name("Shape function")
    .onChange(update);
gui.add(guiDatas, "strokes").name("Draw strokes").onChange(update);
gui.add(guiDatas, "fills").name("Draw fill shapes").onChange(update);
gui.add(guiDatas, "strokesWireframe").name("Wireframe strokes").onChange(update);
gui.add(guiDatas, "fillsWireframe").name("Wireframe fill shapes").onChange(update);
gui.add(guiDatas, "boxHelper").name("Box helper").onChange(update);
