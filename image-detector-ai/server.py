from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# Allow Next.js frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production, restrict this
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load model from Hugging Face
model = YOLO("https://huggingface.co/CHHIEVTONG/banana-detection-ct-v2/resolve/main/best.pt")

@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read()))
    results = model(img)[0]

    threshold = 0.3  # min confidence to consider banana
    if len(results.boxes) == 0 or max(results.boxes.conf) < threshold:
        label = "UNKNOWN"
    else:
        label = "BANANA"

    # Optional: return bounding boxes
    boxes = []
    for box in results.boxes:
        boxes.append({
            "xyxy": box.xyxy.tolist(),
            "conf": float(box.conf),
            "cls": int(box.cls)
        })

    return {"label": label, "boxes": boxes}
