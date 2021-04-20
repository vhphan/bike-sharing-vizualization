import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import 'leaflet.control.layers.tree';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet-search';
import 'leaflet-search/dist/leaflet-search.min.css';
import 'leaflet-ajax';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
// import store from '../store';

let colormap = require('colormap')

function loadScript(url, callback) {

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState) {  //IE
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" ||
                script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

export default {

    addControlPlaceholders(map) {
        var corners = map._controlCorners,
            l = 'leaflet-',
            container = map._controlContainer;

        function createCorner(vSide, hSide) {
            var className = l + vSide + ' ' + l + hSide;
            corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }

        createCorner('verticalcenter', 'left');
        createCorner('verticalcenter', 'right');
        return map;
    },
    setUpBasemaps: function () {
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
        });
        const cartodb_light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 18
        });
        const cartodb_dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
            maxZoom: 18
        });
        const openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        const Stamen_TonerBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        });
        const Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'jpg'
        });


        return {
            'Positron (CartoDB)': cartodb_light,
            'Dark Matter (CartoDB)': cartodb_dark,
            'OSM Default': osm,
            'Open Topo': openTopo,
            'Stamen Watercolor': Stamen_Watercolor,
            'Stamen Toner': Stamen_TonerBackground,
        };
    },
    popUp: function (feature, layer) {
        if (feature.properties) {

            let data = feature.properties;
            let output = [];
            for (let k in data) {
                output.push(`<tr><td style="border: solid 1px gray">${k}</td><td style="border: solid 1px gray">${data[k]}</td></tr>`);
            }
            let finalTable = '<table style="border: solid 1px gray">' + output.join('') + '</table>';
            layer.bindPopup(finalTable,
                {
                    maxHeight: '200',
                    maxWidth: '500'
                });
            layer.on('popupopen', function () {
            })
            layer.on('popupclose', function () {
            })

        }
        // layer.on('click', function (e) {
        //     store.dispatch('setPopupContent', e).then(() => {
        //     });
        //
        //
        // });
    },
    addRulerToMap: function (map) {
        const ruler = L.control.ruler();
        ruler.addTo(map);
        ruler.setPosition('bottomright');
    },
    changeLayerColor(layer, color) {
        layer.eachLayer(function (l) {
            l.setStyle({
                color: color,
                fillOpacity: 0.2
            });
        });
    },
    setupLeafletMap: function (mapObj, tileName = 'Dark Matter (CartoDB)', center, addRuler = true, zoom = 14) {
        const me = this;
        console.log(center);
        console.log(mapObj);
        let baseMaps = this.setUpBasemaps();
        mapObj.map = L.map(mapObj.id, {
            layers: baseMaps[tileName],
            center: center,
            zoom: zoom
        });


        mapObj.map = this.addControlPlaceholders(mapObj.map);
        mapObj.map.attributionControl.setPrefix('');
        let baseTreeChildren = [];
        Object.keys(baseMaps).forEach(function (key) {
            baseTreeChildren.push({label: key, layer: baseMaps[key]});
        });

        let baseTree = {
            label: 'BaseLayers',
            noShow: true,
            children: [{
                label: 'Base Maps',
                children: baseTreeChildren
            }],
        };

        mapObj.ctlTree = L.control.layers.tree(baseTree, null,
            {
                namedToggle: false,
                collapsed: true,
                position: 'bottomright',
            });

        if (addRuler) {
            if (!L.control.ruler) {
                loadScript("https://cdn.rawgit.com/gokertanrisever/leaflet-ruler/master/src/leaflet-ruler.js", function () {
                    me.addRulerToMap(mapObj.map)
                })
            } else {
                me.addRulerToMap(mapObj.map);
            }
        }

        mapObj.ctlTree.addTo(mapObj.map).collapseTree();
        mapObj.lControl = L.control.layers(baseMaps);
        mapObj.map.zoomControl.setPosition('bottomright');

    },
    colorCell(layer, color = '#43ef04', timeout = 8000) {
        const context = this;
        try {
            if (layer.feature !== undefined) {
                if (layer.feature.properties['Cell Name']) {
                    let origStyle = layer.options.style;
                    layer._origStyle = origStyle;
                    layer.setStyle({fillColor: color, fillOpacity: 0.9});
                    setTimeout(function () {
                        // layer.setStyle({ color: '#000', weight: 1 });
                        layer.setStyle(origStyle);
                    }, timeout);
                } else if (layer._origStyle !== undefined) {
                    layer.setStyle(layer._origStyle);
                }
            }
        } catch (err) {
            console.log(err.message);
            context.showError(err);
        }

    },
    getColor(value) {
        const d = value / 1000
        let colors = colormap({
            colormap: 'RdBu',
            nshades: 8,
            format: 'hex',
            alpha: 1
        });
        colors.reverse();
        return d > 70 ? colors[7] :
            d > 60 ? colors[6] :
                d > 50 ? colors[5] :
                    d > 40 ? colors[4] :
                        d > 30 ? colors[3] :
                            d > 20 ? colors[2] :
                                d > 10 ? colors[1] :
                                    colors[0];
    },
    removeChloropleth: function (mapObj) {
        if (mapObj.map.hasLayer(mapObj.chloropleth)) {
            mapObj.map.removeLayer(mapObj.chloropleth);
            mapObj.chloropleth = null;
        }
    },
    removePointsLayer: function (mapObj) {
        if (mapObj.map.hasLayer(mapObj.pointsLayer)) {
            mapObj.map.removeLayer(mapObj.pointsLayer);
            mapObj.pointsLayer = null;
        }
    },
    drawChloropleth(context, mapObj, chloroData, colorFunction, colorProperty, popUpFunc = null) {
        function style(feature) {
            return {
                fillColor: colorFunction(feature.properties[colorProperty]),
                weight: 0.5,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.5
            };
        }

        function mouseClickedHighlightFeature(e) {
            resetHighlight(e);
            let layer = e.target;
            layer.setStyle({
                weight: 5,
                color: '#f10808',
                dashArray: '',
            });

        }

        function resetHighlight() {
            mapObj.chloropleth.resetStyle();
        }

        const popUp = this.popUp;

        function onEachFeature(feature, layer) {
            layer.on({
                // mouseover: mouseOverHighlightFeature,
                // mouseout: resetHighlight,
                click: mouseClickedHighlightFeature
            });
            popUp(feature, layer, context);
            popUpFunc(feature, layer, context);
        }

        mapObj.chloropleth = L.geoJson(chloroData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(mapObj.map).bringToBack();

    },
    mapValueToPointSize(value, minValue, maxValue, minRadius, maxRadius) {
        if (value < minValue) return minRadius;
        return (minRadius) + (maxRadius - minRadius) * ((value - minValue) / (maxValue - minValue))
    },

    drawPointsLayer: function (context, mapObj, pointsData, colorFunction, colorProperty, layerClickedFunction = null, radiusSettings = {}, tooltipField = 'count',) {
        this.removePointsLayer(mapObj);
        const mapValueToPointSize = this.mapValueToPointSize;

        function style(feature) {
            let property = feature.properties[colorProperty];
            let radiusFunc = () => 5;
            if (Object.keys(radiusSettings).length) {
                const {minValue, maxValue, minRadius, maxRadius} = radiusSettings;
                radiusFunc = function (x) {
                    return mapValueToPointSize(x, minValue, maxValue, minRadius, maxRadius)
                }
            }
            return {

                fillColor: colorFunction(property),
                weight: 1,
                opacity: 1,
                color: '#504a4a',
                fillOpacity: 0.8,
                radius: radiusFunc(property),

            };
        }

        function resetHighlight() {
            mapObj.pointsLayer.resetStyle();
        }

        function mouseClickedHighlightFeature(e) {
            resetHighlight(e);
            let layer = e.target;
            layer.setStyle({
                weight: 5,
                color: '#081ff1',
                dashArray: '',
            });
        }

        const popUp = this.popUp;

        function onEachFeatureP(feature, layer) {
            popUp(feature, layer, context);
            layer.on('click', function (e) {
                if (layerClickedFunction) layerClickedFunction(e.target.feature.properties);
                mouseClickedHighlightFeature(e);
            })

        }

        console.log(pointsData);
        mapObj.pointsLayer = L.geoJson(pointsData, {
            onEachFeature: onEachFeatureP,
            pointToLayer: function (feature, latlng) {
                const property = feature.properties[tooltipField];
                let circleMarker = L.circleMarker(latlng, style(feature));
                circleMarker.bindTooltip(function () {
                    return `<div><b>${tooltipField} : ${property}</b></div>`;
                }, {
                    permanent: false,
                    opacity: 0.8,

                });
                return circleMarker;

            }
        }).addTo(mapObj.map).bringToFront();

    },
    removeLegend(mapObj) {
        if (mapObj.legend) {
            mapObj.map.removeControl(mapObj.legend);
            mapObj.legend = null;
        }
    },
    addColorGradientLegend(mapObj, colorFunc, minValue, maxValue, legendTitle = '') {

        this.removeLegend(mapObj);

        const legend = L.control({position: 'bottomleft'});

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info-pane legend");
            const firstColor = colorFunc(minValue);
            const lastColor = colorFunc(maxValue);

            div.innerHTML += `<h4>Legend: ${legendTitle}</h4>`;

            div.innerHTML += `<span style="float: left">${minValue}</span><i style="background-color:${firstColor};"></i>`;
            for (let i = 2; i <= 99; i++) {
                let color = colorFunc(minValue + (i / 100) * (maxValue - minValue))
                div.innerHTML += `<i style="background-color:${color};"></i>`;
            }

            div.innerHTML += `<i style="background-color:${lastColor};"></i><span style="margin-left: 10px">${maxValue}</span>`;

            return div;
        };

        legend.addTo(mapObj.map);
        mapObj.legend = legend;

    }

}
;