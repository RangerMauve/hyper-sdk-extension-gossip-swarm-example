import * as SDK from 'hyper-sdk'
import blake2b from 'blake2b'

const sdk = await SDK.create({
  // Doesn't persist on disk so it's fresh each time
  storage: false
})

const topic = 'extension-gossip-example'

const coreKey = new Uint8Array(32)

// Hash the topic to get a hypercore key that's the same accross all peers
blake2b(coreKey.length).update(Buffer.from(topic)).digest(coreKey)

const db = await sdk.getBee(topic)
const advertisementCore = await sdk.get(coreKey)

console.log('Should be swarming on the key now')

// Note that the dbId is unique to the peer
// The advertisement core ID is unique to the topic
// However the advertisement ID is shared by all
// The advertisement core is how you find peers
console.log({
  dbId: db.url,
  advertisementCoreId: advertisementCore.url
})

const knownDBs = new Set()
knownDBs.add(db.url)

advertisementCore.on('peer-open', handleNewPeer)

const extension = advertisementCore.registerExtension(topic, {
  encoding: 'json',
  onmessage: handleMessage

})

// Upon getting initialized, we should broadcast ourselves out
broadcastKnownDBs()

function handleNewPeer () {
  // Whenever we get a new peer, we shoudl tell them about our known DBs
  broadcastKnownDBs()
}

function handleMessage (message) {
  // Track if this peer gave us any new URLs
  let sawNew = false
  for (const url of message) {
    if (knownDBs.has(url)) continue
    sawNew = true
    knownDBs.add(url)

    // Since it's new, do something with it
    handleNewDBURL(url)
  }

  // Since we saw something new, it might be new to our peers too
  // Let everyone know we saw it
  // Eventually
  if (sawNew) broadcastKnownDBs()
}

function handleNewDBURL (url) {
  console.log('New DB URL!', url)
}

function broadcastKnownDBs () {
  // Send an extension message to all peers
  // This will contain the JSON array of your known DBs
  extension.broadcast([...knownDBs])
}
