import "./style.css";
import GUI from "lil-gui";
import useThree from "./three";
import parser from "./parser";
import { guiDatas } from "./commons";
import { AxesHelper, BoxHelper, GridHelper } from "three";

const gui = new GUI();
const three = useThree();
const svgContainer = document.getElementById("svg") as HTMLElement;
const errorContainer = document.getElementById("error") as HTMLElement;

let prevUrl = "";
guiDatas.url = "/part5_not_rendered.svg";
guiDatas.fn = "SVGLoader.createShapes";
guiDatas.strokes = true;
guiDatas.fills = true;
guiDatas.strokesWireframe = false;
guiDatas.fillsWireframe = false;
guiDatas.helpers = false;

const update = async () => {
    const { url, helpers } = guiDatas;
    const res = await fetch(url);
    svgContainer.innerHTML = await res.text();

    const { group, width, center, error } = parser.parse(svgContainer.innerHTML, guiDatas);

    if (url !== prevUrl) three.setCamera({ frustum: width, target: center });
    three.scene.clear();

    if (helpers) {
        three.scene.add(new AxesHelper(100));
        three.scene.add(new GridHelper(1000));
        three.scene.add(new BoxHelper(group));
    }
    three.scene.add(group);

    errorContainer.innerText = error || "";
    prevUrl = url;
};

update();

gui.add(guiDatas, "url", [
    "/part5_not_rendered.svg",
    "/part4_not_rendered.svg",
    "/original_fill_only.svg",
    "/optimized_fill_only.svg",
    "/part1_optimized.svg",
    "/part2_optimized.svg",
    "/part3_optimized.svg",
    "/part4_optimized.svg",
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
gui.add(guiDatas, "helpers").name("Helpers").onChange(update);
