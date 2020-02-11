import {Tool} from "./tool";
import {LayerService} from "../layer-service";
import {SelectBoxDrawer} from "../drawers/select-box-drawer";
import Constants from "../constants";
import {BoxDrawer} from "../drawers/box-drawer";
import {ToolService} from "./tool-service";
import {TextShape} from "../shapes/text-shape";
import {Vertex} from "../drawers/vertex";
import {VertexDrawer} from "../drawers/vertex-drawer";
import {Text} from "../drawers/text";
import {TextDrawer} from "../drawers/text-drawer";
import {AppState} from "../ui/app-state";
import {StateProvider} from "../ui/state-provider";

export class TextMoveTool implements Tool {

    private readonly layerService: LayerService;
    private readonly toolService: ToolService;
    private readonly selectBoxDrawer: SelectBoxDrawer;
    private readonly boxDrawer: BoxDrawer;
    private readonly vertexDrawer: VertexDrawer;
    private readonly textDrawer: TextDrawer;

    private readonly currentShape: TextShape;
    protected currentText: Text;
    private moveVertex: Vertex;

    constructor(layerService: LayerService, toolService: ToolService, selectBoxDrawer: SelectBoxDrawer,
                boxDrawer: BoxDrawer, vertexDrawer: VertexDrawer, textDrawer: TextDrawer, shape: TextShape) {

        this.layerService = layerService;
        this.toolService = toolService;
        this.selectBoxDrawer = selectBoxDrawer;
        this.boxDrawer = boxDrawer;
        this.vertexDrawer = vertexDrawer;
        this.textDrawer = textDrawer;

        this.currentShape = shape;
        this.currentText = Text.fromGrid(this.currentShape.row, this.currentShape.column, this.currentShape.text);
        this.moveVertex = Vertex.fromGrid(this.currentShape.row, this.currentShape.column);
        console.log("Start moving text");
        this.currentShape.startEditing();
    }

    private fromCanvasToGridPos(x: number, y: number): [number, number] {
        return [Math.round(y / Constants.densityY), Math.round(x / Constants.densityX)];
    }

    drag(startRow: number, startColumn: number, row: number, column: number, x: number, y: number, appState: Readonly<AppState>): void {
        const [vertexRow, vertexColumn] = this.fromCanvasToGridPos(x, y);
        this.moveVertex = Vertex.fromGrid(vertexRow, vertexColumn);
        this.currentText = Text.fromGrid(vertexRow, vertexColumn, this.currentShape.text);
        document.body.style.cursor = 'move';
    }

    mouseUp(row: number, column: number, appState: Readonly<AppState>): void {
        console.log("End moving text");
        this.currentShape.endEditing();
        this.persist(appState);
    }

    keyDown(key: string, appState: Readonly<AppState>): void {
    }

    mouseDown(row: number, column: number, x: number, y: number, appState: Readonly<AppState>): void {
    }

    persist(appState: Readonly<AppState>): void {
        const shape = new TextShape(
            this.currentShape.id(),
            this.currentText.row,
            this.currentText.column,
            this.currentShape.text);
        this.layerService.updateShape(shape);
        this.toolService.selectTextEditTool(shape);
    }

    render(): void {
        this.textDrawer.draw(this.currentText);
        this.vertexDrawer.draw(this.moveVertex);
    }

    mouseMove(row: number, column: number, x: number, y: number, appState: Readonly<AppState>): void {
    }
}
