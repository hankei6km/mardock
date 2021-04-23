import ButtonBase, { ButtonBaseProps } from '@material-ui/core/ButtonBase';

type Props = ButtonBaseProps;

export default function ButtonSelect(props: Props) {
  return (
    <ButtonBase
      style={{
        display: 'block',
        width: '100%',
        //height: '100%',
        textAlign: 'unset',
        textIndent: 'unset',
        alignItems: 'unset',
        verticalAlign: 'unset',
        outline: 'unset',
        justifyContent: 'unset'
      }}
      {...props}
    />
  );
}
