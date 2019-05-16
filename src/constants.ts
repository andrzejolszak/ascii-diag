export default class Constants {
    static readonly canvasWidth = 800;
    static readonly canvasHeight = 600;
    static readonly densityX = 10;
    static readonly densityY = 20;

    static readonly numberOfRows = Constants.canvasHeight / Constants.densityY;
    static readonly numberOfColumns = Constants.canvasWidth / Constants.densityX;

    static readonly font = '11px Courier';
    static readonly accentColor = `rgb(255, 165, 0, 1.0)`;
}
