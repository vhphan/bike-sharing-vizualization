import json
import sqlite3
from pprint import pprint

import pandas as pd
import geopandas as gpd
from loguru import logger

from constants import APP_FOLDER


def exception_handler(func):
    def inner_function(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.exception(e)

    return inner_function


class BikesDb:

    def __init__(self):
        self._conn = sqlite3.connect(f"{APP_FOLDER}/data/bikes.db")
        self._cursor = self._conn.cursor()
        # This attaches the tracer
        self._conn.set_trace_callback(print)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.commit()
        self.connection.close()

    def __str__(self):
        return self._conn

    @property
    def connection(self):
        return self._conn

    @property
    def cursor(self):
        return self._cursor

    def commit(self):
        self.connection.commit()

    def execute(self, sql_query, params=None):
        return self.cursor.execute(sql_query, params or ())

    @property
    def row_count(self):
        return self.cursor.rowcount

    def fetchall(self):
        fetchall = self.cursor.fetchall()
        print(fetchall)
        return fetchall

    def fetchone(self):
        return self.cursor.fetchone()

    def query(self, sql_query, params=None, return_dict=True):
        if self._conn is None:
            self.__init__()

        ex_result = self.cursor.execute(sql_query, params or ())
        if sql_query.lower().split()[0] in ['replace', 'update', 'insert', 'delete']:
            self.commit()
            return dict(result=ex_result)

        if return_dict:
            columns = [col[0] for col in self.cursor.description]
            return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

        return self.fetchall()

    def query_df(self, sql_query, params):
        return pd.DataFrame.from_dict(self.query(sql_query, params))


class DataController:

    def __init__(self):
        self.db = BikesDb()

    @exception_handler
    def count_per_station(self, start, end):
        sql = """
        SELECT
        b.start_station_id,
        b.start_station_name,
        s.longitude, s.latitude,
        count(*) as count
            FROM bikes as b
            INNER JOIN stations as s on b.start_station_id = s.station_id
            WHERE
                  start_time >= date(?) AND
                  start_time <= date(?)
            GROUP BY start_station_id, start_station_name, longitude, latitude
ORDER BY count DESC
            ;
        """
        df = self.db.query_df(sql, (start, end))
        gdf = gpd.GeoDataFrame(df,
                               geometry=gpd.points_from_xy(x=df['longitude'],
                                                           y=df['latitude'],
                                                           crs='EPSG:4326'))
        return gdf.to_json()

    def available_dates(self):
        sql = """
            SELECT *
                FROM (SELECT date(start_time) as day FROM bikes)
                GROUP BY day
                ORDER BY day;
        """
        return json.dumps(self.db.query(sql))

    def count_by_day_hour(self, start, end, station_id):

        if station_id != 'All':
            sql = """
                    SELECT date(start_time) as day,
                               start_day,
                               start_hour,
                               year_week,
                               count(*)         as count
                        FROM bikes_time
                        WHERE start_time >= date(?)
                          AND start_time <= date(?)
                          AND start_station_id = ?
                        GROUP BY date(start_time), start_day, start_hour, year_week
                        ORDER BY start_time
                    """
            return self.db.query(sql, (start, end, station_id))

        sql = """
        SELECT date(start_time) as day,
                   start_day,
                   start_hour,
                   year_week,
                   count(*)         as count
            FROM bikes_time
            WHERE start_time >= date(?)
              AND start_time <= date(?)
            GROUP BY date(start_time), start_day, start_hour, year_week
            ORDER BY start_time
        """
        return self.db.query(sql, (start, end))


if __name__ == '__main__':
    c = DataController()
    pprint(c.count_by_day_hour('2016-01-01', '2016-01-31'))
