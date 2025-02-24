import os
import cv2
import numpy as np
from models.face_recognition import recognize_face
from scripts.image_processing import preprocess_image
from models.haar_cascade import detect_faces
from models.dnn_model import recognize_with_dnn

def main():
    print("Starting ML processing...")
    # Example image path (update with real input handling)
    image_path = "sample.png"
    
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return
    
    image = cv2.imread(image_path)
    processed_image = preprocess_image(image)
    
    # Detect faces using Haar Cascade
    faces = detect_faces(processed_image)
    print("Faces detected:", len(faces))
    
    # Recognize faces using DNN model
    result = recognize_with_dnn(processed_image) if len(faces) > 0 else "No Face Detected"
    print("DNN Model Result:", result)    
    print("Recognition Result:", result)
    
if __name__ == "__main__":
    main()
