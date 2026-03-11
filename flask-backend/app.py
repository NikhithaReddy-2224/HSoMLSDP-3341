from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import User, LoginHistory, PredictionHistory
import joblib
import numpy as np
import os
from lime.lime_tabular import LimeTabularExplainer
from datetime import datetime

app = Flask(__name__)
CORS(app)

# =============================
# DATABASE CONFIG
# =============================
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:2224@localhost:5432/hsomlsdp_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# =============================
# MODEL CONFIG
# =============================
MODEL_PATH = "models/stacking_model.pkl"

model = None
explainer = None


def load_model():
    global model, explainer

    print("Checking model path:", MODEL_PATH)
    print("File exists:", os.path.exists(MODEL_PATH))

    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)

        if hasattr(model, "feature_names_in_"):
            training_data = np.random.rand(100, len(model.feature_names_in_))
            explainer = LimeTabularExplainer(
                training_data,
                feature_names=model.feature_names_in_,
                class_names=['Non-Defective', 'Defective'],
                mode='classification'
            )

        print("Model loaded successfully")
    else:
        print("Model not found")

# =============================
# SIGNUP
# =============================
@app.route("/signup", methods=["POST"])
def signup():

    try:

        data = request.json
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")

        if User.query.filter_by(email=email).first():

            return jsonify({
                "message": "User already exists"
            }), 400

        new_user = User(
            name=name,
            email=email,
            password=password
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user_id": new_user.id
        }), 201

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =============================
# LOGIN
# =============================
@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.json
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()

        if not user:

            user = User(
                name="Demo User",
                email=email,
                password=password
            )

            db.session.add(user)
            db.session.commit()

        login_entry = LoginHistory(
            user_id=user.id,
            email=user.email,
            login_time=datetime.utcnow()
        )

        db.session.add(login_entry)
        db.session.commit()

        return jsonify({
            "message": "Login successful",
            "user_id": user.id
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =============================
# HEALTH CHECK
# =============================
@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })


# =============================
# PREDICT (FIXED FOR MANUAL INPUT)
# =============================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        user_id = data.get("user_id")
        features = data.get("features", {})
        module_id = data.get("moduleId", "unknown")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Use model feature order
        required_features = [
    "loc","vg","evg",
    "lOCode","lOComment","lOBlank","locCodeAndComment",
    "uniqOp","uniqOpnd","totalOp","totalOpnd","branchCount"
]
        feature_values = []
        for f in required_features:
            val = features.get(f, 0)
            try:
                val = float(val)
            except:
                val = 0
            feature_values.append(val)

        X = np.array([feature_values])

        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]

        label = "Defective" if int(prediction) == 1 else "Non-Defective"

        # ---- SAVE PREDICTION HISTORY ----
        history = PredictionHistory(
            user_id=user.id,
            module_name=module_id,
            result=label,
            created_at=datetime.utcnow()
        )

        db.session.add(history)
        db.session.commit()

        print("Prediction history saved for user:", user.id)

        return jsonify({
            "moduleId": module_id,
            "label": label,
            "probability": float(probability[1])
        })

    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({"error": str(e)}), 500

# =============================
# LOGIN HISTORY
# =============================
@app.route("/login-history/<int:user_id>", methods=["GET"])
def get_login_history(user_id):

    history = LoginHistory.query\
        .filter(LoginHistory.user_id == user_id)\
        .order_by(LoginHistory.login_time.desc())\
        .all()

    result = [
        {
            "id": item.id,
            "email": item.email,
            "login_time": item.login_time
        }
        for item in history
    ]

    return jsonify(result)


# =============================
# PREDICTION HISTORY
# =============================
@app.route("/prediction-history/<int:user_id>", methods=["GET"])
def get_prediction_history(user_id):

    history = PredictionHistory.query\
        .filter(PredictionHistory.user_id == user_id)\
        .order_by(PredictionHistory.created_at.desc())\
        .all()

    result = [
        {
            "id": item.id,
            "module_name": item.module_name,
            "result": item.result,
            "created_at": item.created_at
        }
        for item in history
    ]

    return jsonify(result)


# =============================
# RUN SERVER
# =============================
if __name__ == "__main__":

    load_model()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )