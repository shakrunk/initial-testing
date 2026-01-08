export function createSvgIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  if (name === "link") {
    // Used in setupHeadingLinks and btnCopyLink
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71");
    svg.appendChild(path1);

    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71");
    svg.appendChild(path2);
  } else if (name === "copy") {
    // Used in btnCopyText
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "9");
    rect.setAttribute("y", "9");
    rect.setAttribute("width", "13");
    rect.setAttribute("height", "13");
    rect.setAttribute("rx", "2");
    rect.setAttribute("ry", "2");
    svg.appendChild(rect);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1");
    svg.appendChild(path);
  } else if (name === "external-link") {
    // Used for external links
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6");
    svg.appendChild(path);

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", "15 3 21 3 21 9");
    svg.appendChild(polyline);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "10");
    line.setAttribute("y1", "14");
    line.setAttribute("x2", "21");
    line.setAttribute("y2", "3");
    svg.appendChild(line);
  }

  return svg;
}
