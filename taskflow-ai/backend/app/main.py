"""Application entry point.

From the ``backend`` folder run:

    python run.py

or:

    python -m app.main
"""

from . import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
