import cv2
import numpy as np

def recognize_face(image):
    # Placeholder for a real face recognition model
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_detected = np.mean(gray) > 50  # Dummy condition for detection
    return "Face Detected" if face_detected else "No Face Detected"