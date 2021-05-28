import * as fs from 'fs';
import * as child_process from 'child_process';
import {
  slideCacheSetup,
  slideCopyCacheToAssets,
  slideDeckRemoveId,
  writeSlideTitleImage
} from './slide';
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest
    .fn()
    .mockImplementation(jest.requireActual('fs').createWriteStream),
  mkdirSync: jest.fn().mockImplementation(jest.requireActual('fs').mkdirSync),
  writeFileSync: jest
    .fn()
    .mockImplementation(jest.requireActual('fs').writeFileSync),
  copyFileSync: jest
    .fn()
    .mockImplementation(jest.requireActual('fs').copyFileSync),
  statSync: jest.fn().mockImplementation(jest.requireActual('fs').statSync)
}));
jest.mock('child_process', () => {
  return {
    ...jest.requireActual('child_process'),
    spawn: jest
      .fn()
      .mockImplementation(jest.requireActual('child_process').spawn),
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
    .spyOn(fs, 'mkdirSync')
    .mockImplementation(jest.requireActual('fs').mkdirSync);
  jest
    .spyOn(fs, 'copyFileSync')
    .mockImplementation(jest.requireActual('fs').copyFileSync);
  jest
    .spyOn(fs, 'statSync')
    .mockImplementation(jest.requireActual('fs').statSync);
  jest
    .spyOn(fs, 'writeFileSync')
    .mockImplementation(jest.requireActual('fs').writeFileSync);
  jest
    .spyOn(child_process, 'spawn')
    .mockImplementation(jest.requireActual('child_process').spawn);
  jest
    .spyOn(child_process, 'execFile')
    .mockImplementation(jest.requireActual('child_process').execFile);
  jest.clearAllMocks();
});

describe('slideCacheSetup()', () => {
  it('should return true if cache dir is not exists', () => {
    const mkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
    const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    expect(slideCacheSetup('test-id', 'test-key')).toBe(true);
    expect(mkdirSync.mock.calls.length).toEqual(4);
    expect(mkdirSync.mock.calls[0][0]).toEqual('public/assets/deck/test-id');
    expect(mkdirSync.mock.calls[1][0]).toEqual(
      'public/assets/deck/test-id/test-key'
    );
    expect(mkdirSync.mock.calls[2][0]).toEqual('.mardock/cache/deck/test-id');
    expect(mkdirSync.mock.calls[3][0]).toEqual(
      '.mardock/cache/deck/test-id/test-key'
    );
    expect(writeFileSync.mock.calls[0]).toEqual([
      '.mardock/cache/deck/test-id/latest',
      'test-key'
    ]);
  });
  it('should return false if cache dir is exists', () => {
    const mkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('test-err');
    });
    const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    expect(slideCacheSetup('test-id', 'test-key')).toBe(false);
    expect(mkdirSync.mock.calls.length).toEqual(4);
    expect(mkdirSync.mock.calls[0][0]).toEqual('public/assets/deck/test-id');
    expect(mkdirSync.mock.calls[1][0]).toEqual(
      'public/assets/deck/test-id/test-key'
    );
    expect(mkdirSync.mock.calls[2][0]).toEqual('.mardock/cache/deck/test-id');
    expect(mkdirSync.mock.calls[3][0]).toEqual(
      '.mardock/cache/deck/test-id/test-key'
    );
    expect(writeFileSync.mock.calls.length).toEqual(0);
  });
});

describe('slideCopyCacheToAssets()', () => {
  it('should return null when normal end', () => {
    const copyFileSync = jest.spyOn(fs, 'copyFileSync').mockImplementation();
    const statSync = jest
      .spyOn(fs, 'statSync')
      .mockReturnValue({ size: 1 } as any);
    expect(slideCopyCacheToAssets('test-id', 'test-key', 'test-id.pdf')).toBe(
      null
    );
    expect(copyFileSync.mock.calls[0]).toEqual([
      '.mardock/cache/deck/test-id/test-key/test-id.pdf',
      'public/assets/deck/test-id/test-key/test-id.pdf'
    ]);
    expect(statSync.mock.calls[0]).toEqual([
      'public/assets/deck/test-id/test-key/test-id.pdf'
    ]);
  });
  it('should return error when abnormal end', () => {
    const copyFileSync = jest
      .spyOn(fs, 'copyFileSync')
      .mockImplementation(() => {
        throw new Error('test-err');
      });
    expect(
      slideCopyCacheToAssets('test-id', 'test-key', 'test-id.pdf')
    ).not.toBe(null);
    expect(copyFileSync.mock.calls[0]).toEqual([
      '.mardock/cache/deck/test-id/test-key/test-id.pdf',
      'public/assets/deck/test-id/test-key/test-id.pdf'
    ]);
  });
  it('should return error when file size = 0', () => {
    const copyFileSync = jest.spyOn(fs, 'copyFileSync').mockImplementation();
    const statSync = jest
      .spyOn(fs, 'statSync')
      .mockReturnValue({ size: 0 } as any);
    expect(
      slideCopyCacheToAssets('test-id', 'test-key', 'test-id.pdf')
    ).not.toBe(null);
    expect(copyFileSync.mock.calls[0]).toEqual([
      '.mardock/cache/deck/test-id/test-key/test-id.pdf',
      'public/assets/deck/test-id/test-key/test-id.pdf'
    ]);
    expect(statSync.mock.calls[0]).toEqual([
      'public/assets/deck/test-id/test-key/test-id.pdf'
    ]);
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
    const copyFileSync = jest.spyOn(fs, 'copyFileSync').mockImplementation();
    const statSync = jest
      .spyOn(fs, 'statSync')
      .mockReturnValue({ size: 1 } as any);
    const setEncoding = jest.fn();
    const execFile = jest
      .spyOn(child_process, 'spawn')
      .mockImplementation((_a1, _a2) => {
        let closeCb = (_code: number) => undefined;
        return ({
          on: jest.fn().mockImplementation((a1, cb) => {
            expect(a1).toEqual('close');
            closeCb = cb as any;
          }),
          stdin: {
            write: jest.fn(),
            end: jest.fn().mockImplementation(() => closeCb(0))
          },
          stdout: {
            pipe: jest.fn().mockImplementation((w) => {
              (w as any).write(Buffer.from('ok', 'utf8'));
            }),
            setEncoding
          }
        } as unknown) as child_process.ChildProcess;
      });
    const res = await writeSlideTitleImage(
      true,
      'test-deck',
      'test-hash',
      '---\ntitle: slide1\n---\n#test1 \n\n---\n- item1\n- item2'
    );
    // expect(s.mock.calls).toEqual(['public/assets/images/test-deck.png']);
    expect(createWriteStream).toHaveBeenCalledWith(
      '.mardock/cache/deck/test-deck/test-hash/test-deck.png',
      {
        flags: 'wx',
        encoding: 'binary'
      }
    );
    expect(execFile.mock.calls[0][0]).toEqual('node_modules/.bin/marp');
    expect(execFile.mock.calls[0][1]).toEqual(['--image', 'png', '--html']);
    expect(setEncoding.mock.calls[0][0]).toEqual('binary');
    expect(write.mock.calls[0][0].toString('utf8')).toEqual('ok');
    expect(close).toHaveBeenCalledTimes(1);
    expect(copyFileSync.mock.calls[0]).toEqual([
      '.mardock/cache/deck/test-deck/test-hash/test-deck.png',
      'public/assets/deck/test-deck/test-hash/test-deck.png'
    ]);
    expect(statSync.mock.calls[0]).toEqual([
      'public/assets/deck/test-deck/test-hash/test-deck.png'
    ]);
    expect(res).toEqual({
      url: '/assets/deck/test-deck/test-hash/test-deck.png',
      width: 1280,
      height: 720
    });
  });
  it('should throw error when exit code is not zero', async () => {
    jest.spyOn(child_process, 'spawn').mockImplementation((_a1, _a2) => {
      let closeCb = (_code: number) => undefined;
      return ({
        on: jest.fn().mockImplementation((a1, cb) => {
          expect(a1).toEqual('close');
          closeCb = cb as any;
        }),
        stdin: {
          write: jest.fn(),
          end: jest.fn().mockImplementation(() => closeCb(1))
        },
        stderr: {
          on: jest.fn().mockImplementation((a1, w) => {
            expect(a1).toEqual('data');
            (w as any)(Buffer.from('test-err', 'utf8'));
          }),
          setEncoding: jest.fn()
        }
      } as unknown) as child_process.ChildProcess;
    });
    expect(
      writeSlideTitleImage(
        true,
        'test-deck',
        'test-hash',
        '---\ntitle: slide1\n---\n#test1 \n\n---\n- item1\n- item2'
      )
    ).rejects.toThrow(/test-err/);
  });
  it('should throw error when "[ Error }" is cotained stderr', async () => {
    jest.spyOn(child_process, 'spawn').mockImplementation((_a1, _a2) => {
      let closeCb = (_code: number) => undefined;
      return ({
        on: jest.fn().mockImplementation((a1, cb) => {
          expect(a1).toEqual('close');
          closeCb = cb as any;
        }),
        stdin: {
          write: jest.fn(),
          end: jest.fn().mockImplementation(() => closeCb(0))
        },
        stderr: {
          on: jest.fn().mockImplementation((a1, w) => {
            expect(a1).toEqual('data');
            (w as any)(
              Buffer.from('[  INFO ] test info\n[ ERROR ] test error', 'utf8')
            );
          }),
          setEncoding: jest.fn()
        }
      } as unknown) as child_process.ChildProcess;
    });
    expect(
      writeSlideTitleImage(
        true,
        'test-deck',
        'test-hash',
        '---\ntitle: slide1\n---\n#test1 \n\n---\n- item1\n- item2'
      )
    ).rejects.toThrow(/^\[ ERROR \] /m);
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
