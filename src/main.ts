import "./style.css";
import GUI from "lil-gui";
import useThree from "./three";
import parser from "./parser";
import { guiDatas } from "./commons";
import { AxesHelper, BackSide, BoxHelper, DoubleSide, FrontSide, GridHelper } from "three";

const gui = new GUI();
const three = useThree();
const svgContainer = document.getElementById("svg") as HTMLElement;
const errorContainer = document.getElementById("error") as HTMLElement;

const update = () => {
    three.scene.clear();
    const { group, width, center, error } = parser.parse(svgContainer.innerHTML, guiDatas);

    if (guiDatas.helpers) {
        three.scene.add(new AxesHelper(100));
        three.scene.add(new GridHelper(1000));
        three.scene.add(new BoxHelper(group));
    }

    three.scene.add(group);
    errorContainer.innerText = error || "";
    return { width, center };
};

const fecthFile = async (url: string) => {
    const res = await fetch(`${__BASE_URL__}${url}`);
    svgContainer.innerHTML = await res.text();

    const { width, center } = update();
    three.setCamera({ frustum: width, target: center });
};

const uploadFile = async () => {
    const el = document.getElementById("inputFile") as HTMLInputElement;
    await new Promise((res) => {
        el.onchange = () => {
            if (!el.files) return;

            const reader = new FileReader();
            reader.onload = ({ target }) => {
                if (!target?.result) return;
                svgContainer.innerHTML = target.result as string;
                res(true);
            };
            reader.readAsText(el.files[0]);
        };
    });

    const { width, center } = update();
    three.setCamera({ frustum: width, target: center });
};

guiDatas.inputSelect = "part5_not_rendered.svg";
fecthFile(guiDatas.inputSelect);

gui.add(guiDatas, "helpers").name("Helpers").onChange(update);
gui.add(guiDatas, "bottomView").name("Bottom view").onChange(update);

{
    const f = gui.addFolder("SVG FILE");
    f.add(guiDatas, "inputSelect", [
        "original_fill_only.svg",
        "optimized_fill_only.svg",
        "part1_optimized.svg",
        "part2_optimized.svg",
        "part3_optimized.svg",
        "part4_optimized.svg",
        "part4_not_rendered.svg",
        "part5_not_rendered.svg",
        "triangle3And4.svg",
    ])
        .name("Select a file")
        .onChange(fecthFile);
    f.add(guiDatas, "inputFile").name("Upload a file").onChange(uploadFile);
    // f.add(guiDatas, "inputUrl").name("Or past a URL").onFinishChange(fecthFile);
}

{
    const f = gui.addFolder("SVG RENDERING");
    f.add(guiDatas, "strokes", ["full", "wireframe", "none"]).name("Draw strokes").onChange(update);
    f.add(guiDatas, "fills", ["full", "wireframe", "none"]).name("Draw fills").onChange(update);
    f.add(guiDatas, "side", { DoubleSide: DoubleSide, FrontSide: FrontSide, BackSide: BackSide })
        .name("Materials side")
        .onChange(update);
    f.add(guiDatas, "fn", [
        "SVGLoader.createShapes",
        "ShapePath.toShapes(holes CW)",
        "ShapePath.toShapes(holes CCW)",
        "ShapePath.toShapes(holes Auto)",
    ])
        .name("Fill Shape fn")
        .onChange(update);
}
