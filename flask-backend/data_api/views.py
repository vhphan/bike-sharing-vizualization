from flask import Blueprint, jsonify
from flask_cors import cross_origin, CORS

from .controller import DataController

data_api = Blueprint('data_api', __name__, url_prefix='/bikes')

cors = CORS(data_api, resources={r"/api/*": {"origins": "*"}})


@data_api.route('/')
@cross_origin()
def index():
    return "This is an example app"


@data_api.route('/count-per-station/<start>/<end>')
@cross_origin()
def count_per_station(start, end):
    return DataController().count_per_station(start, end)


@data_api.route('/available-dates')
@cross_origin()
def available_dates():
    return DataController().available_dates()


@data_api.route('/count-day-hour/<start>/<end>/<station_id>')
@cross_origin()
def count_day_hour(start, end, station_id):
    return jsonify(DataController().count_by_day_hour(start, end, station_id))
