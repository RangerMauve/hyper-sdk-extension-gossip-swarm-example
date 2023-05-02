# hyper-sdk-extension-gossip-swarm-example
An example for how you can use hyper-sdk to create a swarm of peers to gossip around a topic.

## Running

- Set up node.js
- `npm install`
- Open two terminals
- `node index.js` in one
- Wait for it to output it's URL
- `node index.js` in the second terminal
- It should output itself, and then both should find each other and output each others URLs 
