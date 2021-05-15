// キャッシュの整理.
// latest 以外を削除する.
// 存在しなくなった id の削除は未対応.
const path = require('path');
const fsPromises = require('fs/promises');

const basePath = process.argv[2] || '.mardock/cache';
// console.log(basePath);
const deckPath = path.join(basePath, 'deck');
fsPromises.readdir(deckPath, { withFileTypes: true }).then((data) => {
  data.forEach((d) => {
    if (d.isDirectory()) {
      const latest = fsPromises.readFile(path.join(deckPath, d.name, 'latest'));
      const idPath = path.join(deckPath, d.name);
      const dir = fsPromises.readdir(idPath, {
        withFileTypes: true
      });
      Promise.all([latest, dir]).then(([latest, dir]) => {
        // console.log(latest.toString('utf8').split('\n', 2)[0]);
        const hash = latest.toString('utf8').split('\n', 2)[0];
        const tgt = dir
          .filter((d) => d.name !== hash && d.isDirectory())
          .map((d) => d.name);
        tgt.forEach((t) => {
          const tgtPath = path.join(idPath, t);
          // console.log(tgtPath);
          fsPromises
            .rm(tgtPath, {
              recursive: true
            })
            .then((_resolved, rejected) => {
              if (rejected) {
                console.error(rejected);
              }
            });
        });
      });
    }
  });
});
