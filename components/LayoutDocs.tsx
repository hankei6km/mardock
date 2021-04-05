import 'highlight.js/styles/mono-blue.css';
import Layout, { Props } from './Layout';

const LayoutDocs = ({ children, ...others }: Props) => {
  return <Layout {...others}>{children}</Layout>;
};
export default LayoutDocs;
