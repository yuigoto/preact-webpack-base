import { h, render } from "preact";
import { Main } from "views/Main";
import "styles/main.scss";

const main = document.createElement("div");
main.id = "#app";

document.body.appendChild(main);

render(
  <Main />,
  main
);
