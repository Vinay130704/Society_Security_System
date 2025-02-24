import cv2
import os

# Get the absolute path to the model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTXT_PATH = os.path.join(BASE_DIR, "deploy.prototxt")
MODEL_PATH = os.path.join(BASE_DIR, "res10_300x300_ssd_iter_140000.caffemodel")

def recognize_with_dnn(image):
    if not os.path.exists(PROTOTXT_PATH) or not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("DNN model files not found. Check file paths.")

    net = cv2.dnn.readNetFromCaffe(PROTOTXT_PATH, MODEL_PATH)
    
    blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    
    confidence_threshold = 0.5
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            return f"Face Detected with {confidence * 100:.2f}% confidence"

    return "No Face Detected"
