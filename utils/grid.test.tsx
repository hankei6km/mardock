import { gridTempalteAreasFromLayout } from './grid';

describe('gridTempalteAreasFromLayout()', () => {
  it('should return grid template areas', () => {
    expect(
      gridTempalteAreasFromLayout({
        top: <aside>test1</aside>,
        main: true,
        bottom: <div>test2</div>
      })
    ).toStrictEqual('"top top main main main main main main bot bot bot"');
    expect(
      gridTempalteAreasFromLayout({
        top: <aside>test1</aside>,
        main: <section>test2</section>,
        bottom: <div>test2</div>
      })
    ).toStrictEqual('"top top main main main main main main bot bot bot"');
    expect(
      gridTempalteAreasFromLayout({
        top: <aside>test1</aside>,
        main: <section>test2</section>,
        bottom: undefined
      })
    ).toStrictEqual('"top top main main main main main main main main main"');
    expect(
      gridTempalteAreasFromLayout({
        top: undefined,
        main: <section>test2</section>,
        bottom: <div>test2</div>
      })
    ).toStrictEqual('"main main main main main main main main bot bot bot"');
    expect(
      gridTempalteAreasFromLayout({
        top: undefined,
        main: <section>test2</section>,
        bottom: undefined
      })
    ).toStrictEqual('"main main main main main main main main main main main"');
  });
});
