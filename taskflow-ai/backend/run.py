"""Development entry point for the TaskFlow AI backend.

Run from the backend folder:

    python run.py
"""

from app.main import app

if __name__ == "__main__":
    # debug=True gives useful error pages during the academic demo.
    app.run(host="127.0.0.1", port=5000, debug=True)
