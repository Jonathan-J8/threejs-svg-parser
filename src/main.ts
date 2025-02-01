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

const update = async (datas?: any) => {
    three.scene.clear();

    const { group, width, center, error } = parser.parse(svgContainer.innerHTML, guiDatas);
    if (guiDatas?.bottomView) three.setCamera({ frustum: width, target: center });
    if (datas?.resetCamera) three.setCamera({ frustum: width, target: center });

    if (guiDatas.helpers) {
        three.scene.add(new AxesHelper(100));
        three.scene.add(new GridHelper(1000));
        three.scene.add(new BoxHelper(group));
    }
    three.scene.add(group);

    errorContainer.innerText = error || "";
};

const fecthFile = async (str: string) => {
    const res = await fetch(str, { mode: "no-cors" });
    const text = await res.text();
    svgContainer.innerHTML = text;
    update({ resetCamera: true });
};

const uploadFile = async () => {
    const el = document.getElementById("inputFile") as HTMLInputElement;
    if (!el) return;
    el.onchange = () => {
        if (!el.files) return;
        const reader = new FileReader();

        reader.onload = ({ target }) => {
            if (!target?.result) return;
            svgContainer.innerHTML = target.result as string;
            update({ resetCamera: true });
        };

        reader.readAsText(el.files[0]);
    };
};

guiDatas.inputSelect = "/part5_not_rendered.svg";
guiDatas.fn = "SVGLoader.createShapes";
guiDatas.strokes = "full";
guiDatas.fills = "full";
guiDatas.helpers = false;
guiDatas.bottomView = false;

fecthFile(guiDatas.inputSelect);

{
    const f = gui.addFolder("SVG FILE");
    f.add(guiDatas, "inputSelect", [
        "/part5_not_rendered.svg",
        "/part4_not_rendered.svg",
        "/original_fill_only.svg",
        "/optimized_fill_only.svg",
        "/part1_optimized.svg",
        "/part2_optimized.svg",
        "/part3_optimized.svg",
        "/part4_optimized.svg",
    ])
        .name("Select an file")
        .onChange(fecthFile);
    f.add(guiDatas, "inputFile").name("Or upload a file").onChange(uploadFile);
    // f.add(guiDatas, "inputUrl").name("Or past a URL").onFinishChange(fecthFile);
}

{
    const f = gui.addFolder("SVG RENDERING");
    f.add(guiDatas, "strokes", ["full", "wireframe", "none"]).name("Draw Strokes").onChange(update);
    f.add(guiDatas, "fills", ["full", "wireframe", "none"]).name("Draw Fills").onChange(update);
    f.add(guiDatas, "fn", [
        "SVGLoader.createShapes",
        "ShapePath.toShapes CW",
        "ShapePath.toShapes CCW",
        "ShapePath.toShapes Auto",
    ])
        .name("Fill Shape fn")
        .onChange(update);
}
{
    const f = gui.addFolder("OTHERS");
    f.add(guiDatas, "helpers").name("Helpers").onChange(update);
    f.add(guiDatas, "bottomView")
        .name("Bottom view")
        .onChange((bottomView: boolean) => three.setCamera({ bottomView }));
}
