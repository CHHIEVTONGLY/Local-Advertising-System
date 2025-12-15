from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np

app = FastAPI()

# Allow frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load YOLOv8 model from Hugging Face
model = YOLO("https://huggingface.co/CHHIEVTONG/sexy-detection-v1/resolve/main/best.pt")

print(model.names)

@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    img_array = np.array(img)
    results = model(img_array, imgsz=640)[0]

    threshold = 0.1
    detections = []
    max_conf = 0
    is_sexy = False

    for box in results.boxes:
        conf = float(box.conf)
        cls = int(box.cls)
        xyxy = box.xyxy.tolist()

        detections.append({
            "class_id": cls,
            "class": "sexy" if cls == 1 else "normal",
            "confidence": conf,
            "box": xyxy,
        })

        if cls == 1 and conf >= threshold:
            is_sexy = True
            max_conf = max(max_conf, conf)

    return {
        "status": "ok",
        "is_sexy": is_sexy,
        "message": "Sexy content detected" if is_sexy else "No sexy content detected",
        "confidence": max_conf,
        "detections": detections
    }