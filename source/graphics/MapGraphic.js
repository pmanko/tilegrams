import {geoPath} from 'd3-geo'
import inside from 'point-in-polygon';
import area from 'area-polygon'
import topogramImport from 'topogram'

import Graphic from './Graphic'
import geographyResource from '../resources/GeographyResource'
import exporter from '../file/Exporter'
import {fipsColor, updateBounds, checkWithinBounds} from '../utils'
import {canvasDimensions} from '../constants'

const topogram = topogramImport()

const MIN_PATH_AREA = 0.5
const MAX_ITERATION_COUNT = 20

export default class MapGraphic extends Graphic {
  constructor() {
    super()
    this._stateFeatures = null
    this._iterationCount = 0
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this.getFeatureAtPoint = this.getFeatureAtPoint.bind(this)
    topogram.iterations(1)
  }

  /** Apply topogram on topoJson using data in properties */
  computeCartogram(dataset) {
    topogram.value(feature => dataset.data.find(datum => datum[0] === feature.id)[1])
    this._iterationCount = 0

    // compute initial cartogram from geography
    this.updatePreProjection(dataset.geography)

    // generate basemap for topogram
    this._baseMap = this._getbaseMapTopoJson(dataset)
    this._stateFeatures = topogram(
      this._baseMap.topo,
      this._baseMap.geometries
    )
    this._precomputeBounds()
  }

  /**
   * Returns either the original map topojson and geometries or
   * a filtered version of the map if the data properties don't match the map.
   */
  _getbaseMapTopoJson(dataset) {
    const mapResource = geographyResource.getMapResource(dataset.geography)
    const baseMapTopoJson = mapResource.getTopoJson()
    let filteredTopoJson = null
    let filteredGeometries = null
    const baseMapLength = baseMapTopoJson.objects[mapResource.getObjectId()].geometries.length
    // for custom uploads with incomplete data
    if (dataset.data.length !== baseMapLength) {
      console.log('FILTERED!')
      const statesWithData = dataset.data.map(datum => datum[0])
      filteredGeometries = baseMapTopoJson.objects[mapResource.getObjectId()].geometries
        .filter(geom => statesWithData.indexOf(geom.id) > -1)
      filteredTopoJson = JSON.parse(JSON.stringify(baseMapTopoJson)) // clones the baseMap
      // only pass filtered geometries to topogram generator
      filteredTopoJson.objects[mapResource.getObjectId()].geometries = filteredGeometries
    }
    return {
      topo: filteredTopoJson || baseMapTopoJson,
      geometries: filteredGeometries || mapResource.getGeometries(),
    }
  }

  /**
   * Calculate subsequent cartogram iterations.
   * Return true if iteration was performed, false if not.
   */
  iterateCartogram(geography) {
    if (this._iterationCount > MAX_ITERATION_COUNT) {
      return false
    }
    const mapResource = geographyResource.getMapResource(geography)
    topogram.projection(x => x)
    const topoJson = exporter.fromGeoJSON(this._stateFeatures, mapResource.getObjectId())
    this._stateFeatures = topogram(topoJson, topoJson.objects[mapResource.getObjectId()].geometries)
    this._precomputeBounds()
    this._iterationCount++
    return true
  }

  resetBounds() {
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
  }

  /** Apply projection _before_ cartogram computation */
  updatePreProjection(geography) {
    const projection = geographyResource.getProjection(geography, canvasDimensions)
    topogram.projection(projection)
  }

  /** Pre-compute projected bounding boxes; filter out small-area paths */
  _precomputeBounds() {
    const pathProjection = geoPath()
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this._projectedStates = this._stateFeatures.features.map(feature => {
      const hasMultiplePaths = feature.geometry.type === 'MultiPolygon'
      const bounds = pathProjection.bounds(feature)
      updateBounds(this._generalBounds, bounds)
      const paths = feature.geometry.coordinates
        .filter(path => area(hasMultiplePaths ? path[0] : path) > MIN_PATH_AREA)
        .map(path => [hasMultiplePaths ? path[0] : path])
      return {bounds, paths}
    })
    console.log(this._projectedStates)
  }

  render(ctx) {
    this._stateFeatures.features.forEach(feature => {
      console.log(feature)
      ctx.beginPath()
      const hasMultiplePaths = feature.geometry.coordinates.length > 1
      feature.geometry.coordinates.forEach(path => {
        const points = hasMultiplePaths ? path[0] : path
        ctx.moveTo(points[0][0], points[0][1])
        for (let index = 1; index < points.length; index++) {
          ctx.lineTo(points[index][0], points[index][1])
        }
      })
      ctx.closePath()
      ctx.fillStyle = fipsColor(feature.id)
      ctx.globalAlpha = 0.35
      ctx.fill()
      ctx.globalAlpha = 1.0
    })
  }

  /** Find feature that contains given point */
  getFeatureAtPoint(point) {
    const pointDimensions = [point.x, point.y]

    // check if point is within general bounds of TopoJSON
    if (!checkWithinBounds(pointDimensions, this._generalBounds)) {
      return null
    }

    // for each feature: check if point is within bounds, then within path
    return this._stateFeatures.features.find((feature, featureIndex) => {
      const bounds = this._projectedStates[featureIndex].bounds
      if (!checkWithinBounds(pointDimensions, bounds || this._generalBounds)) {
        return false
      }
      const matchingPath = this._projectedStates[featureIndex].paths.find(
        path => inside(pointDimensions, path[0])
      )
      return matchingPath != null
    })
  }

  computeCartogramArea() {
    const featureAreas = this._stateFeatures.features.map((feature) => {
      return geoPath().area(feature)
    })
    return featureAreas.reduce((a, b) => a + b)
  }
}
