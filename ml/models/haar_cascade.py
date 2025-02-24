import cv2

def detect_faces(image):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Adjust scaleFactor and minNeighbors
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.5, minNeighbors=4, minSize=(50, 50))
    
    return faces
