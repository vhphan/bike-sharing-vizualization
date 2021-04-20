from flask import Flask
from data_api.views import data_api

app = Flask(__name__)
app.register_blueprint(data_api)


@app.route('/')
def hello():
    return "Hello World!"


if __name__ == '__main__':
    app.run()
