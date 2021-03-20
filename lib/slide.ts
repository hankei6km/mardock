import { spawn } from 'child_process';
import { join } from 'path';
import { Writable } from 'stream';
const marpPath = join(__dirname, '..', 'node_modules', '.bin', 'marp');
// temp ファイル、fifo 等も考えたが今回は pipe で楽する。
// 速度的に不利になったら考える。
// import { marpCli } from '@marp-team/marp-cli';

export function slideHtml(markdown: string, w: Writable): Promise<number> {
  // とりあえず。
  // writable として実装しておいた方が楽かな
  return new Promise((resolve) => {
    let e = '';
    const marpP = spawn(marpPath, []);
    marpP.stdout.pipe(w);
    marpP.stderr.on('data', (data) => {
      e = e + data.toString('utf8');
    });
    marpP.on('close', (code) => {
      resolve(code);
      if (code !== 0) {
        throw new Error(`slideHtml error: ${e}`);
      }
    });
    marpP.stdin.write(markdown);
    marpP.stdin.end();
  });
  //marpCli(['./slides/slide-deck.md', '-o', './dist/index.html'])
  //  .then((exitStatus) => {
  //    if (exitStatus > 0) {
  //      console.error(`Failure (Exit status: ${exitStatus})`);
  //    } else {
  //      console.log('Success');
  //    }
  //  })
  //  .catch(console.error);
}
