import {ConnectorRenderer} from "./connector-renderer";
import {BoxRenderer} from "./box-renderer";
import {TextRenderer} from "./text-renderer";
import {Shape} from "../shapes/shape";
import {ConnectorShape} from "../shapes/connector-shape"
import {TextShape} from "../shapes/text-shape";
import {BoxShape} from "../shapes/box-shape";
import {Svg} from "@svgdotjs/svg.js";
import {SvgRenderer} from "./svg-renderer";

export class SvgRendererService {

    private readonly boxRenderer: SvgRenderer;
    private readonly connectorRenderer: SvgRenderer;
    private readonly textRenderer: SvgRenderer;

    constructor() {
        this.connectorRenderer = new ConnectorRenderer();
        this.boxRenderer = new BoxRenderer();
        this.textRenderer = new TextRenderer();
    }

    render(shape: Shape, svg: Svg) {
        if (shape instanceof BoxShape) {
            this.boxRenderer.render(shape, svg);
        } else if (shape instanceof ConnectorShape) {
            this.connectorRenderer.render(shape, svg);
        } else if (shape instanceof TextShape) {
            this.textRenderer.render(shape, svg);
        }
    }
}
