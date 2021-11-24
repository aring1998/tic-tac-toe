# 接口文档

- **baseurl** `http://81.68.189.158:3700`

## 游戏控制

- **创建房间** `post` `/api/games/createRoom`

- **加入房间** `post` `/api/games/joinRoom`
  - **data** `roomId` *房间号

## WebSocket

- **baseurl** `ws//81.68.189.158:3700/ws`

- **请求体** 
  - `{...some pramas, type: '写入需要调用的ws方案'}`

- **init** 初始化连接，记录客户端
- **create** 创建房间
- **join** 加入房间
- **battle** 对战点击事件
