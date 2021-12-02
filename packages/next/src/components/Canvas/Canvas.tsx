/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Brush, Container, HTMLLayer, Indicator, Shape } from '~components'
import {
  useCanvasEvents,
  useContext,
  useGestureEvents,
  useResizeObserver,
  useStylesheet,
} from '~hooks'
import type { TLNuShape } from '~nu-lib'
import type { TLNuBinding, TLNuRendererProps } from '~types'
import { EMPTY_ARRAY, EMPTY_OBJECT } from '~constants'
import { autorun } from 'mobx'
import { ContextBarWrapper } from '~components/ContextBarWrapper'
import { usePreventNavigation } from '~hooks/usePreventNavigation'

export const Canvas = observer(function Renderer<
  S extends TLNuShape = TLNuShape,
  B extends TLNuBinding = TLNuBinding
>({
  bindings = EMPTY_ARRAY,
  bindingShape,
  brush,
  children,
  editingShape,
  hoveredShape,
  id,
  selectedBounds,
  selectedShapes = EMPTY_ARRAY,
  shapes = EMPTY_ARRAY,
  showBounds = true,
  showResizeHandles = true,
  showRotateHandle = true,
  theme = EMPTY_OBJECT,
}: TLNuRendererProps<S, B>): JSX.Element {
  const rContainer = React.useRef<HTMLDivElement>(null)
  useStylesheet(theme, id)
  usePreventNavigation(rContainer)

  const { viewport, components, meta } = useContext()

  useResizeObserver(rContainer, viewport)
  useGestureEvents(rContainer)

  // If we zoomed, set the CSS variable for the zoom
  React.useLayoutEffect(() => {
    return autorun(() => {
      const { zoom } = viewport.camera
      const container = rContainer.current
      if (!container) return
      container.style.setProperty('--nu-zoom', zoom.toString())
    })
  }, [])

  const events = useCanvasEvents()

  const { zoom } = viewport.camera

  return (
    <div ref={rContainer} className="nu-container">
      <div tabIndex={-1} className="nu-absolute nu-canvas" {...events}>
        <HTMLLayer>
          {selectedBounds && showBounds && (
            <Container bounds={selectedBounds} zIndex={2}>
              <components.BoundsBackground
                zoom={zoom}
                shapes={selectedShapes}
                bounds={selectedBounds}
                showResizeHandles={showResizeHandles}
                showRotateHandle={showRotateHandle}
              />
            </Container>
          )}
          {shapes.map((shape, i) => (
            <Shape
              key={'shape_' + shape.id}
              shape={shape}
              isEditing={editingShape === shape}
              isHovered={hoveredShape === shape}
              isBinding={bindingShape === shape}
              isSelected={selectedShapes.includes(shape)}
              meta={meta}
              zIndex={100 + i}
            />
          ))}
          {selectedShapes.map((shape) => (
            <Indicator
              key={'selected_indicator_' + shape.id}
              shape={shape}
              isEditing={false}
              isHovered={false}
              isBinding={false}
              isSelected={true}
            />
          ))}
          {hoveredShape && (
            <Indicator key={'hovered_indicator_' + hoveredShape.id} shape={hoveredShape} />
          )}
          {brush && <Brush brush={brush} />}
          {selectedBounds && showBounds && (
            <Container bounds={selectedBounds} zIndex={10002}>
              <components.BoundsForeground
                zoom={zoom}
                shapes={selectedShapes}
                bounds={selectedBounds}
                showResizeHandles={showResizeHandles}
                showRotateHandle={showRotateHandle}
              />
            </Container>
          )}
          {selectedBounds && components.ContextBar && (
            <ContextBarWrapper bounds={selectedBounds} shapes={selectedShapes} />
          )}
        </HTMLLayer>
        {children}
      </div>
    </div>
  )
})
