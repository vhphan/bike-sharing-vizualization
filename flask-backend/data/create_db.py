import sqlite3
from sqlite3 import Error

import pandas as pd

from constants import DB_PATH


def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        print(sqlite3.version)
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()


def initialise_db():
    create_connection(DB_PATH)
    con = sqlite3.connect(DB_PATH)
    stations = pd.read_csv('austin_bikeshare_stations.csv')
    bikes = pd.read_csv('austin_bikeshare_trips.csv')
    day = pd.read_csv('day.csv')
    hour = pd.read_csv('hour.csv')
    stations.to_sql('stations', con, index=False)
    bikes.to_sql('bikes', con, index=False)
    day.to_sql('day', con, index=False)
    hour.to_sql('hour', con, index=False)


def create_other_tables():
    con = sqlite3.connect(DB_PATH)
    df = pd.read_sql('SELECT * FROM bikes', con)
    df['start_time'] = pd.to_datetime(df['start_time'])
    df['end_time'] = df['start_time'] + pd.to_timedelta(df['duration_minutes'], unit='minutes')
    df['start_hour'] = df['start_time'].dt.hour
    df['end_hour'] = df['end_time'].dt.hour
    df['start_day'] = df['start_time'].dt.weekday
    df['end_day'] = df['end_time'].dt.weekday
    df['week'] = df['start_time'].dt.isocalendar().week
    df['year'] = df['start_time'].dt.year
    df['year-week'] = df['start_time'].dt.strftime('%Y-w%V')
    cols = [
        'trip_id',
        'start_station_id',
        'end_station_id',
        'start_time',
        'start_hour',
        'start_day',
        'end_time',
        'end_hour',
        'end_day',
        'week',
        'year',
        'year-week',
    ]
    df[cols].to_sql('bikes_time', con, if_exists='replace', index=False)


if __name__ == '__main__':
    # initialise_db()
    create_other_tables()
