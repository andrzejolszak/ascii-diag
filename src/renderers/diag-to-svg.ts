import {Svg} from "@svgdotjs/svg.js";
import {Shape} from "../shapes/shape";
import Constants from "../constants";
import {RefObject} from "react";
import {LayerService} from "../layer-service";
import {SvgRendererService} from "./svg-renderer";
import {ConnectorTipDirectionService} from "../connector-tip-direction-service";

export class DiagToSvg {
    private readonly layerService: LayerService;
    private readonly ref: RefObject<HTMLDivElement>;
    private readonly svgRendererService: SvgRendererService;

    constructor(ref: RefObject<HTMLDivElement>,
                layerService: LayerService,
                connectorTipDirectionService: ConnectorTipDirectionService) {
        this.ref = ref;
        this.layerService = layerService;
        this.svgRendererService = new SvgRendererService(connectorTipDirectionService);
    }

    render(): void {
        const svg = new Svg('#drawing');
        svg.size(Constants.canvasWidth, Constants.canvasHeight);

        this.layerService.shapes.forEach((shape: Shape) => {
            this.svgRendererService.render(shape, svg);
        });

        if (this.ref.current) {
            this.ref.current.innerHTML = svg.svg();
        }
    }
}
