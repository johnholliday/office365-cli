import commands from '../../commands';
import Command, { CommandOption, CommandValidate, CommandError } from '../../../../Command';
import * as sinon from 'sinon';
import appInsights from '../../../../appInsights';
import auth, { Site } from '../../SpoAuth';
const command: Command = require('./page-section-add');
import * as assert from 'assert';
import * as request from 'request-promise-native';
import Utils from '../../../../Utils';

describe(commands.PAGE_SECTION_ADD, () => {
  let vorpal: Vorpal;
  let log: string[];
  let cmdInstance: any;
  let trackEvent: any;
  let telemetry: any;

  before(() => {
    sinon.stub(auth, 'restoreAuth').callsFake(() => Promise.resolve());
    sinon.stub(auth, 'getAccessToken').callsFake(() => {
      return Promise.resolve('ABC');
    });
    sinon
      .stub(command as any, 'getRequestDigestForSite')
      .callsFake(() => Promise.resolve({ FormDigestValue: 'ABC' }));
    trackEvent = sinon.stub(appInsights, 'trackEvent').callsFake((t) => {
      telemetry = t;
    });
  });

  beforeEach(() => {
    vorpal = require('../../../../vorpal-init');
    log = [];
    cmdInstance = {
      log: (msg: string) => {
        log.push(msg);
      }
    };
    auth.site = new Site();
    telemetry = null;
  });

  afterEach(() => {
    Utils.restore([vorpal.find, request.post, request.get]);
  });

  after(() => {
    Utils.restore([
      appInsights.trackEvent,
      auth.getAccessToken,
      auth.restoreAuth,
      (command as any).getRequestDigestForSite
    ]);
  });

  it('has correct name', () => {
    assert.equal(command.name.startsWith(commands.PAGE_SECTION_ADD), true);
  });

  it('has a description', () => {
    assert.notEqual(command.description, null);
  });

  it('calls telemetry', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {} }, () => {
      try {
        assert(trackEvent.called);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('logs correct telemetry event', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {} }, () => {
      try {
        assert.equal(telemetry.name, commands.PAGE_SECTION_ADD);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('aborts when not connected to a SharePoint site', (done) => {
    auth.site = new Site();
    auth.site.connected = false;
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(
          JSON.stringify(err),
          JSON.stringify(new CommandError('Log in to a SharePoint Online site first'))
        );
        done();
      } catch (e) {
        done(e);
      }
    });
  });


  it('adds a section to the modern page above the existing section', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url.indexOf(`/_api/web/getfilebyserverrelativeurl('/sites/newsletter/SitePages/home.aspx')`) > -1) {
        return Promise.resolve({
          "ListItemAllFields": {
            "CommentsDisabled": false,
            "FileSystemObjectType": 0,
            "Id": 1,
            "ServerRedirectedEmbedUri": null,
            "ServerRedirectedEmbedUrl": "",
            "ContentTypeId": "0x0101009D1CB255DA76424F860D91F20E6C41180062FDF2882AB3F745ACB63105A3C623C9",
            "FileLeafRef": "Home.aspx",
            "ComplianceAssetId": null,
            "WikiField": null,
            "Title": "Home",
            "ClientSideApplicationId": "b6917cb1-93a0-4b97-a84d-7cf49975d4ec",
            "PageLayoutType": "Home",
            "CanvasContent1": "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;0.5,&quot;sectionFactor&quot;&#58;8&#125;,&quot;webPartId&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;instanceId&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;title&quot;&#58;&quot;Minified HelloWorld&quot;,&quot;description&quot;&#58;&quot;HelloWorld description&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;description&quot;&#58;&quot;HelloWorld&quot;&#125;&#125;\"><div data-sp-componentid=\"\">34b617b3-5f5d-4682-98ed-fc6908dc0f4c</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;instanceId&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;title&quot;&#58;&quot;News&quot;,&quot;description&quot;&#58;&quot;Display recent news.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&quot;title&quot;&#58;&quot;News&quot;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&quot;baseUrl&quot;&#58;&quot;https&#58;//contoso.sharepoint.com/sites/team-a&quot;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;layoutId&quot;&#58;&quot;FeaturedNews&quot;,&quot;dataProviderId&quot;&#58;&quot;viewCounts&quot;,&quot;emptyStateHelpItemsCount&quot;&#58;1,&quot;newsDataSourceProp&quot;&#58;2,&quot;newsSiteList&quot;&#58;[],&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;&#125;\"><div data-sp-componentid=\"\">8c88f208-6c77-4bdb-86a0-0c47b4316588</div><div data-sp-htmlproperties=\"\"><div data-sp-prop-name=\"title\" data-sp-searchableplaintext=\"true\">News</div><a data-sp-prop-name=\"baseUrl\" href=\"/sites/team-a\"></a></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;2,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;instanceId&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;title&quot;&#58;&quot;Quick links&quot;,&quot;description&quot;&#58;&quot;Add links to important documents and pages.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&quot;title&quot;&#58;&quot;Quick links&quot;,&quot;items[0].title&quot;&#58;&quot;Learn about a team site&quot;,&quot;items[1].title&quot;&#58;&quot;Learn how to add a page&quot;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&quot;baseUrl&quot;&#58;&quot;https&#58;//contoso.sharepoint.com/sites/team-a&quot;,&quot;items[0].url&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827918&quot;,&quot;items[1].url&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827919&quot;,&quot;items[0].renderInfo.linkUrl&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827918&quot;,&quot;items[1].renderInfo.linkUrl&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827919&quot;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;items&quot;&#58;[&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827918&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;1&#125;,&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827919&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;2&#125;],&quot;isMigrated&quot;&#58;true,&quot;layoutId&quot;&#58;&quot;CompactCard&quot;,&quot;shouldShowThumbnail&quot;&#58;true,&quot;hideWebPartWhenEmpty&quot;&#58;true,&quot;dataProviderId&quot;&#58;&quot;QuickLinks&quot;,&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;&#125;\"><div data-sp-componentid=\"\">c70391ea-0b10-4ee9-b2b4-006d3fcad0cd</div><div data-sp-htmlproperties=\"\"><div data-sp-prop-name=\"title\" data-sp-searchableplaintext=\"true\">Quick links</div><div data-sp-prop-name=\"items[0].title\" data-sp-searchableplaintext=\"true\">Learn about a team site</div><div data-sp-prop-name=\"items[1].title\" data-sp-searchableplaintext=\"true\">Learn how to add a page</div><a data-sp-prop-name=\"baseUrl\" href=\"/sites/team-a\"></a><a data-sp-prop-name=\"items[0].url\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827918\"></a><a data-sp-prop-name=\"items[1].url\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827919\"></a><a data-sp-prop-name=\"items[0].renderInfo.linkUrl\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827918\"></a><a data-sp-prop-name=\"items[1].renderInfo.linkUrl\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827919\"></a></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;2,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;instanceId&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;title&quot;&#58;&quot;Site activity&quot;,&quot;description&quot;&#58;&quot;Show recent activities from your site.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;maxItems&quot;&#58;9&#125;&#125;\"><div data-sp-componentid=\"\">eb95c819-ab8f-4689-bd03-0c2d65d47b1f</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;2,&quot;sectionIndex&quot;&#58;2,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4&#125;,&quot;addedFromPersistedData&quot;&#58;true,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;instanceId&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;title&quot;&#58;&quot;Document library&quot;,&quot;description&quot;&#58;&quot;Add a document library.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;isDocumentLibrary&quot;&#58;true,&quot;showDefaultDocumentLibrary&quot;&#58;true,&quot;webpartHeightKey&quot;&#58;4,&quot;selectedListUrl&quot;&#58;&quot;&quot;,&quot;listTitle&quot;&#58;&quot;Documents&quot;&#125;&#125;\"><div data-sp-componentid=\"\">f92bf067-bc19-489e-a556-7fe95f508720</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;4,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;d933a0dd-9536-48a6-bd85-888b85ede7d0&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;3,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1&#125;,&quot;innerHTML&quot;&#58;&quot;&lt;p&gt;Lorem ipsum&lt;/p&gt;\\n\\n&lt;p&gt;Dolor samet&lt;/p&gt;\\n&quot;,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-rte=\"\"><p>Lorem ipsum</p>\n\n<p>Dolor samet</p>\n</div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;4,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;135f1d1a-2eb9-4655-a913-b9f23114b01f&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;4,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1&#125;,&quot;innerHTML&quot;&#58;&quot;&lt;p&gt;Lorem ipsum&lt;/p&gt;\\n&quot;,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-rte=\"\"><p>Lorem ipsum</p>\n</div></div></div>",
            "BannerImageUrl": {
              "Description": "/_layouts/15/images/sitepagethumbnail.png",
              "Url": "https://contoso.sharepoint.com/_layouts/15/images/sitepagethumbnail.png"
            },
            "Description": "Lorem ipsum Dolor samet Lorem ipsum",
            "PromotedState": null,
            "FirstPublishedDate": null,
            "LayoutWebpartsContent": null,
            "AuthorsId": null,
            "AuthorsStringId": null,
            "OriginalSourceUrl": null,
            "ID": 1,
            "Created": "2018-01-20T09:54:41",
            "AuthorId": 1073741823,
            "Modified": "2018-04-12T12:42:47",
            "EditorId": 12,
            "OData__CopySource": null,
            "CheckoutUserId": null,
            "OData__UIVersionString": "7.0",
            "GUID": "edaab907-e729-48dd-9e73-26487c0cf592"
          },
          "CheckInComment": "",
          "CheckOutType": 2,
          "ContentTag": "{E82A21D1-CA2C-4854-98F2-012AC0E7FA09},25,1",
          "CustomizedPageStatus": 1,
          "ETag": "\"{E82A21D1-CA2C-4854-98F2-012AC0E7FA09},25\"",
          "Exists": true,
          "IrmEnabled": false,
          "Length": "805",
          "Level": 1,
          "LinkingUri": null,
          "LinkingUrl": "",
          "MajorVersion": 7,
          "MinorVersion": 0,
          "Name": "home.aspx",
          "ServerRelativeUrl": "/sites/newsletter/SitePages/home.aspx",
          "TimeCreated": "2018-01-20T08:54:41Z",
          "TimeLastModified": "2018-04-12T10:42:46Z",
          "Title": "Home",
          "UIVersion": 3584,
          "UIVersionLabel": "7.0",
          "UniqueId": "e82a21d1-ca2c-4854-98f2-012ac0e7fa09"
        });
      }

      return Promise.reject('Invalid request');
    });

    let actual = '';
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf(`getfilebyserverrelativeurl('/sites/newsletter/sitepages/home.aspx')/ListItemAllFields`) > -1) {
        actual = opts.body.CanvasContent1;
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso.sharepoint.com/sites/newsletter';
    cmdInstance.action = command.action();
    cmdInstance.action({
      options:
      {
        debug: true,
        name: 'home.aspx',
        webUrl: 'https://contoso.sharepoint.com/sites/newsletter',
        sectionTemplate: 'OneColumn',
        order: 1
      }
    }, () => {
      try {
        assert.equal(actual, '<div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;displayMode&quot;&#58;2,&quot;position&quot;&#58;&#123;&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;1&#125;&#125;"></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;2&#125;,&quot;webPartId&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;HelloWorld description&quot;,&quot;id&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;instanceId&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;properties&quot;&#58;&#123;&quot;description&quot;&#58;&quot;HelloWorld&quot;&#125;,&quot;title&quot;&#58;&quot;Minified HelloWorld&quot;&#125;"><div data-sp-componentid>34b617b3-5f5d-4682-98ed-fc6908dc0f4c</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;2,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;2&#125;,&quot;webPartId&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Display recent news.&quot;,&quot;id&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;instanceId&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;properties&quot;&#58;&#123;&quot;layoutId&quot;&#58;&quot;FeaturedNews&quot;,&quot;dataProviderId&quot;&#58;&quot;viewCounts&quot;,&quot;emptyStateHelpItemsCount&quot;&#58;1,&quot;newsDataSourceProp&quot;&#58;2,&quot;newsSiteList&quot;&#58;[],&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;,&quot;title&quot;&#58;&quot;News&quot;&#125;"><div data-sp-componentid>8c88f208-6c77-4bdb-86a0-0c47b4316588</div><div data-sp-htmlproperties=""><div data-sp-prop-name="title" data-sp-searchableplaintext="true">News</div><a data-sp-prop-name="baseUrl" href="https://contoso.sharepoint.com/sites/team-a"></a></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4,&quot;sectionIndex&quot;&#58;2,&quot;zoneIndex&quot;&#58;2&#125;,&quot;webPartId&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Add links to important documents and pages.&quot;,&quot;id&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;instanceId&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;properties&quot;&#58;&#123;&quot;items&quot;&#58;[&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827918&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;1&#125;,&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827919&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;2&#125;],&quot;isMigrated&quot;&#58;true,&quot;layoutId&quot;&#58;&quot;CompactCard&quot;,&quot;shouldShowThumbnail&quot;&#58;true,&quot;hideWebPartWhenEmpty&quot;&#58;true,&quot;dataProviderId&quot;&#58;&quot;QuickLinks&quot;,&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;,&quot;title&quot;&#58;&quot;Quick links&quot;&#125;"><div data-sp-componentid>c70391ea-0b10-4ee9-b2b4-006d3fcad0cd</div><div data-sp-htmlproperties=""><div data-sp-prop-name="title" data-sp-searchableplaintext="true">Quick links</div><div data-sp-prop-name="items[0].title" data-sp-searchableplaintext="true">Learn about a team site</div><div data-sp-prop-name="items[1].title" data-sp-searchableplaintext="true">Learn how to add a page</div><a data-sp-prop-name="baseUrl" href="https://contoso.sharepoint.com/sites/team-a"></a><a data-sp-prop-name="items[0].url" href="https://go.microsoft.com/fwlink/p/?linkid=827918"></a><a data-sp-prop-name="items[1].url" href="https://go.microsoft.com/fwlink/p/?linkid=827919"></a><a data-sp-prop-name="items[0].renderInfo.linkUrl" href="https://go.microsoft.com/fwlink/p/?linkid=827918"></a><a data-sp-prop-name="items[1].renderInfo.linkUrl" href="https://go.microsoft.com/fwlink/p/?linkid=827919"></a></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;3&#125;,&quot;webPartId&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Show recent activities from your site.&quot;,&quot;id&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;instanceId&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;properties&quot;&#58;&#123;&quot;maxItems&quot;&#58;9&#125;,&quot;title&quot;&#58;&quot;Site activity&quot;&#125;"><div data-sp-componentid>eb95c819-ab8f-4689-bd03-0c2d65d47b1f</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4,&quot;sectionIndex&quot;&#58;2,&quot;zoneIndex&quot;&#58;3&#125;,&quot;webPartId&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Add a document library.&quot;,&quot;id&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;instanceId&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;properties&quot;&#58;&#123;&quot;isDocumentLibrary&quot;&#58;true,&quot;showDefaultDocumentLibrary&quot;&#58;true,&quot;webpartHeightKey&quot;&#58;4,&quot;selectedListUrl&quot;&#58;&quot;&quot;,&quot;listTitle&quot;&#58;&quot;Documents&quot;&#125;,&quot;title&quot;&#58;&quot;Document library&quot;&#125;"><div data-sp-componentid>f92bf067-bc19-489e-a556-7fe95f508720</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;4,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;id&quot;&#58;&quot;d933a0dd-9536-48a6-bd85-888b85ede7d0&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;4&#125;&#125;"><div data-sp-rte=""><p>Lorem ipsum</p><p>Dolor samet</p></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;4,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;id&quot;&#58;&quot;135f1d1a-2eb9-4655-a913-b9f23114b01f&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;5&#125;&#125;"><div data-sp-rte=""><p>Lorem ipsum</p></div></div></div></div>');

        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('adds a section to the modern page below the existing section', (done) => {
    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url.indexOf(`/_api/web/getfilebyserverrelativeurl('/sites/newsletter/SitePages/home.aspx')`) > -1) {
        return Promise.resolve({
          "ListItemAllFields": {
            "CommentsDisabled": false,
            "FileSystemObjectType": 0,
            "Id": 1,
            "ServerRedirectedEmbedUri": null,
            "ServerRedirectedEmbedUrl": "",
            "ContentTypeId": "0x0101009D1CB255DA76424F860D91F20E6C41180062FDF2882AB3F745ACB63105A3C623C9",
            "FileLeafRef": "Home.aspx",
            "ComplianceAssetId": null,
            "WikiField": null,
            "Title": "Home",
            "ClientSideApplicationId": "b6917cb1-93a0-4b97-a84d-7cf49975d4ec",
            "PageLayoutType": "Home",
            "CanvasContent1": "<div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;0.5,&quot;sectionFactor&quot;&#58;8&#125;,&quot;webPartId&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;instanceId&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;title&quot;&#58;&quot;Minified HelloWorld&quot;,&quot;description&quot;&#58;&quot;HelloWorld description&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;description&quot;&#58;&quot;HelloWorld&quot;&#125;&#125;\"><div data-sp-componentid=\"\">34b617b3-5f5d-4682-98ed-fc6908dc0f4c</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;instanceId&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;title&quot;&#58;&quot;News&quot;,&quot;description&quot;&#58;&quot;Display recent news.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&quot;title&quot;&#58;&quot;News&quot;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&quot;baseUrl&quot;&#58;&quot;https&#58;//contoso.sharepoint.com/sites/team-a&quot;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;layoutId&quot;&#58;&quot;FeaturedNews&quot;,&quot;dataProviderId&quot;&#58;&quot;viewCounts&quot;,&quot;emptyStateHelpItemsCount&quot;&#58;1,&quot;newsDataSourceProp&quot;&#58;2,&quot;newsSiteList&quot;&#58;[],&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;&#125;\"><div data-sp-componentid=\"\">8c88f208-6c77-4bdb-86a0-0c47b4316588</div><div data-sp-htmlproperties=\"\"><div data-sp-prop-name=\"title\" data-sp-searchableplaintext=\"true\">News</div><a data-sp-prop-name=\"baseUrl\" href=\"/sites/team-a\"></a></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;1,&quot;sectionIndex&quot;&#58;2,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;instanceId&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;title&quot;&#58;&quot;Quick links&quot;,&quot;description&quot;&#58;&quot;Add links to important documents and pages.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&quot;title&quot;&#58;&quot;Quick links&quot;,&quot;items[0].title&quot;&#58;&quot;Learn about a team site&quot;,&quot;items[1].title&quot;&#58;&quot;Learn how to add a page&quot;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&quot;baseUrl&quot;&#58;&quot;https&#58;//contoso.sharepoint.com/sites/team-a&quot;,&quot;items[0].url&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827918&quot;,&quot;items[1].url&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827919&quot;,&quot;items[0].renderInfo.linkUrl&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827918&quot;,&quot;items[1].renderInfo.linkUrl&quot;&#58;&quot;https&#58;//go.microsoft.com/fwlink/p/?linkid=827919&quot;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;items&quot;&#58;[&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827918&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;1&#125;,&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827919&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;2&#125;],&quot;isMigrated&quot;&#58;true,&quot;layoutId&quot;&#58;&quot;CompactCard&quot;,&quot;shouldShowThumbnail&quot;&#58;true,&quot;hideWebPartWhenEmpty&quot;&#58;true,&quot;dataProviderId&quot;&#58;&quot;QuickLinks&quot;,&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;&#125;\"><div data-sp-componentid=\"\">c70391ea-0b10-4ee9-b2b4-006d3fcad0cd</div><div data-sp-htmlproperties=\"\"><div data-sp-prop-name=\"title\" data-sp-searchableplaintext=\"true\">Quick links</div><div data-sp-prop-name=\"items[0].title\" data-sp-searchableplaintext=\"true\">Learn about a team site</div><div data-sp-prop-name=\"items[1].title\" data-sp-searchableplaintext=\"true\">Learn how to add a page</div><a data-sp-prop-name=\"baseUrl\" href=\"/sites/team-a\"></a><a data-sp-prop-name=\"items[0].url\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827918\"></a><a data-sp-prop-name=\"items[1].url\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827919\"></a><a data-sp-prop-name=\"items[0].renderInfo.linkUrl\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827918\"></a><a data-sp-prop-name=\"items[1].renderInfo.linkUrl\" href=\"https&#58;//go.microsoft.com/fwlink/p/?linkid=827919\"></a></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;2,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8&#125;,&quot;displayMode&quot;&#58;2,&quot;addedFromPersistedData&quot;&#58;true,&quot;id&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;instanceId&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;title&quot;&#58;&quot;Site activity&quot;,&quot;description&quot;&#58;&quot;Show recent activities from your site.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;maxItems&quot;&#58;9&#125;&#125;\"><div data-sp-componentid=\"\">eb95c819-ab8f-4689-bd03-0c2d65d47b1f</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;3,&quot;webPartId&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;2,&quot;sectionIndex&quot;&#58;2,&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4&#125;,&quot;addedFromPersistedData&quot;&#58;true,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;&#125;\"><div data-sp-webpart=\"\" data-sp-webpartdataversion=\"1.0\" data-sp-webpartdata=\"&#123;&quot;id&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;instanceId&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;title&quot;&#58;&quot;Document library&quot;,&quot;description&quot;&#58;&quot;Add a document library.&quot;,&quot;serverProcessedContent&quot;&#58;&#123;&quot;htmlStrings&quot;&#58;&#123;&#125;,&quot;searchablePlainTexts&quot;&#58;&#123;&#125;,&quot;imageSources&quot;&#58;&#123;&#125;,&quot;links&quot;&#58;&#123;&#125;&#125;,&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;properties&quot;&#58;&#123;&quot;isDocumentLibrary&quot;&#58;true,&quot;showDefaultDocumentLibrary&quot;&#58;true,&quot;webpartHeightKey&quot;&#58;4,&quot;selectedListUrl&quot;&#58;&quot;&quot;,&quot;listTitle&quot;&#58;&quot;Documents&quot;&#125;&#125;\"><div data-sp-componentid=\"\">f92bf067-bc19-489e-a556-7fe95f508720</div><div data-sp-htmlproperties=\"\"></div></div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;4,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;d933a0dd-9536-48a6-bd85-888b85ede7d0&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;3,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1&#125;,&quot;innerHTML&quot;&#58;&quot;&lt;p&gt;Lorem ipsum&lt;/p&gt;\\n\\n&lt;p&gt;Dolor samet&lt;/p&gt;\\n&quot;,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-rte=\"\"><p>Lorem ipsum</p>\n\n<p>Dolor samet</p>\n</div></div><div data-sp-canvascontrol=\"\" data-sp-canvasdataversion=\"1.0\" data-sp-controldata=\"&#123;&quot;controlType&quot;&#58;4,&quot;displayMode&quot;&#58;2,&quot;id&quot;&#58;&quot;135f1d1a-2eb9-4655-a913-b9f23114b01f&quot;,&quot;position&quot;&#58;&#123;&quot;zoneIndex&quot;&#58;4,&quot;sectionIndex&quot;&#58;1,&quot;controlIndex&quot;&#58;1&#125;,&quot;innerHTML&quot;&#58;&quot;&lt;p&gt;Lorem ipsum&lt;/p&gt;\\n&quot;,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;addedFromPersistedData&quot;&#58;true&#125;\"><div data-sp-rte=\"\"><p>Lorem ipsum</p>\n</div></div></div>",
            "BannerImageUrl": {
              "Description": "/_layouts/15/images/sitepagethumbnail.png",
              "Url": "https://contoso.sharepoint.com/_layouts/15/images/sitepagethumbnail.png"
            },
            "Description": "Lorem ipsum Dolor samet Lorem ipsum",
            "PromotedState": null,
            "FirstPublishedDate": null,
            "LayoutWebpartsContent": null,
            "AuthorsId": null,
            "AuthorsStringId": null,
            "OriginalSourceUrl": null,
            "ID": 1,
            "Created": "2018-01-20T09:54:41",
            "AuthorId": 1073741823,
            "Modified": "2018-04-12T12:42:47",
            "EditorId": 12,
            "OData__CopySource": null,
            "CheckoutUserId": null,
            "OData__UIVersionString": "7.0",
            "GUID": "edaab907-e729-48dd-9e73-26487c0cf592"
          },
          "CheckInComment": "",
          "CheckOutType": 2,
          "ContentTag": "{E82A21D1-CA2C-4854-98F2-012AC0E7FA09},25,1",
          "CustomizedPageStatus": 1,
          "ETag": "\"{E82A21D1-CA2C-4854-98F2-012AC0E7FA09},25\"",
          "Exists": true,
          "IrmEnabled": false,
          "Length": "805",
          "Level": 1,
          "LinkingUri": null,
          "LinkingUrl": "",
          "MajorVersion": 7,
          "MinorVersion": 0,
          "Name": "home.aspx",
          "ServerRelativeUrl": "/sites/newsletter/SitePages/home.aspx",
          "TimeCreated": "2018-01-20T08:54:41Z",
          "TimeLastModified": "2018-04-12T10:42:46Z",
          "Title": "Home",
          "UIVersion": 3584,
          "UIVersionLabel": "7.0",
          "UniqueId": "e82a21d1-ca2c-4854-98f2-012ac0e7fa09"
        });
      }

      return Promise.reject('Invalid request');
    });

    let actual = '';
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf(`getfilebyserverrelativeurl('/sites/newsletter/sitepages/home.aspx')/ListItemAllFields`) > -1) {
        actual = opts.body.CanvasContent1;
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso.sharepoint.com/sites/newsletter';
    cmdInstance.action = command.action();
    cmdInstance.action({
      options:
      {
        name: 'home',
        webUrl: 'https://contoso.sharepoint.com/sites/newsletter',
        sectionTemplate: 'OneColumn',
        order: 2
      }
    }, () => {
      try {
        assert.equal(actual, '<div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;1&#125;,&quot;webPartId&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;HelloWorld description&quot;,&quot;id&quot;&#58;&quot;34b617b3-5f5d-4682-98ed-fc6908dc0f4c&quot;,&quot;instanceId&quot;&#58;&quot;ede2ee65-157d-4523-b4ed-87b9b64374a6&quot;,&quot;properties&quot;&#58;&#123;&quot;description&quot;&#58;&quot;HelloWorld&quot;&#125;,&quot;title&quot;&#58;&quot;Minified HelloWorld&quot;&#125;"><div data-sp-componentid>34b617b3-5f5d-4682-98ed-fc6908dc0f4c</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;2,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;1&#125;,&quot;webPartId&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Display recent news.&quot;,&quot;id&quot;&#58;&quot;8c88f208-6c77-4bdb-86a0-0c47b4316588&quot;,&quot;instanceId&quot;&#58;&quot;3ede60d3-dc2c-438b-b5bf-cc40bb2351e5&quot;,&quot;properties&quot;&#58;&#123;&quot;layoutId&quot;&#58;&quot;FeaturedNews&quot;,&quot;dataProviderId&quot;&#58;&quot;viewCounts&quot;,&quot;emptyStateHelpItemsCount&quot;&#58;1,&quot;newsDataSourceProp&quot;&#58;2,&quot;newsSiteList&quot;&#58;[],&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;,&quot;title&quot;&#58;&quot;News&quot;&#125;"><div data-sp-componentid>8c88f208-6c77-4bdb-86a0-0c47b4316588</div><div data-sp-htmlproperties=""><div data-sp-prop-name="title" data-sp-searchableplaintext="true">News</div><a data-sp-prop-name="baseUrl" href="https://contoso.sharepoint.com/sites/team-a"></a></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4,&quot;sectionIndex&quot;&#58;2,&quot;zoneIndex&quot;&#58;1&#125;,&quot;webPartId&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Add links to important documents and pages.&quot;,&quot;id&quot;&#58;&quot;c70391ea-0b10-4ee9-b2b4-006d3fcad0cd&quot;,&quot;instanceId&quot;&#58;&quot;63da0d97-9db4-4847-a4bf-3ae019d4c6f2&quot;,&quot;properties&quot;&#58;&#123;&quot;items&quot;&#58;[&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827918&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;1&#125;,&#123;&quot;siteId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;webId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;uniqueId&quot;&#58;&quot;00000000-0000-0000-0000-000000000000&quot;,&quot;itemType&quot;&#58;2,&quot;fileExtension&quot;&#58;&quot;com/fwlink/p/?linkid=827919&quot;,&quot;progId&quot;&#58;&quot;&quot;,&quot;flags&quot;&#58;0,&quot;hasInvalidUrl&quot;&#58;false,&quot;renderInfo&quot;&#58;&#123;&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;compactImageInfo&quot;&#58;&#123;&quot;iconName&quot;&#58;&quot;Globe&quot;,&quot;color&quot;&#58;&quot;&quot;,&quot;imageUrl&quot;&#58;&quot;&quot;,&quot;forceIconSize&quot;&#58;true&#125;,&quot;backupImageUrl&quot;&#58;&quot;&quot;,&quot;iconUrl&quot;&#58;&quot;&quot;,&quot;accentColor&quot;&#58;&quot;&quot;,&quot;imageFit&quot;&#58;0,&quot;forceStandardImageSize&quot;&#58;false,&quot;isFetching&quot;&#58;false&#125;,&quot;id&quot;&#58;2&#125;],&quot;isMigrated&quot;&#58;true,&quot;layoutId&quot;&#58;&quot;CompactCard&quot;,&quot;shouldShowThumbnail&quot;&#58;true,&quot;hideWebPartWhenEmpty&quot;&#58;true,&quot;dataProviderId&quot;&#58;&quot;QuickLinks&quot;,&quot;webId&quot;&#58;&quot;4f118c69-66e0-497c-96ff-d7855ce0713d&quot;,&quot;siteId&quot;&#58;&quot;016bd1f4-ea50-46a4-809b-e97efb96399c&quot;&#125;,&quot;title&quot;&#58;&quot;Quick links&quot;&#125;"><div data-sp-componentid>c70391ea-0b10-4ee9-b2b4-006d3fcad0cd</div><div data-sp-htmlproperties=""><div data-sp-prop-name="title" data-sp-searchableplaintext="true">Quick links</div><div data-sp-prop-name="items[0].title" data-sp-searchableplaintext="true">Learn about a team site</div><div data-sp-prop-name="items[1].title" data-sp-searchableplaintext="true">Learn how to add a page</div><a data-sp-prop-name="baseUrl" href="https://contoso.sharepoint.com/sites/team-a"></a><a data-sp-prop-name="items[0].url" href="https://go.microsoft.com/fwlink/p/?linkid=827918"></a><a data-sp-prop-name="items[1].url" href="https://go.microsoft.com/fwlink/p/?linkid=827919"></a><a data-sp-prop-name="items[0].renderInfo.linkUrl" href="https://go.microsoft.com/fwlink/p/?linkid=827918"></a><a data-sp-prop-name="items[1].renderInfo.linkUrl" href="https://go.microsoft.com/fwlink/p/?linkid=827919"></a></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;displayMode&quot;&#58;2,&quot;position&quot;&#58;&#123;&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;2&#125;&#125;"></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;8,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;3&#125;,&quot;webPartId&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Show recent activities from your site.&quot;,&quot;id&quot;&#58;&quot;eb95c819-ab8f-4689-bd03-0c2d65d47b1f&quot;,&quot;instanceId&quot;&#58;&quot;4366ceff-b92b-4a12-905e-1dd2535f976d&quot;,&quot;properties&quot;&#58;&#123;&quot;maxItems&quot;&#58;9&#125;,&quot;title&quot;&#58;&quot;Site activity&quot;&#125;"><div data-sp-componentid>eb95c819-ab8f-4689-bd03-0c2d65d47b1f</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;3,&quot;id&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;4,&quot;sectionIndex&quot;&#58;2,&quot;zoneIndex&quot;&#58;3&#125;,&quot;webPartId&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;&#125;"><div data-sp-webpart="" data-sp-webpartdataversion="1.0" data-sp-webpartdata="&#123;&quot;dataVersion&quot;&#58;&quot;1.0&quot;,&quot;description&quot;&#58;&quot;Add a document library.&quot;,&quot;id&quot;&#58;&quot;f92bf067-bc19-489e-a556-7fe95f508720&quot;,&quot;instanceId&quot;&#58;&quot;456dfbc7-57be-4489-92ce-666224c4fcf1&quot;,&quot;properties&quot;&#58;&#123;&quot;isDocumentLibrary&quot;&#58;true,&quot;showDefaultDocumentLibrary&quot;&#58;true,&quot;webpartHeightKey&quot;&#58;4,&quot;selectedListUrl&quot;&#58;&quot;&quot;,&quot;listTitle&quot;&#58;&quot;Documents&quot;&#125;,&quot;title&quot;&#58;&quot;Document library&quot;&#125;"><div data-sp-componentid>f92bf067-bc19-489e-a556-7fe95f508720</div><div data-sp-htmlproperties=""></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;4,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;id&quot;&#58;&quot;d933a0dd-9536-48a6-bd85-888b85ede7d0&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;4&#125;&#125;"><div data-sp-rte=""><p>Lorem ipsum</p><p>Dolor samet</p></div></div></div><div data-sp-canvascontrol="" data-sp-canvasdataversion="1.0" data-sp-controldata="&#123;&quot;controlType&quot;&#58;4,&quot;editorType&quot;&#58;&quot;CKEditor&quot;,&quot;id&quot;&#58;&quot;135f1d1a-2eb9-4655-a913-b9f23114b01f&quot;,&quot;position&quot;&#58;&#123;&quot;controlIndex&quot;&#58;1,&quot;sectionFactor&quot;&#58;12,&quot;sectionIndex&quot;&#58;1,&quot;zoneIndex&quot;&#58;5&#125;&#125;"><div data-sp-rte=""><p>Lorem ipsum</p></div></div></div></div>');

        done();
      }
      catch (e) {
        done(e);
      }
    });
  });


  it('fails validation if order has invalid (negative) value', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        webUrl: 'https://contoso.sharepoint.com',
        order: -1,
        sectionTemplate: 'OneColumn'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if order has invalid (non number) value', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        webUrl: 'https://contoso.sharepoint.com',
        order: 'abc',
        sectionTemplate: 'OneColumn'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if sectionTemplate is not specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        webUrl: 'https://contoso.sharepoint.com',
        order: 'abc'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if sectionTemplate is not valid', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        webUrl: 'https://contoso.sharepoint.com',
        order: 'abc',
        sectionTemplate: 'OneColumnInvalid'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if webUrl is not specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        order: 'abc',
        sectionTemplate: 'OneColumnInvalid'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if webUrl is not valid', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        order: 1,
        sectionTemplate: 'OneColumn',
        webUrl: 'https://notasharepointurl.com'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if webUrl is not specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        name: 'page.aspx',
        order: 1,
        sectionTemplate: 'OneColumn'
      }
    });
    assert.notEqual(actual, true);
  });

  it('fails validation if name is not specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        order: 1,
        sectionTemplate: 'OneColumn',
        webUrl: 'https://contoso.sharepoint.com'
      }
    });
    assert.notEqual(actual, true);
  });

  it('passes validation if all the parameters are specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        order: 1,
        sectionTemplate: 'OneColumn',
        webUrl: 'https://contoso.sharepoint.com',
        name: 'Home.aspx'
      }
    });
    assert.equal(actual, true);
  });

  it('passes validation if order is not specified', () => {
    const actual = (command.validate() as CommandValidate)({
      options: {
        sectionTemplate: 'OneColumn',
        webUrl: 'https://contoso.sharepoint.com',
        name: 'Home.aspx'
      }
    });
    assert.equal(actual, true);
  });

  it('supports specifying page name', () => {
    const options = command.options() as CommandOption[];
    let containsOption = false;
    options.forEach((o) => {
      if (o.option.indexOf('--name') > -1) {
        containsOption = true;
      }
    });
    assert(containsOption);
  });

  it('supports specifying webUrl', () => {
    const options = command.options() as CommandOption[];
    let containsOption = false;
    options.forEach((o) => {
      if (o.option.indexOf('--webUrl') > -1) {
        containsOption = true;
      }
    });
    assert(containsOption);
  });

  it('supports specifying sectionTemplate', () => {
    const options = command.options() as CommandOption[];
    let containsOption = false;
    options.forEach((o) => {
      if (o.option.indexOf('--sectionTemplate') > -1) {
        containsOption = true;
      }
    });
    assert(containsOption);
  });

  it('supports specifying order', () => {
    const options = command.options() as CommandOption[];
    let containsOption = false;
    options.forEach((o) => {
      if (o.option.indexOf('--order') > -1) {
        containsOption = true;
      }
    });
    assert(containsOption);
  });


  it('has help referring to the right command', () => {
    const cmd: any = {
      log: (msg: string) => { },
      prompt: () => { },
      helpInformation: () => { }
    };
    const find = sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    assert(find.calledWith(commands.PAGE_SECTION_ADD));
  });

  it('has help with examples', () => {
    const _log: string[] = [];
    const cmd: any = {
      log: (msg: string) => {
        _log.push(msg);
      },
      prompt: () => { },
      helpInformation: () => { }
    };
    sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    let containsExamples: boolean = false;
    _log.forEach((l) => {
      if (l && l.indexOf('Examples:') > -1) {
        containsExamples = true;
      }
    });
    Utils.restore(vorpal.find);
    assert(containsExamples);
  });

  it('correctly handles lack of valid access token', (done) => {
    Utils.restore(auth.getAccessToken);
    sinon.stub(auth, 'getAccessToken').callsFake(() => {
      return Promise.reject(new Error('Error getting access token'));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action(
      { options: { debug: true, name: 'page.aspx', webUrl: 'https://contoso.sharepoint.com' } },
      (err?: any) => {
        try {
          assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Error getting access token')));
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });
});
