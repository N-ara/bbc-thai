/* eslint-disable react/prop-types */
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import deepClone from 'ramda/src/clone';

// test helpers
import { render, waitFor } from '@testing-library/react';
import assocPath from 'ramda/src/assocPath';
import fetchMock from 'fetch-mock';

// contexts
import { ServiceContextProvider } from '#contexts/ServiceContext';
import { RequestContextProvider } from '#contexts/RequestContext';
import { ToggleContext } from '#contexts/ToggleContext';

// components to test
import getInitialData from '#app/routes/cpsAsset/getInitialData';

// mock data
import pidginPageData from '#data/pidgin/cpsAssets/world-23252817';
import pidginMostReadData from '#data/pidgin/mostRead/index.json';
import pidginSecondaryColumnData from '#data/pidgin/secondaryColumn/index.json';
import igboPageData from '#data/igbo/cpsAssets/afirika-23252735';
import igboMostReadData from '#data/igbo/mostRead/index.json';
import igboSecondaryColumnData from '#data/igbo/secondaryColumn/index.json';
import russianPageDataWithInlinePromo from '#data/russian/cpsAssets/news-55041160';
import russianMostReadData from '#data/russian/mostRead/index.json';
import russianSecondaryColumnData from '#data/russian/secondaryColumn/index.json';
import ukrainianInRussianPageData from '#data/ukrainian/cpsAssets/news-russian-23333960.json';
import ukrainianSecondaryColumnData from '#data/ukrainian/secondaryColumn/index.json';
import ukrainianMostReadData from '#data/ukrainian/mostRead/index.json';
import hindiPageData from '#data/hindi/cpsAssets/international-60490858.json';
import hindiRecommendationsData from '#data/hindi/recommendations/index.json';
import hindiMostRead from '#data/hindi/mostRead/index.json';
import { sendEventBeacon } from '#containers/ATIAnalytics/beacon';
import { EventTrackingContextProvider } from '#contexts/EventTrackingContext';
import * as optimizelySDK from '@optimizely/react-sdk';
import russianPageDataWithoutInlinePromo from './fixtureData/russianPageDataWithoutPromo';
import StoryPageIndex from '.';
import StoryPage from './StoryPage';

fetchMock.config.overwriteRoutes = false; // http://www.wheresrhys.co.uk/fetch-mock/#usageconfiguration allows us to mock the same endpoint multiple times

jest.mock('#containers/ChartbeatAnalytics', () => {
  const ChartbeatAnalytics = () => <div>chartbeat</div>;
  return ChartbeatAnalytics;
});

jest.mock('#containers/ComscoreAnalytics', () => {
  const ComscoreAnalytics = () => <div>comscore</div>;
  return ComscoreAnalytics;
});

jest.mock('#containers/OptimizelyPageViewTracking', () => {
  const OptimizelyPageViewTracking = () => null;
  return OptimizelyPageViewTracking;
});

jest.mock('#containers/Ad', () => {
  const AdsContainer = () => <div data-testid="sty-ads">STY ADS</div>;
  return AdsContainer;
});

jest.mock('#containers/Ad/Canonical/CanonicalAdBootstrapJs', () => {
  const CanonicalAdBootstrapJs = ({ adcampaign }) => (
    <div data-testid="adBootstrap" data-adcampaign={adcampaign}>
      bootstrap
    </div>
  );
  return CanonicalAdBootstrapJs;
});

jest.mock('#hooks/useOptimizelyVariation', () => {
  const useOptimizelyVariation = () => 'control';
  return useOptimizelyVariation;
});

jest.mock('#containers/ATIAnalytics/beacon', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    sendEventBeacon: jest.fn(),
  };
});

const optimizelyExperimentSpy = jest.spyOn(
  optimizelySDK,
  'OptimizelyExperiment',
);

const optimizely = {
  onReady: jest.fn(() => Promise.resolve()),
  track: jest.fn(),
  user: {
    attributes: {},
  },
  activate: jest.fn(),
  getIsReadyPromiseFulfilled: jest.fn(),
  getIsUsingSdkKey: jest.fn(),
  onForcedVariationsUpdate: jest.fn(),
};

const defaultToggleState = {
  ads: {
    enabled: true,
  },
  mostRead: {
    enabled: true,
  },
  socialEmbed: {
    enabled: true,
  },
};

const Page = ({
  pageData,
  service,
  showAdsBasedOnLocation = false,
  isAmp = false,
  toggles = defaultToggleState,
}) => (
  <StaticRouter>
    <ToggleContext.Provider
      value={{ toggleState: toggles, toggleDispatch: jest.fn() }}
    >
      <ServiceContextProvider
        pageLang={pageData.metadata.language}
        service={service}
      >
        <RequestContextProvider
          bbcOrigin="https://www.test.bbc.co.uk"
          isAmp={isAmp}
          pageType={pageData.metadata.type}
          pathname={pageData.metadata.locators.assetUri}
          service={service}
          statusCode={200}
          showAdsBasedOnLocation={showAdsBasedOnLocation}
        >
          <StoryPageIndex service={service} pageData={pageData} />
        </RequestContextProvider>
      </ServiceContextProvider>
    </ToggleContext.Provider>
  </StaticRouter>
);

const PageWithContext = ({
  pageData,
  service,
  showAdsBasedOnLocation = false,
  isAmp = false,
  toggles = defaultToggleState,
}) => (
  <StaticRouter>
    <ToggleContext.Provider
      value={{ toggleState: toggles, toggleDispatch: jest.fn() }}
    >
      <ServiceContextProvider
        pageLang={pageData.metadata.language}
        service={service}
      >
        <RequestContextProvider
          bbcOrigin="https://www.test.bbc.co.uk"
          isAmp={isAmp}
          pageType={pageData.metadata.type}
          pathname={pageData.metadata.locators.assetUri}
          service={service}
          statusCode={200}
          showAdsBasedOnLocation={showAdsBasedOnLocation}
        >
          <EventTrackingContextProvider pageData={pageData}>
            <optimizelySDK.OptimizelyProvider
              optimizely={optimizely}
              isServerSide
            >
              <StoryPage service={service} pageData={pageData} />
            </optimizelySDK.OptimizelyProvider>
          </EventTrackingContextProvider>
        </RequestContextProvider>
      </ServiceContextProvider>
    </ToggleContext.Provider>
  </StaticRouter>
);

jest.mock('#containers/PageHandlers/withPageWrapper', () => Component => {
  const PageWrapperContainer = props => (
    <div id="PageWrapperContainer">
      <Component {...props} />
    </div>
  );

  return PageWrapperContainer;
});

jest.mock('#containers/PageHandlers/withLoading', () => Component => {
  const LoadingContainer = props => (
    <div id="LoadingContainer">
      <Component {...props} />
    </div>
  );

  return LoadingContainer;
});

jest.mock('#containers/PageHandlers/withError', () => Component => {
  const ErrorContainer = props => (
    <div id="ErrorContainer">
      <Component {...props} />
    </div>
  );

  return ErrorContainer;
});

jest.mock('#containers/PageHandlers/withData', () => Component => {
  const DataContainer = props => (
    <div id="DataContainer">
      <Component {...props} />
    </div>
  );

  return DataContainer;
});

jest.mock('#containers/PageHandlers/withContexts', () => Component => {
  const ContextsContainer = props => (
    <div id="ContextsContainer">
      <Component {...props} />
    </div>
  );

  return ContextsContainer;
});

const pageType = 'cpsAsset';

describe('Story Page', () => {
  const appEnv = process.env.SIMORGH_APP_ENV;
  beforeEach(() => {
    process.env.SIMORGH_ICHEF_BASE_URL = 'https://ichef.test.bbci.co.uk';
  });

  afterEach(() => {
    fetchMock.restore();
    delete process.env.SIMORGH_ICHEF_BASE_URL;
    process.env.SIMORGH_APP_ENV = appEnv;
  });

  describe('snapshots', () => {
    it('should match snapshot for STY', async () => {
      fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
      fetchMock.mock(
        'http://localhost/pidgin/mostread.json',
        pidginMostReadData,
      );
      fetchMock.mock(
        'http://localhost/pidgin/sty-secondary-column.json',
        pidginSecondaryColumnData,
      );

      const { pageData } = await getInitialData({
        path: '/some-cps-sty-path',
        service: 'pidgin',
        pageType,
      });

      const { container } = render(
        <Page pageData={pageData} service="pidgin" />,
      );

      expect(container).toMatchSnapshot();
    });
  });

  it('should only render firstPublished timestamp for Igbo when lastPublished is less than 1 min later', async () => {
    fetchMock.mock('http://localhost/some-cps-sty-path.json', igboPageData);
    fetchMock.mock('http://localhost/igbo/mostread.json', igboMostReadData);
    fetchMock.mock(
      'http://localhost/igbo/sty-secondary-column.json',
      igboSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'igbo',
      pageType,
    });

    const { getByText } = render(<Page pageData={pageData} service="igbo" />);
    expect(getByText('23 Ọktọba 2019')).toBeInTheDocument();
  });

  it('should not show the pop-out timestamp when allowDateStamp is false', async () => {
    fetchMock.mock('http://localhost/some-cps-sty-path.json', igboPageData);
    fetchMock.mock('http://localhost/igbo/mostread.json', igboMostReadData);
    fetchMock.mock(
      'http://localhost/igbo/sty-secondary-column.json',
      igboSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'igbo',
      pageType,
    });

    const pageDataWithHiddenTimestamp = assocPath(
      ['metadata', 'options', 'allowDateStamp'],
      false,
      pageData,
    );

    const { asFragment } = render(
      <Page pageData={pageDataWithHiddenTimestamp} service="pidgin" />,
    );

    expect(document.querySelector('main time')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly when the secondary column data is not available', async () => {
    fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock('http://localhost/pidgin/sty-secondary-column.json', {});

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { container } = render(<Page pageData={pageData} service="pidgin" />);

    expect(container).toMatchSnapshot();
  });

  it('should render secondary column with lang attribute of `serviceLang` when a language override is present', async () => {
    fetchMock.mock(
      'http://localhost/some-cps-sty-path.json',
      ukrainianInRussianPageData,
    );
    fetchMock.mock(
      'http://localhost/ukrainian/sty-secondary-column.json',
      ukrainianSecondaryColumnData,
    );
    fetchMock.mock(
      'http://localhost/ukrainian/mostread.json',
      ukrainianMostReadData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'ukrainian',
      pageType,
    });

    render(<Page pageData={pageData} service="ukrainian" />);

    const secondaryColumn = document.querySelector(
      'div[class*="SecondaryColumn"]',
    );

    expect(secondaryColumn).toHaveAttribute('lang', 'uk');
  });

  it.each`
    showAdsBasedOnLocation | showAdsBasedOnLocationExpectation
    ${true}                | ${'permitted to be shown'}
    ${true}                | ${'permitted to be shown'}
    ${false}               | ${'not permitted to be shown'}
    ${false}               | ${'not permitted to be shown'}
  `(
    'should not render ads when the ads toggle is disabled and is in a location where ads are $showAdsBasedOnLocationExpectation',
    async ({ showAdsBasedOnLocation }) => {
      const toggles = {
        ads: {
          enabled: false,
        },
      };

      fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
      fetchMock.mock(
        'http://localhost/pidgin/mostread.json',
        pidginMostReadData,
      );
      fetchMock.mock(
        'http://localhost/pidgin/sty-secondary-column.json',
        pidginSecondaryColumnData,
      );

      const { pageData } = await getInitialData({
        path: '/some-cps-sty-path',
        service: 'pidgin',
        pageType,
      });

      const { queryByTestId } = render(
        <Page
          pageData={pageData}
          service="pidgin"
          toggles={toggles}
          showAdsBasedOnLocation={showAdsBasedOnLocation}
        />,
      );

      const storyPageAds = queryByTestId('sty-ads');
      expect(storyPageAds).not.toBeInTheDocument();
      const adBootstrap = queryByTestId('adBootstrap');
      expect(adBootstrap).not.toBeInTheDocument();
    },
  );

  it('should not render ads when the ads are not permitted for asset, ads are enabled and location permits ads', async () => {
    const toggles = {
      ads: {
        enabled: true,
      },
    };
    const pidginPageDataDisallowAdvertising = deepClone(pidginPageData);
    pidginPageDataDisallowAdvertising.metadata.options.allowAdvertising = false;

    fetchMock.mock(
      'http://localhost/some-cps-sty-path.json',
      pidginPageDataDisallowAdvertising,
    );
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { queryByTestId } = render(
      <Page
        pageData={pageData}
        service="pidgin"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const storyPageAds = queryByTestId('sty-ads');
    expect(storyPageAds).not.toBeInTheDocument();
    const adBootstrap = queryByTestId('adBootstrap');
    expect(adBootstrap).not.toBeInTheDocument();
  });

  it('should not render ads when the ads toggle is enabled and is in a location where ads are not permitted to be shown', async () => {
    const toggles = {
      ads: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { queryByTestId } = render(
      <Page
        pageData={pageData}
        service="pidgin"
        toggles={toggles}
        showAdsBasedOnLocation={false}
      />,
    );

    const storyPageAds = queryByTestId('sty-ads');
    expect(storyPageAds).not.toBeInTheDocument();
    const adBootstrap = queryByTestId('adBootstrap');
    expect(adBootstrap).not.toBeInTheDocument();
  });

  it('should render ads when the ads toggle is enabled', async () => {
    const toggles = {
      ads: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { getByTestId, getAllByTestId } = render(
      <Page
        pageData={pageData}
        service="pidgin"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const storyPageAds = getAllByTestId('sty-ads');
    // render ads container twice for leaderboard and mpu
    expect(storyPageAds).toHaveLength(2);
    const adBootstrap = getByTestId('adBootstrap');
    expect(adBootstrap).toBeInTheDocument();
  });

  it(`should configure canonical ad bootstrap with campaign where 'adCampaignKeyword' is in metadata`, async () => {
    process.env.SIMORGH_APP_ENV = 'test';
    const toggles = {
      ads: {
        enabled: true,
      },
    };

    const pidginPageDataAdCampaign = deepClone(pidginPageData);
    pidginPageDataAdCampaign.metadata.adCampaignKeyword = 'royalwedding';

    fetchMock.mock(
      'http://localhost/some-cps-sty-path.json',
      pidginPageDataAdCampaign,
    );
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'gahuza',
      pageType,
    });

    const { getByTestId } = render(
      <Page
        pageData={pageData}
        service="gahuza"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const adBootstrap = getByTestId('adBootstrap');
    expect(adBootstrap).toBeInTheDocument();
    expect(adBootstrap).toHaveAttribute('data-adcampaign', 'royalwedding');
  });

  it('should configure canonical ad bootstrap where campaign is not in metadata', async () => {
    process.env.SIMORGH_APP_ENV = 'test';
    const toggles = {
      ads: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { getByTestId } = render(
      <Page
        pageData={pageData}
        service="pidgin"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const adBootstrap = getByTestId('adBootstrap');
    expect(adBootstrap).toBeInTheDocument();
    expect(adBootstrap).not.toHaveAttribute('data-adcampaign');
  });

  it('should not render canonical ad bootstrap on amp', async () => {
    process.env.SIMORGH_APP_ENV = 'test';
    const toggles = {
      ads: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', pidginPageData);
    fetchMock.mock('http://localhost/pidgin/mostread.json', pidginMostReadData);
    fetchMock.mock(
      'http://localhost/pidgin/sty-secondary-column.json',
      pidginSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'pidgin',
      pageType,
    });

    const { queryByTestId } = render(
      <Page
        pageData={pageData}
        service="pidgin"
        toggles={toggles}
        showAdsBasedOnLocation
        isAmp
      />,
    );

    const adBootstrap = queryByTestId('adBootstrap');
    expect(adBootstrap).not.toBeInTheDocument();
  });

  it('should render the inline podcast promo component on russian pages with a paragraph of 940 characters and after 8th paragraph', async () => {
    process.env.SIMORGH_APP_ENV = 'test';
    const toggles = {
      podcastPromo: {
        enabled: true,
      },
    };

    fetchMock.mock(
      'http://localhost/some-cps-sty-path.json',
      russianPageDataWithInlinePromo,
    );
    fetchMock.mock(
      'http://localhost/russian/mostread.json',
      russianMostReadData,
    );
    fetchMock.mock(
      'http://localhost/russian/sty-secondary-column.json',
      russianSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'russian',
      pageType,
    });

    const { getAllByRole } = render(
      <Page
        pageData={pageData}
        service="russian"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const regions = getAllByRole('region');
    expect(regions.length).toEqual(4);

    const fourthRegion = regions[0];
    expect(fourthRegion.getAttribute('aria-labelledby')).toEqual(
      'podcast-promo',
    );
  });

  it('should not render the inline podcast promo component on russian pages with paragraphs of less than 940 characters', async () => {
    process.env.SIMORGH_APP_ENV = 'test';
    const toggles = {
      podcastPromo: {
        enabled: true,
      },
    };

    fetchMock.mock(
      'http://localhost/some-cps-sty-path.json',
      russianPageDataWithoutInlinePromo,
    );
    fetchMock.mock(
      'http://localhost/russian/mostread.json',
      russianMostReadData,
    );
    fetchMock.mock(
      'http://localhost/russian/sty-secondary-column.json',
      russianSecondaryColumnData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'russian',
      pageType,
    });

    const { getAllByRole } = render(
      <Page
        pageData={pageData}
        service="russian"
        toggles={toggles}
        showAdsBasedOnLocation
      />,
    );

    const regions = getAllByRole('region');
    expect(regions.length).toEqual(3);

    regions.forEach(region =>
      expect(region.getAttribute('aria-labelledby')).not.toEqual(
        'podcast-promo',
      ),
    );
  });

  it('should have four recommendations each when recommendations are in the data', async () => {
    const toggles = {
      cpsRecommendations: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', hindiPageData);
    fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
    fetchMock.mock(
      'http://localhost/hindi/international-60490858/recommendations.json',
      hindiRecommendationsData,
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'hindi',
      pageType,
    });

    const { getAllByRole } = render(
      <Page pageData={pageData} service="hindi" toggles={toggles} />,
    );

    const RecommendationsRegions = getAllByRole('region').filter(
      item =>
        item.getAttribute('aria-labelledby') === 'recommendations-heading',
    );
    expect(RecommendationsRegions).toHaveLength(1);

    const firstPart = RecommendationsRegions[0];

    expect(firstPart.getAttribute('aria-labelledby')).toEqual(
      'recommendations-heading',
    );

    const firstPartRecommendations =
      firstPart.firstChild.childNodes[2].children;

    expect(firstPartRecommendations).toHaveLength(4);
  });

  it('should not show recommendations each when no recommendations are in the data', async () => {
    const toggles = {
      cpsRecommendations: {
        enabled: true,
      },
    };

    fetchMock.mock('http://localhost/some-cps-sty-path.json', hindiPageData);
    fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
    fetchMock.mock(
      'http://localhost/hindi/international-60490858/recommendations.json',
      [],
    );

    const { pageData } = await getInitialData({
      path: '/some-cps-sty-path',
      service: 'hindi',
      pageType,
    });

    const { getAllByRole } = render(
      <Page pageData={pageData} service="hindi" toggles={toggles} />,
    );

    const RecommendationsRegions = getAllByRole('region').filter(
      item =>
        item.getAttribute('aria-labelledby') === 'recommendations-heading',
    );
    expect(RecommendationsRegions).toHaveLength(0);
  });

  // Need to mock the optimizely key when an implmentation is decided, tests will fail until it is mocked.
  describe('optimizelyExperiment', () => {
    describe('003_hindi_experiment_feature', () => {
      describe.skip('variation_1', () => {
        beforeEach(() => {
          // Mocked the implmentation of OptimizelyExperiment as we need to set the variation.
          optimizelyExperimentSpy.mockImplementation(props => {
            const { children } = props;

            const variation = 'variation_1';

            if (children != null && typeof children === 'function') {
              return <>{children(variation, true, false)}</>;
            }

            let match = null;

            React.Children.forEach(children, child => {
              if (match || !React.isValidElement(child)) {
                return;
              }

              if (child.props.variation) {
                if (variation === child.props.variation) {
                  match = child;
                }
              } else if (child.props.default) {
                match = child;
              }
            });
            return React.cloneElement(match, { variation: 'testingCode' });
          });
        });

        afterAll(() => {
          jest.restoreAllMocks();
        });

        it('should have two parts with two recommendations each when four recommendations are in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            hindiRecommendationsData,
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(2);

          const firstPart = RecommendationsRegions[0];
          expect(firstPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const firstPartRecommendations =
            firstPart.firstChild.childNodes[2].children;
          expect(firstPartRecommendations).toHaveLength(2);

          const secondPart = RecommendationsRegions[1];
          expect(secondPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const secondPartRecommendations =
            secondPart.firstChild.childNodes[2].children;
          expect(secondPartRecommendations).toHaveLength(2);
        });

        it('should have two parts with two recommendations each when more than four recommendations in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          const FIVE_RECOMMENDATIONS_FIXTURE = [
            ...hindiRecommendationsData,
            {
              headlines: {
                shortHeadline:
                  'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
                headline:
                  'कोविड-19 महामारीः तो सबसे ज़्यादा मौतों की वजह वायरस नहीं होगा',
              },
              locators: {
                assetUri: '/hindi/vert-fut-53035307',
                cpsUrn: 'urn:bbc:content:assetUri:hindi/vert-fut-53035307',
                curie:
                  'http://www.bbc.co.uk/asset/d581a169-118c-ac47-a910-7268cfb693de',
                assetId: '53035307',
              },
              summary:
                'कोरोना वायरस की वजह से भुखमरी के कगार पर पहुंच सकती है दुनिया.',
              timestamp: 1593077447000,
              language: 'hi',
              byline: {
                name: 'ज़ारिया गोर्वेट',
                title: ' बीबीसी फ्यूचर',
                persons: [
                  {
                    name: 'Dan Egan',
                    function: '',
                  },
                ],
              },
              passport: {
                category: {
                  categoryId:
                    'http://www.bbc.co.uk/ontologies/applicationlogic-news/Feature',
                  categoryName: 'Feature',
                },
                campaigns: [
                  {
                    campaignId: '5a988e3739461b000e9dabfa',
                    campaignName: 'WS - Give me perspective',
                  },
                ],
                taggings: [],
              },
              indexImage: {
                id: '113093139',
                subType: 'index',
                href: 'http://c.files.bbci.co.uk/16BD3/production/_113093139_694cda5f-d84d-4d58-8459-62f6b47cea3c.jpg',
                path: '/cpsprodpb/16BD3/production/_113093139_694cda5f-d84d-4d58-8459-62f6b47cea3c.jpg',
                height: 549,
                width: 976,
                altText: 'गोद में बच्चे को लिए मां',
                copyrightHolder: 'EPA',
                type: 'image',
              },
              id: 'urn:bbc:ares::asset:hindi/vert-fut-53035307',
              type: 'cps',
            },
          ];

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            FIVE_RECOMMENDATIONS_FIXTURE,
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(2);

          const firstPart = RecommendationsRegions[0];
          expect(firstPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const firstPartRecommendations =
            firstPart.firstChild.childNodes[2].children;
          expect(firstPartRecommendations).toHaveLength(2);

          const secondPart = RecommendationsRegions[1];
          expect(secondPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const secondPartRecommendations =
            secondPart.firstChild.childNodes[2].children;
          expect(secondPartRecommendations).toHaveLength(2);
        });

        it('should have two parts, firstPart with two recommendations and secondPart with one recommendation when there are three recommendations in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            hindiRecommendationsData.slice(0, 3),
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(2);

          const firstPart = RecommendationsRegions[0];
          expect(firstPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const firstPartRecommendations =
            firstPart.firstChild.childNodes[2].children;
          expect(firstPartRecommendations).toHaveLength(2);

          const secondPart = RecommendationsRegions[1];
          expect(secondPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const secondPartRecommendations =
            secondPart.firstChild.childNodes[2].children;
          expect(secondPartRecommendations).toHaveLength(1);
        });

        it('should have one part with two recommendations when only two recommendations are in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            hindiRecommendationsData.slice(0, 2),
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );
          expect(RecommendationsRegions).toHaveLength(1);

          const firstPart = RecommendationsRegions[0];
          expect(firstPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const firstPartRecommendations =
            firstPart.firstChild.childNodes[2].children;

          expect(firstPartRecommendations).toHaveLength(2);
        });

        it('should have one part with one recommendation when only a single recommendation in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            hindiRecommendationsData.slice(0, 1),
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );

          const firstPart = RecommendationsRegions[0];

          expect(RecommendationsRegions).toHaveLength(1);

          expect(firstPart.getAttribute('aria-labelledby')).toEqual(
            'recommendations-heading',
          );

          const firstPartRecommendations =
            firstPart.firstChild.childNodes[2].children;

          expect(firstPartRecommendations).toHaveLength(1);
        });

        it('should have no recommendations-heading when no recommendations are in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            [],
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );

          expect(RecommendationsRegions).toHaveLength(0);
        });

        it('should have no recommendations-heading when recommendations are invalid data in the data', async () => {
          const toggles = {
            cpsRecommendations: {
              enabled: true,
            },
          };

          fetchMock.mock(
            'http://localhost/some-cps-sty-path.json',
            hindiPageData,
          );
          fetchMock.mock('http://localhost/hindi/mostread.json', hindiMostRead);
          fetchMock.mock(
            'http://localhost/hindi/international-60490858/recommendations.json',
            {},
          );

          const { pageData } = await getInitialData({
            path: '/some-cps-sty-path',
            service: 'hindi',
            pageType,
          });

          const { getAllByRole } = render(
            <Page pageData={pageData} service="hindi" toggles={toggles} />,
          );

          const RecommendationsRegions = getAllByRole('region').filter(
            item =>
              item.getAttribute('aria-labelledby') ===
              'recommendations-heading',
          );

          expect(RecommendationsRegions).toHaveLength(0);
        });

        describe('Event Tracking', () => {
          beforeEach(() => {
            jest.useFakeTimers();
            jest.resetModules();
          });

          afterEach(() => {
            jest.useRealTimers();
            jest.clearAllMocks();
          });

          it('should send one view event to ATI and Optimizely when either block is viewed', async () => {
            const toggles = {
              cpsRecommendations: {
                enabled: true,
              },
              eventTracking: {
                enabled: true,
              },
            };

            fetchMock.mock(
              'http://localhost/some-cps-sty-path.json',
              hindiPageData,
            );
            fetchMock.mock(
              'http://localhost/hindi/mostread.json',
              hindiMostRead,
            );
            fetchMock.mock(
              'http://localhost/hindi/international-60490858/recommendations.json',
              hindiRecommendationsData,
            );

            const { pageData } = await getInitialData({
              path: '/some-cps-sty-path',
              service: 'hindi',
              pageType,
            });

            render(
              <PageWithContext
                pageData={pageData}
                service="hindi"
                toggles={toggles}
              />,
            );

            jest.runOnlyPendingTimers();
            await waitFor(
              () => {
                const wsojCalls = sendEventBeacon.mock.calls.filter(
                  ([{ componentName }]) => componentName === 'wsoj',
                );
                expect(wsojCalls.length).toBe(1);
                expect(optimizely.track).toHaveBeenCalledTimes(1);
              },
              { timeout: 2000 },
            );
          });

          it('should send one view event to ATI and Optimizely when there is only one block on the page and it is viewed', async () => {
            const toggles = {
              cpsRecommendations: {
                enabled: true,
              },
              eventTracking: {
                enabled: true,
              },
            };

            fetchMock.mock(
              'http://localhost/some-cps-sty-path.json',
              hindiPageData,
            );
            fetchMock.mock(
              'http://localhost/hindi/mostread.json',
              hindiMostRead,
            );
            fetchMock.mock(
              'http://localhost/hindi/international-60490858/recommendations.json',
              hindiRecommendationsData.slice(0, 2),
            );

            const { pageData } = await getInitialData({
              path: '/some-cps-sty-path',
              service: 'hindi',
              pageType,
            });

            render(
              <PageWithContext
                pageData={pageData}
                service="hindi"
                toggles={toggles}
              />,
            );

            jest.runOnlyPendingTimers();
            await waitFor(
              () => {
                const wsojCalls = sendEventBeacon.mock.calls.filter(
                  ([{ componentName }]) => componentName === 'wsoj',
                );
                expect(wsojCalls.length).toBe(1);
                expect(optimizely.track).toHaveBeenCalledTimes(1);
              },
              { timeout: 2000 },
            );
          });

          it('should not send view events to ATI and Optimizely when there are no recommendations on the page', async () => {
            const toggles = {
              cpsRecommendations: {
                enabled: true,
              },
              eventTracking: {
                enabled: true,
              },
            };

            fetchMock.mock(
              'http://localhost/some-cps-sty-path.json',
              hindiPageData,
            );
            fetchMock.mock(
              'http://localhost/hindi/mostread.json',
              hindiMostRead,
            );

            const { pageData } = await getInitialData({
              path: '/some-cps-sty-path',
              service: 'hindi',
              pageType,
            });

            render(
              <PageWithContext
                pageData={pageData}
                service="hindi"
                toggles={toggles}
              />,
            );

            jest.runOnlyPendingTimers();
            await waitFor(
              () => {
                const wsojCalls = sendEventBeacon.mock.calls.filter(
                  ([{ componentName }]) => componentName === 'wsoj',
                );
                expect(wsojCalls.length).toBe(0);
                expect(optimizely.track).toHaveBeenCalledTimes(0);
              },
              { timeout: 2000 },
            );
          });
        });
      });
    });
  });
});
