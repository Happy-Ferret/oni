import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Config from "./../../Config"
import { Icon } from "./../Icon"

import { WindowContext } from "./../Overlay/WindowContext"

require("./Error.less") // tslint:disable-line no-var-requires

export interface IErrorWithColor extends Oni.Plugin.Diagnostics.Error {
    color: string
}

export interface IErrorsProps {
    errors: IErrorWithColor[]
    windowContext: WindowContext
    showDetails: boolean
}

const padding = 8

export class Errors extends React.Component<IErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        const markers = errors.map((e) => {
            if (this.props.windowContext.isLineInView(e.lineNumber)) {
                const screenLine = this.props.windowContext.getWindowLine(e.lineNumber)

                const xPos = this.props.windowContext.getWindowPosition(e.lineNumber, e.startColumn).x
                const yPos = this.props.windowContext.getWindowRegionForLine(e.lineNumber).y - (padding / 2)
                const isActive = screenLine === this.props.windowContext.getCurrentWindowLine()

                const showTooltipTop = this.props.windowContext.dimensions.height - this.props.windowContext.getWindowLine(e.lineNumber) <= 2

                return <ErrorMarker isActive={isActive}
                    x={xPos}
                    y={yPos}
                    showTooltipTop={showTooltipTop}
                    text={e.text}
                    color={e.color}
                    showDetails={this.props.showDetails} />
            } else {
                return null
            }
        })

        const squiggles = errors.map((e) => {
            if (this.props.windowContext.isLineInView(e.lineNumber) && e.endColumn) {
                // const screenLine = this.props.windowContext.getWindowLine(e.lineNumber)

                const yPos = this.props.windowContext.getWindowRegionForLine(e.lineNumber).y

                const startX = this.props.windowContext.getWindowPosition(e.lineNumber, e.startColumn as any).x // FIXME: undefined
                const endX = this.props.windowContext.getWindowPosition(e.lineNumber, e.endColumn).x

                return <ErrorSquiggle
                    y={yPos}
                    height={this.props.windowContext.fontHeightInPixels}
                    x={startX}
                    width={endX - startX}
                    color={e.color} />
            } else {
                return null
            }
        })

        return <div>{markers}{squiggles}</div>
    }
}

export interface IErrorMarkerProps {
    x: number
    y: number
    showTooltipTop: boolean
    text: string
    isActive: boolean
    color: string
    showDetails: boolean
}

export class ErrorMarker extends React.Component<IErrorMarkerProps, void> {

    private config = Config.instance()

    public render(): JSX.Element {

        const iconPositionStyles = {
            top: this.props.y.toString() + "px",
        }
        const textPositionStyles = {
            left: this.props.x.toString() + "px",
            // Tooltip below line: use top so text grows downward when text gets longer
            // Tooltip above line: use bottom so text grows upward
            top: this.props.showTooltipTop ? "initial" : this.props.y.toString() + "px",
            bottom: this.props.showTooltipTop ? "calc(100% - " + this.props.y.toString() + "px" : "initial",
            borderColor: this.props.color,
        }

        const className = [
            "error",
            this.props.isActive ? "active" : "",
            this.props.showTooltipTop ? "top" : "",
        ].join(" ")

        // TODO change editor.errors.slideOnFocus name
        const errorDescription = this.config.getValue("editor.errors.slideOnFocus") ? (
            <div className={className} style={textPositionStyles}>
                <div className="text">
                    {this.props.text}
                </div>
            </div>) : null
        const errorIcon = <div style={iconPositionStyles} className="error-marker">
            <div className="icon-container" style={{ color: this.props.color }}>
                <Icon name="exclamation-circle" />
            </div>
        </div>

        return <div>
            {this.props.showDetails ? errorDescription : null}
            {errorIcon}
        </div>
    }
}

export interface IErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number,
    color: string,
}

export class ErrorSquiggle extends React.Component<IErrorSquiggleProps, void> {
    public render(): JSX.Element {

        const { x, y, width, height, color } = this.props

        const style = {
            top: y.toString() + "px",
            left: x.toString() + "px",
            height: height.toString() + "px",
            width: width.toString() + "px",
            borderBottom: `1px dashed ${color}`,
        }

        return <div className="error-squiggle" style={style}></div>
    }
}

export function renderErrorMarkers(props: IErrorsProps, element: HTMLElement) {
    ReactDOM.render(<Errors {...props} />, element)
}
