# Placeholder content for scripts/image_processing.py
# image_processing.py - Image Preprocessing
import cv2
import numpy as np

def preprocess_image(image):
    # Convert image to grayscale and normalize
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    normalized = cv2.equalizeHist(gray)
    return cv2.cvtColor(normalized, cv2.COLOR_GRAY2BGR)
