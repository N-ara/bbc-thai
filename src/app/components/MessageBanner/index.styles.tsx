import { css, Theme } from '@emotion/react';
import pixelsToRem from '../../utilities/pixelsToRem';

const styles = {
  container: ({ palette }: Theme) =>
    css({
      paddingTop: '2rem',
      paddingBottom: '2rem',
    }),
  card: ({ palette, mq }: Theme) =>
    css({
      height: 'auto',
      background:
        'radial-gradient(circle at 50% 1%, #cc2c00, maroon 36%,#380400 65%, #1e0505 86%)',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      [mq.GROUP_3_ONLY]: {
        background:
          'radial-gradient(circle at 50% 1%, #cc2c00, maroon 36%,#380400 65%, #1e0505 86%)',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        background:
          'linear-gradient(33deg, rgba(121,9,22,1) 0%, rgba(2,0,36,1) 54%, rgba(121,9,22,1) 90%)',
      },
    }),
  textWrap: ({ palette, mq }: Theme) =>
    css({
      [mq.GROUP_3_ONLY]: {
        width: '66%',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        width: '75%',
      },
    }),
  heading: ({ palette }: Theme) =>
    css({
      paddingTop: '1.5rem',
      paddingBottom: '0.5rem',
      color: palette.WHITE,
    }),
  paragraph: ({ palette }: Theme) =>
    css({
      paddingBottom: '1rem',
      color: palette.WHITE,
    }),
  imageLtr: ({ mq }: Theme) =>
    css({
      maxWidth: '184px',
      [mq.GROUP_3_ONLY]: {
        maxWidth: '224px',
        bottom: 0,
        right: 0,
        position: 'absolute',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        maxWidth: '224px',
        bottom: 0,
        right: 0,
        position: 'absolute',
      },
      img: { objectPosition: 'top' },
    }),
  imageRtl: ({ mq }: Theme) =>
    css({
      maxWidth: '184px',
      [mq.GROUP_3_ONLY]: {
        maxWidth: '224px',
        bottom: 0,
        left: 0,
        position: 'absolute',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        maxWidth: '224px',
        bottom: 0,
        left: 0,
        position: 'absolute',
      },
      img: { objectPosition: 'top' },
    }),
  linkbackground: ({ mq, palette }: Theme) =>
    css({
      padding: '1rem',
      backgroundColor: palette.WHITE,
      margin: '0 1rem 1rem 1rem',
      width: '100%',
      '&:hover': {
        backgroundColor: '#F6F6F6',
      },
      [mq.GROUP_3_ONLY]: {
        width: 'auto',
        margin: '0 0 1.5rem 0',
        paddingBottom: '1rem',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        width: 'auto',
        margin: '0 0 1.5rem 0',
        paddingBottom: '1rem',
      },
    }),
  link: ({ palette, mq }: Theme) =>
    css({
      color: palette.BLACK,
      textDecoration: 'none',
      '&:hover, &:focus': {
        textDecoration: 'underline',
      },
      '&:focus': {
        paddingTop: `${pixelsToRem(6)}rem`,
        paddingBottom: `${pixelsToRem(6)}rem`,
        paddingLeft: `${pixelsToRem(9)}rem`,
        paddingRight: `${pixelsToRem(40)}rem`,
        outline: `${pixelsToRem(3)}rem solid ${palette.BLACK}`,
        boxShadow: `0 0 0 ${pixelsToRem(3)}rem ${palette.WHITE}`,
        outlineOffset: `${pixelsToRem(3)}rem`,
      },
      paddingRight: '0.5rem',
      paddingLeft: '0.5rem',
      verticalAlign: 'middle',
    }),
  chevron: ({ palette }: Theme) =>
    css({
      width: '1rem',
      height: '1rem',
      verticalAlign: 'middle',
    }),
  linkAndChevron: ({ palette }: Theme) =>
    css({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    }),

  flex: ({ mq, palette }: Theme) =>
    css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      [mq.GROUP_3_ONLY]: {
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'start',
        alignItems: 'flex-end',
        position: 'relative',
      },
      [mq.GROUP_4_MIN_WIDTH]: {
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'start',
        alignItems: 'flex-end',
        position: 'relative',
      },
    }),
};
export default styles;
