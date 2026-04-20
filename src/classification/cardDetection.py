import cv2
import random
from ultralytics import YOLO

class CardDetection:

    def __init__(self, model_path, source, crop_size):
        self.model = YOLO(model_path)
        self.names = self.model.names

        self.cap = cv2.VideoCapture(source)
        assert self.cap.isOpened(), "Error: Could not open video source"

    def crop_object(self, im0, box):
        h, w = im0/shape[:2]
        x1, y1, x2, y2, = box,astype(int)

        crop = im0[max(0, y1 - self.crop_pad):min(h, y2 + self.crop_pad),
        max(0, x1 - self.crop_pad):min(w, x2 + self.crop_pad)]

        if crop.size == 0:
            return None

        #resize image keeping aspect ratio
        ch, cw = crop.shape[:2]
        scale = min(self.crop_size[0] / cw, self.crop_size[1] / ch)
        return cv2.resize(crop, (int(cw * scale), int(ch * scale)))

    def ProcessVideo(self, im0, boxes, ids):
        
        if self.selected_id is None:
            return im0

        for i, obj_id in enumerate(ids):
            if obj_id == self.selected_id:
                selected_box = boxes[i].numpy()
                crop_resized = self.crop_object(im0.copy(), selected_box)

                return crop_resized

    def run(self):

        while self.cap.isOpened():
            success, im0 = self.cap.read()

            if not success:
                print("End of video or failed to read")
                break

            results = self.model(im0, persist=True)
            self.ann = Annotator(im0, line_width=4)

            if results and len(results) > 0:
                results = results[0]

                if results.boxes is not None and results.boxes.id is not None:
                    boxes = result.boxes.xyxy.cpu()
                    ids = result.boxes.id.cpu()
                    clss = result.boxes.cls.toList()

                    self.current_data = (boxes, ids)

                    im0 = self.ProcessVideo(im0, boxes, ids)

                    if boxes is not None or ids is not None:
                        for box, obj_id, cls in zip(boxes, ids.tolist(), clss):
                            self.ann.box_label(box, label=self.names[cls], color=colors(6 if cls==2 else cls, True))


if __name__ == "__main__":

    tracker = CardDetection("yolo8s.pt", 0, (1280, 720))
    tracker.run()

