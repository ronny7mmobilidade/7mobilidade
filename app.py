from flask import Flask, request

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "BOT 7MOBILIDADE ONLINE"

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.json
    print(data)
    return "ok", 200

if __name__ == "__main__":
    app.run()
