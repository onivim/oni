
export interface FontMeasurement {
    width: number;
    height: number;
}

export function measureFont(fontFamily: string, fontSize: string, characterToTest?: string) {
    characterToTest = characterToTest || "H";
    var div = document.createElement("div");

    div.style.position = "absolute";
    div.style.left = "10px";
    div.style.top = "10px";
    div.style.backgroundColor = "red";
    div.style.left = "-1000px";
    div.style.top = "-1000px";

    div.textContent = "H";
    div.style.fontFamily = fontFamily;
    div.style.fontSize = fontSize;

    document.body.appendChild(div);

    var width = div.offsetWidth;
    var height = div.offsetHeight;

    // TODO: Remove child

    return {
        width: width,
        height: height
    }
}
