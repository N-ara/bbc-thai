import React, { useEffect, useState, useContext } from 'react';
import 'isomorphic-fetch';
import { oneOf, string, elementType } from 'prop-types';
import { RequestContext } from '#contexts/RequestContext';
import nodeLogger from '#lib/logger.node';
import {
  MOST_READ_CLIENT_REQUEST,
  MOST_READ_FETCH_ERROR,
} from '#lib/logger.const';
import { ServiceContext } from '../../../../contexts/ServiceContext';
import MostReadRank from './Rank';
import processMostRead from '../utilities/processMostRead';
import mostReadShape from '../utilities/mostReadShape';

const logger = nodeLogger(__filename);

const CanonicalMostRead = ({
  endpoint,
  columnLayout,
  size,
  initialData,
  wrapper: Wrapper,
}) => {
  const { isAmp } = useContext(RequestContext);
  const {
    service,
    script,
    dir,
    datetimeLocale,
    timezone,
    mostRead: { lastUpdated, numberOfItems },
  } = useContext(ServiceContext);

  const filteredData = processMostRead({
    data: initialData,
    isAmp,
    numberOfItems,
    service,
  });

  const [items, setItems] = useState(filteredData);

  useEffect(() => {
    if (!items) {
      const handleResponse = url => async response => {
        if (!response.ok) {
          throw Error(
            `Unexpected response (HTTP status code ${response.status}) when requesting ${url}`,
          );
        }
        const mostReadData = await response.json();
        setItems(
          processMostRead({
            data: mostReadData,
            isAmp,
            numberOfItems,
            service,
          }),
        );
      };

      const fetchMostReadData = pathname => {
        logger.info(MOST_READ_CLIENT_REQUEST, { url: endpoint });

        return fetch(pathname)
          .then(handleResponse(pathname))
          .catch(error => {
            logger.error(MOST_READ_FETCH_ERROR, {
              url: pathname,
              error: error.toString(),
            });
          });
      };

      fetchMostReadData(endpoint);
    }
  }, [
    endpoint,
    numberOfItems,
    datetimeLocale,
    lastUpdated,
    script,
    service,
    timezone,
    items,
    isAmp,
  ]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      {items.map((item, i) => (
        <MostReadRank
          service={service}
          script={script}
          listIndex={i + 1}
          numberOfItems={items.length}
          dir={dir}
          columnLayout={columnLayout}
          size={size}
        />
      ))}
    </Wrapper>
  );
};

CanonicalMostRead.propTypes = {
  endpoint: string.isRequired,
  columnLayout: oneOf(['oneColumn', 'twoColumn', 'multiColumn']),
  size: oneOf(['default', 'small']),
  initialData: mostReadShape,
  wrapper: elementType,
};

CanonicalMostRead.defaultProps = {
  columnLayout: 'multiColumn',
  size: 'default',
  initialData: null,
  wrapper: React.Fragment,
};

export default CanonicalMostRead;
