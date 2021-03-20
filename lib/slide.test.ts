import { Writable } from 'stream';
import { slideHtml } from './slide';

describe('slideHtml()', () => {
  it('should convert slide to html', async () => {
    let b = '';
    const w = new Writable({
      write(data) {
        b = b + data.toString();
      }
    });
    // w.on('data', (data) => console.log(data.toString()));

    expect(await slideHtml('#test1 \n\n---\n- item1\n- item2', w)).toEqual(0);
    expect(b).toContain('html');
    expect(await slideHtml('', w)).toEqual(0);
    expect(b).toContain('');
  });
});
