import { LIBRARY_VERSION } from '../../../../lib/analyticsUtils';
import { buildATIPageTrackPath } from '../../atiUrl';
import { ATIDataWithContexts } from '../../types';

export const buildPageATIParams = ({
  atiData,
  requestContext,
  serviceContext,
}: ATIDataWithContexts) => {
  const { isUK, origin, pageType, platform, previousPath, statsDestination } =
    requestContext;
  const { atiAnalyticsAppName, atiAnalyticsProducerId, lang, service } =
    serviceContext;
  const {
    categoryName,
    contentId,
    contentType,
    language,
    ldpThingIds,
    ldpThingLabels,
    nationsProducer,
    pageIdentifier,
    pageTitle,
    timePublished,
    timeUpdated,
  } = atiData;

  return {
    appName: atiAnalyticsAppName,
    categoryName,
    contentId,
    contentType: contentType || pageType,
    isUK,
    language: language || lang,
    ldpThingIds,
    ldpThingLabels,
    libraryVersion: LIBRARY_VERSION,
    nationsProducer,
    origin,
    pageIdentifier,
    pageTitle,
    platform,
    previousPath,
    producerId: atiAnalyticsProducerId,
    service,
    statsDestination,
    timePublished,
    timeUpdated,
  };
};

export const buildPageATIUrl = ({
  atiData,
  requestContext,
  serviceContext,
}: ATIDataWithContexts) =>
  buildATIPageTrackPath(
    buildPageATIParams({ atiData, requestContext, serviceContext }),
  );
