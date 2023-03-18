"""
This script runs the ChainReactionWebServer application using a development server.
"""

from distutils.log import debug
from os import environ
from ChainReactionWebServer import app

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost') #Get the server_host defined in environment. If there are none, get 'localhost' as default
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(host = HOST, port=5555, debug=True)
