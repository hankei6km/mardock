import * as fs from 'fs';
import * as child_process from 'child_process';
import { Writable } from 'stream';
import {
  slideHtml,
  slideDeckRemoveId,
  getSlideData,
  writeSlideTitleImage
} from './slide';
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest
    .fn()
    .mockImplementation(jest.requireActual('fs').createWriteStream)
}));
jest.mock('child_process', () => {
  return {
    ...jest.requireActual('child_process'),
    execFile: jest
      .fn()
      .mockImplementation(jest.requireActual('child_process').execFile)
  };
});

afterEach(() => {
  jest
    .spyOn(fs, 'createWriteStream')
    .mockImplementation(jest.requireActual('fs').createWriteStream);
  jest
    .spyOn(child_process, 'execFile')
    .mockImplementation(jest.requireActual('child_process').execFile);
  jest.clearAllMocks();
});

describe('slideHtml()', () => {
  it('should convert slide to html', async () => {
    let b = '';
    const w = new Writable({
      write(data) {
        b = b + data.toString();
      }
    });
    expect(await slideHtml('#test1 \n\n---\n- item1\n- item2', w)).toEqual(0);
    expect(b).toContain('html');
    b = '';
    expect(await slideHtml('', w)).toEqual(0);
    expect(b).toContain('');
  });
});

describe('writeSlideTitleImage()', () => {
  it('should write image file then return path to image', async () => {
    const write = jest.fn();
    const close = jest.fn();
    const createWriteStream = jest
      .spyOn(fs, 'createWriteStream')
      .mockImplementation((_p, _o) => {
        return ({
          write,
          on: jest.fn(),
          close
        } as unknown) as fs.WriteStream;
      });
    const execFile = jest
      .spyOn(child_process, 'execFile')
      .mockImplementation((_a1, _a2, cb) => {
        // queueMicrotask(() => (cb as any)(null, Buffer.from('ok', 'utf8'), ''));
        process.nextTick(() =>
          (cb as any)(null, Buffer.from('ok', 'utf8'), '')
        );
        return ({
          stdin: {
            write: jest.fn(),
            end: jest.fn()
          }
        } as unknown) as child_process.ChildProcess;
      });
    const res = await writeSlideTitleImage(
      '---\ntitle: slide1\n---\n#test1 \n\n---\n- item1\n- item2',
      'test-deck'
    );
    // expect(s.mock.calls).toEqual(['public/assets/images/test-deck.png']);
    expect(createWriteStream).toHaveBeenCalledWith(
      'public/assets/images/test-deck.png',
      {
        flags: 'wx',
        encoding: 'binary'
      }
    );
    expect(execFile.mock.calls[0][0]).toEqual('node_modules/.bin/marp');
    expect(execFile.mock.calls[0][1]).toEqual(['--image', 'png']);
    expect(write.mock.calls[0][0].toString('utf8')).toEqual('ok');
    expect(close).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      url: '/assets/images/test-deck.png',
      width: 1280,
      height: 720
    });
  });
});

describe('slideDecRemoveId()', () => {
  it('should removeid from slide html', () => {
    expect(
      slideDeckRemoveId(
        '<svg><foreignObject><section id="test1">page1</section></foreignObject></svg>'
      )
    ).toEqual(
      '<svg><foreignObject><section>page1</section></foreignObject></svg>'
    );
  });
});

describe('getSlideData()', () => {
  it('should convert slide source to slideData', async () => {
    const slideData = await getSlideData(
      '---\ntitle: slide1\n---\n#test1 \n\n---\n- item1\n- item2'
    );
    expect(JSON.stringify(slideData.head)).toContain('slide1');
    expect(JSON.stringify(slideData.body)).toContain('item1');
  });
});
