
const fabricData = {};

function getData(fabricLine) {
    if (!fabricData[fabricLine]) {
        fabricData[fabricLine] = d3.csv(fabricLine + ".csv")
            .then(data => {
                return data.map(row => {
                    return {
                        ...row,
                        rgb: row["rgb"].slice(1, -1).replaceAll(" ", "")
                            .split(",").map(c => parseInt(c))
                    };
                });
            });
    }
    return fabricData[fabricLine];
}

function dist(c1, c2) {
    return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2;
}

function hexToRgb(hex) {
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.toLowerCase());
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

async function updateMatches(e) {
    e?.preventDefault();

    // Read the fabric line and get data for it.
    const fabricLine = document.getElementsByTagName("select")[0].value;
    const data = await getData(fabricLine);
    // Read the provided color hex code and update the sample swatch.
    let color = document.getElementsByTagName("input")[0].value;
    color = color.toUpperCase();
    if (color.startsWith("#")) {
        color = color.slice(1); 
    }
    // Rewrite a formatted and uppercase version of the color.
    document.getElementsByTagName("input")[0].value = color;
    document.getElementById("color-sample").style.backgroundColor = "#" + color;
    // Remove all existing children from the results element.
    const results = document.getElementById("results");
    let child = results.lastElementChild;
    while (child) {
        results.removeChild(child);
        child = results.lastElementChild;
    }
    // Calculate the similar colors by sorting by distance.
    const hexColor = hexToRgb(color);
    const fabrics =
        data.sort((a, b) => {
            return dist(a["rgb"], hexColor) - dist(b["rgb"], hexColor);
        }).slice(0, 6);

    // Render the most similar colors.
    for (const fabric of fabrics) {
        const container = document.createElement("div");
        container.classList.add("col");
        container.classList.add("col-4");
        container.innerHTML = `
            <img src="images/${fabricLine}/${fabric.src}">
            <p>${fabric.id}<br>${fabric.name}</p>`;
        results.appendChild(container);
    }
}

updateMatches();
document.querySelector("form").addEventListener("change", updateMatches);
document.querySelector("form").addEventListener("submit", updateMatches);