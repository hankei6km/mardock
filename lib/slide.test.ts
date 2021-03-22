import { Writable } from 'stream';
import { slideHtml, getSlideData } from './slide';

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
    b=''
    expect(await slideHtml('', w)).toEqual(0);
    expect(b).toContain('');
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
