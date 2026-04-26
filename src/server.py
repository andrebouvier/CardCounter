import asyncio
from websockets.asyncio.server import serve 
import numpy as np
import cv2

port = 8000
address = '127.0.0.1'

async def echo(websocket, path):
    async for message in websocket:
        await websocket.send(message)

async def handler(websocket):
    # handle handshake
    async for message in websocket:
        if isinstance(message, str):
            if message == "handshake":
                await websocket.send("handshake:ok")
            continue
        
        # handle frame
        if isinstance(message, (bytes, bytearray)):
            arr = np.frombuffer(message, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            processed = process_frame(frame)

            ok, encoded = cv2.imencode('.jpg', processed, [cv2.IMWRITE_JPEG_QUALITY, 75])
            if not ok:
                continue

            await websocket.send(encoded.tobytes())

#TODO: Implement frame processing
def process_frame(frame: np.ndarray) -> np.ndarray:
    
    processed_frame = frame
    return processed_frame

async def main():
    # asyncio.get_event_loop().run_until_complete(
    #     websockets.asyncio.serve(echo, address=address, port=port, handler=handler))

    # asyncio.get_event_loop().run_forever()
    # # handler(websocket, path)
    # print("Server has started successfully")
    async with serve(handler, address, port, max_size=1024*1024*8):
        print("WebSocket server is listening")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())