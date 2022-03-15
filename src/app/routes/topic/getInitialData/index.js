import { BFF_FETCH_ERROR } from '#lib/logger.const';
import nodeLogger from '#lib/logger.node';
import pipe from 'ramda/src/pipe';
import { getUrlPath } from '#lib/utilities/urlParser';
import fetchPageData from '../../utils/fetchPageData';
import getErrorStatusCode from '../../utils/fetchPageData/utils/getErrorStatusCode';

const logger = nodeLogger(__filename);

const removeAmp = path => path.split('.')[0];
const popId = path => path.split('/').pop();

const getId = pipe(getUrlPath, removeAmp, popId);

export default async ({ getAgent, service, path: pathname, variant }) => {
  try {
    const agent = await getAgent();
    const id = getId(pathname);
    const path = `${process.env.BFF_PATH}?id=${id}&service=${service}${
      variant ? `&variant=${variant}` : ``
    }`;
    const { status, json } = await fetchPageData({ path, agent });
    const { data } = json;
    return {
      status,
      pageData: {
        title: data.title,
        promos: data.summaries,

        // TODO - update me when the BFF is returning this data
        activePage: data.activePage || 1,

        // TODO - update me when the BFF is returning this data
        pageCount: data.pageCount || 99,

        metadata: {
          type: 'Topic',
        },
      },
    };
  } catch ({ message, status = getErrorStatusCode() }) {
    logger.error(BFF_FETCH_ERROR, {
      service,
      status,
      pathname,
      message,
    });
    return { error: message, status };
  }
};
