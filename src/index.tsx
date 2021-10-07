import React from 'react';
import { render } from 'react-dom';

// Use the Contentful's App SDK to get access to the web app.
// Reference: https://ctfl.io/app-sdk
import {
  init,
  locations,
  AppExtensionSDK,
  SidebarExtensionSDK,
} from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';

import Config from './config';
import './index.css';
import CopyButton from './copyButton';

init((sdk) => {
  const root = document.getElementById('root');
  console.log('SDK => ', sdk);

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    render(<Config sdk={sdk as AppExtensionSDK} />, root);
  } else {
    render(<CopyButton sdk={sdk as SidebarExtensionSDK} />, root);
  }
});
