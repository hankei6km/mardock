const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
// beforeEach(() => {
//
// })
//
const globalBasePath = path.join('work', 'purge_cache');
afterAll(() => {
  fs.rmSync(globalBasePath, { recursive: true });
});

function writeMockDeck(basePath, id, hash) {
  fs.writeFileSync(path.join(basePath, id, hash, `${id}.png`), '');
  fs.writeFileSync(path.join(basePath, id, hash, `${id}.pdf`), '');
  fs.writeFileSync(path.join(basePath, id, hash, `${id}.pptx`), '');
}

describe('deck', () => {
  const basePath = path.join(globalBasePath, 'deck', '.mardock', 'cache');
  const deckPath = path.join(basePath, 'deck');
  beforeEach(() => {
    try {
      fs.rmSync(deckPath, { recursive: true });
    } catch (_err) {}
    try {
      fs.mkdirSync(deckPath, { recursive: true });
      fs.mkdirSync(path.join(deckPath, 'id1', 'hash1'), {
        recursive: true
      });
      fs.mkdirSync(path.join(deckPath, 'id1', 'hash2'), {
        recursive: true
      });
      fs.mkdirSync(path.join(deckPath, 'id2', 'hash1'), {
        recursive: true
      });
      fs.mkdirSync(path.join(deckPath, 'id2', 'hash2'), {
        recursive: true
      });
      fs.writeFileSync(path.join(deckPath, 'id1', 'latest'), 'hash1');
      fs.writeFileSync(path.join(deckPath, 'id2', 'latest'), 'hash2');
      writeMockDeck(deckPath, 'id1', 'hash1');
      writeMockDeck(deckPath, 'id1', 'hash2');
      writeMockDeck(deckPath, 'id2', 'hash1');
      writeMockDeck(deckPath, 'id2', 'hash2');
    } catch (err) {
      console.error(err);
    }
  });
  afterEach(() => {
    fs.rmSync(deckPath, { recursive: true });
  });
  it('should purge cache items', async () => {
    const purge = child_process.spawn('node', [
      path.join('scripts', 'purge_cache.js'),
      basePath
    ]);
    const p = new Promise((resolve) => {
      purge.on('close', (code) => resolve(code));
    });
    expect(await p).toEqual(0);
    expect(fs.statSync(path.join(deckPath, 'id1', 'hash1'))).not.toBeNull();
    expect(() => fs.statSync(path.join(deckPath, 'id1', 'hash2'))).toThrow();
    expect(() => fs.statSync(path.join(deckPath, 'id2', 'hash1'))).toThrow();
    expect(fs.statSync(path.join(deckPath, 'id2', 'hash2'))).not.toBeNull();
  });
});
