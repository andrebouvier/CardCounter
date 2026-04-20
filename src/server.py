import asyncio
from websockets.asyncio.server import serve 

port = 8000
address = '127.0.0.1'

async def echo(websocket, path):
    async for message in websocket:
        await websocket.send(message)

async def handler(websocket):
    # message = await websocket.recv()
    # print(message)
    # await websocket.send("Message received")
    async for message in websocket:
        print("received message: ", message)
        await websocket.send("Message received")

async def main():
    # asyncio.get_event_loop().run_until_complete(
    #     websockets.asyncio.serve(echo, address=address, port=port, handler=handler))

    # asyncio.get_event_loop().run_forever()
    # # handler(websocket, path)
    # print("Server has started successfully")
    async with serve(handler, address, port):
        print("WebSocket server is listening")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())