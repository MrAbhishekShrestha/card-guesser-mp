# Server Messages

Sample Error Response:

```json
{
  "action": "SET_NAME",
  "status": "FAIL",
  "error": {
    "message": "invalid name"
  }
}
```

Sample Data Response:

```json
{
  "action": "CREATE_ROOM",
  "status": "SUCCESS",
  "payload": {
    "roomId": "asdf-asdf-asdf-asdf"
  }
}
```

## All Server Messages:

1. Register Player (player)
2. Create room (player)

   2.1. success

   2.2. fail

3. Join Room (broadcast)

   3.1. success

   3.2. fail

4. Leave Room (broadcast)

   4.1. success

   4.2. fail

5. Start Game (broadcast)

   5.1. success

   5.2. fail

6. Make Move ()

   6.2. fail

7. Game Over (broadcast)

8. Set name

   8.1. fail
