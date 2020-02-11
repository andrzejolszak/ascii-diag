import React, {RefObject} from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import {createStyles, Theme, Toolbar, withStyles, WithStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import UIGrid from "@material-ui/core/Grid";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DiagCanvas from "./diag-canvas";
import CursorDefault from "mdi-material-ui/CursorDefault";
import {
    ArrowLeft,
    ArrowRight,
    CheckboxBlankOutline,
    CurrentDc,
    DotsHorizontal,
    FormatText,
    Minus,
    RayStartArrow
} from "mdi-material-ui";
import SvgCanvas from "./svg-diag";
import {LayerService} from "../layer-service";
import Grid from "../drawers/grid";
import {DiagToSvg} from "../renderers/diag-to-svg";
import {Tools} from "../tools/tool";
import Constants from "../constants";
import {ShapeUpdateNotificationService} from "../shape-update-notification-service";
import {CellToShapeService} from "../cell-to-shape-service";
import {ConnectorTipDirectionService} from "../connector-tip-direction-service";
import IconMenu from "./icon-menu";
import {ConnectorTipStyle, LineStyle} from "../drawers/connector";
import {AppState} from "./app-state";
import {StateProvider} from "./state-provider";
import {ShapeIdService} from "../shapes/shape-id-service";
import {CanvasCellDrawer} from "../drawers/cell-drawer";
import {CanvasVertexDrawer} from "../drawers/vertex-drawer";
import {CanvasSelectBoxDrawer} from "../drawers/select-box-drawer";
import {CanvasBoxDrawer} from "../drawers/box-drawer";
import {CanvasConnectorDrawer} from "../drawers/connector-drawer";
import {CanvasTextDrawer} from "../drawers/text-drawer";
import {CanvasCursorDrawer} from "../drawers/cursor-drawer";
import {GridDrawerFactory} from "../drawers/drawer-factory";
import {ToolService} from "../tools/tool-service";
import AsciiDiag from "../ascii-diag";
import DiagToSvgProvider from "./diag-to-svg-provider";

const appStyles = (theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
        margin: 10,
        minWidth: '600px',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    paperStyles: {
        marginTop: theme.spacing(1),
        maxWidth: 900
    }
});

const margin = {
    margin: '10px',
    display: 'inline-block'
};

const padding = {
    paddingTop: '20px',
    paddingBottom: '50px',
    paddingLeft: '20px',
    paddingRight: '20px',
};

interface AppProps extends WithStyles<typeof appStyles> {

}

const AppWithStyles = withStyles(appStyles)(
    class extends React.Component<AppProps, AppState> {

        private readonly canvasDivRef: RefObject<HTMLCanvasElement> = React.createRef();
        private readonly svgDivRef: RefObject<HTMLDivElement> = React.createRef();
        private readonly grid: Grid;
        private readonly layerService: LayerService;
        private readonly shapeUpdateNotificationService: ShapeUpdateNotificationService;
        private readonly cellToShapeService: CellToShapeService;
        private readonly arrowTipDirectionService: ConnectorTipDirectionService;
        private readonly stateProvider: StateProvider;
        private readonly toolService: ToolService;
        private readonly cellDrawer: CanvasCellDrawer;
        private readonly gridDrawerFactory: GridDrawerFactory;
        private readonly diagToSvgProvider: DiagToSvgProvider;

        constructor(props: AppProps) {
            super(props);
            this.state = new AppState(Tools.connector,
                LineStyle.Continuous, ConnectorTipStyle.Flat,
                ConnectorTipStyle.Flat);

            this.grid = Grid.create(Constants.numberOfRows, Constants.numberOfColumns);
            this.shapeUpdateNotificationService = new ShapeUpdateNotificationService();
            this.layerService = new LayerService(this.shapeUpdateNotificationService);
            this.arrowTipDirectionService = new ConnectorTipDirectionService();
            this.cellToShapeService = new CellToShapeService(Constants.numberOfRows, Constants.numberOfColumns,
                this.arrowTipDirectionService, this.layerService);
            this.shapeUpdateNotificationService.register(this.cellToShapeService);
            this.stateProvider = new StateProvider(this);

            const entityIdService = new ShapeIdService();

            const arrowTipDirectionService = new ConnectorTipDirectionService();
            this.cellDrawer = new CanvasCellDrawer(this.canvasDivRef);
            const vertexDrawer = new CanvasVertexDrawer(this.canvasDivRef);
            const selectBoxDrawer = new CanvasSelectBoxDrawer(this.canvasDivRef, vertexDrawer);
            const boxDrawer = new CanvasBoxDrawer(this.cellDrawer);
            const arrowDrawer = new CanvasConnectorDrawer(this.cellDrawer, arrowTipDirectionService);
            const textDrawer = new CanvasTextDrawer(this.cellDrawer);
            const cursorDrawer = new CanvasCursorDrawer(this.canvasDivRef);
            this.gridDrawerFactory = new GridDrawerFactory(arrowTipDirectionService);

            this.toolService = new ToolService(
                this.layerService,
                selectBoxDrawer,
                boxDrawer,
                entityIdService,
                textDrawer,
                cursorDrawer,
                vertexDrawer,
                arrowDrawer,
                this.cellToShapeService);

            const diagToSvg = new DiagToSvg(this.svgDivRef, this.layerService, this.arrowTipDirectionService);
            this.diagToSvgProvider = new DiagToSvgProvider(diagToSvg);
        }

        componentDidMount(): void {
            new AsciiDiag(this.canvasDivRef, this.layerService, this.gridDrawerFactory,
                this.diagToSvgProvider, this.cellDrawer, this.toolService, this.stateProvider);
        }

        shouldShowConnectorOptions(): boolean {
            return this.state.currentTool === Tools.connector;
        }

        private handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: Tools) => {
            console.log("handle tool change: " + newTool);
            this.toolService.setCurrentTool(newTool);
            this.setState({
                currentTool: newTool,
                connectorLineStyle: this.state.connectorLineStyle,
                connectorStartTipStyle: this.state.connectorStartTipStyle,
                connectorEndTipStyle: this.state.connectorEndTipStyle,
            });
        };

        private handleConnectorLineStyleChange = (event: React.MouseEvent<HTMLElement>, newLineStyle: LineStyle) => {
            console.log("handle connector line style change: " + newLineStyle);
            this.setState(
                {
                    currentTool: this.state.currentTool,
                    connectorLineStyle: newLineStyle,
                    connectorStartTipStyle: this.state.connectorStartTipStyle,
                    connectorEndTipStyle: this.state.connectorEndTipStyle,
                });
        };

        private handleConnectorStartTipStyleChange = (event: React.MouseEvent<HTMLElement>, newConnectorTipStyle: ConnectorTipStyle) => {
            console.log("handle connector start tip type change: " + newConnectorTipStyle);
            this.setState({
                currentTool: this.state.currentTool,
                connectorLineStyle: this.state.connectorLineStyle,
                connectorStartTipStyle: newConnectorTipStyle,
                connectorEndTipStyle: this.state.connectorEndTipStyle,
            });
        };

        private handleConnectorEndTipStyleChange = (event: React.MouseEvent<HTMLElement>, newConnectorTipStyle: ConnectorTipStyle) => {
            console.log("handle connector end tip type change: " + newConnectorTipStyle);
            this.setState({
                currentTool: this.state.currentTool,
                connectorLineStyle: this.state.connectorLineStyle,
                connectorStartTipStyle: this.state.connectorStartTipStyle,
                connectorEndTipStyle: newConnectorTipStyle,
            });
        };

        render() {
            const diagToSvg = new DiagToSvg(this.svgDivRef, this.layerService, this.arrowTipDirectionService);

            return (
                <div className={this.props.classes.root}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6">
                                ASCII Diag
                            </Typography>
                            <Button color="inherit">Login</Button>
                        </Toolbar>
                    </AppBar>
                    <Paper>
                        <ToggleButtonGroup size="large"
                                           value={this.state.currentTool}
                                           exclusive
                                           onChange={this.handleToolChange}
                                           style={margin}>
                            <ToggleButton value={Tools.select} style={padding}>
                                <CursorDefault/>
                            </ToggleButton>
                            <ToggleButton value={Tools.text} style={padding}>
                                <FormatText/>
                            </ToggleButton>
                            <ToggleButton value={Tools.box} style={padding}>
                                <CheckboxBlankOutline/>
                            </ToggleButton>
                            <ToggleButton value={Tools.connector} style={padding}>
                                <RayStartArrow/>
                            </ToggleButton>
                        </ToggleButtonGroup>
                        {this.shouldShowConnectorOptions() &&
                        <span>
                            <IconMenu title="Start"
                                      selectedIndex={this.state.connectorStartTipStyle}
                                      onChange={this.handleConnectorStartTipStyleChange}
                                      options={["Flat", "Arrow"]}
                                      icons={[<Minus/>, <ArrowLeft/>]}/>

                            <IconMenu title="Line Style"
                                      selectedIndex={this.state.connectorLineStyle}
                                      onChange={this.handleConnectorLineStyleChange}
                                      options={["continuous", "dashed", "dotted"]}
                                      icons={[<Minus/>, <CurrentDc/>, <DotsHorizontal/>]}/>

                            <IconMenu title="End"
                                      selectedIndex={this.state.connectorEndTipStyle}
                                      onChange={this.handleConnectorEndTipStyleChange}
                                      options={["Flat", "Arrow"]}
                                      icons={[<Minus/>, <ArrowRight/>]}/>
                        </span>
                        }
                    </Paper>
                    <UIGrid container>
                        <UIGrid item sm={12} md={6}>
                            <Paper className={this.props.classes.paperStyles} style={{overflow: 'auto'}}>
                                <DiagCanvas canvasRef={this.canvasDivRef}/>
                            </Paper>
                        </UIGrid>
                        <UIGrid item sm={12} md={6}>
                            <Paper className={this.props.classes.paperStyles}>
                                <SvgCanvas divRef={this.svgDivRef}/>
                            </Paper>
                        </UIGrid>
                    </UIGrid>
                </div>
            );
        }
    }
);

window.addEventListener('keydown', function (e) {
    if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
    }
});

ReactDOM.render(<AppWithStyles/>, document.querySelector('#app'));
