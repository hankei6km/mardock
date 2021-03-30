import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import Layout from '../../components/Layout';
import ListDocs from '../../components/ListDocs';
// import Typography from '@material-ui/core/Typography';
import { PageData, IndexList } from '../../types/pageTypes';
import { getPagesData, getSortedIndexData } from '../../lib/pages';
import NavPagination from '../../components/NavPagination';
import { GetQuery } from '../../types/client/queryTypes';

const itemsPerPage = 10;
const pagePath: string[] = [];

type Props = {
  pageData: PageData;
  items: IndexList;
};

const DocsPage = ({ pageData, items }: Props) => {
  if (pageData === undefined || !pageData.title) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout
      apiName={'pages'}
      {...pageData}
      notification={pageData.notification}
      bottomSection={
        <section>
          <ListDocs itemPath={'/docs'} items={items} />
        </section>
      }
    >
      <section>
        <NavPagination
          pageNo={pageData.pageNo}
          pageCount={pageData.pageCount}
          curCategory={pageData.curCategory}
          paginationHref={'/docs/page/[..id]'}
          paginationBaseAs={'/docs/page'}
          paginationPagePath={pagePath}
          paginationFirstPageHref={'/docs'}
        />
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const pageNo = 1;
  const curCategory = '';
  const pageData = await getPagesData(
    'pages',
    {
      ...context,
      params: { id: 'docs' }
    },
    {
      pageNo,
      curCategory,
      itemsPerPage
    }
  );
  const q: GetQuery = {};
  if (itemsPerPage !== undefined) {
    q.limit = itemsPerPage;
    if (pageNo !== undefined) {
      q.offset = itemsPerPage * (pageNo - 1);
    }
  }
  if (curCategory) {
    q.filters = `category[contains]${curCategory}`;
  }
  const items = await getSortedIndexData('docs', q);
  return { props: { pageData, items } };
};

export default DocsPage;
