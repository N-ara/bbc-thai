import React, { useContext, forwardRef } from 'react';
import Brand from '@bbc/psammead-brand';
import { bool, node, oneOfType, func, shape, any } from 'prop-types';
import { ServiceContext } from '#contexts/ServiceContext';

const BrandContainer = forwardRef(
  ({ skipLink, scriptLink, ...props }, linkRef) => {
    const {
      product,
      serviceLocalizedName,
      brandSVG,
      service,
      theming,
    } = useContext(ServiceContext);

    const { brandBackgroundColour, brandLogoColour } = theming;
    const svgMaxHeight = 24;
    const svgMinHeight = 16;
    const svgRatio = brandSVG && brandSVG.ratio;
    const minWidth = svgRatio * svgMinHeight;
    const maxWidth = svgRatio * svgMaxHeight;

    return (
      <Brand
        backgroundColour={brandBackgroundColour}
        logoColour={brandLogoColour}
        product={product}
        serviceLocalisedName={serviceLocalizedName}
        svgHeight={svgMaxHeight}
        minWidth={minWidth}
        maxWidth={maxWidth}
        svg={brandSVG}
        url={`/${service}`}
        skipLink={skipLink}
        scriptLink={scriptLink}
        focusRef={linkRef}
        {...props}
      />
    );
  },
);

BrandContainer.propTypes = {
  borderTop: bool,
  borderBottom: bool,
  skipLink: node,
  scriptLink: node,
  // eslint-disable-next-line react/forbid-prop-types
  linkRef: oneOfType([func, shape({ current: any })]),
};

BrandContainer.defaultProps = {
  borderTop: false,
  borderBottom: false,
  skipLink: null,
  scriptLink: null,
  linkRef: null,
};

export default BrandContainer;
