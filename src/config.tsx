import React, { useEffect, useState } from 'react';
import { AppExtensionSDK } from 'contentful-ui-extensions-sdk';
import * as R from 'ramda';
// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import { TextField } from '@contentful/forma-36-react-components';

export default function Config({ sdk }: { sdk: AppExtensionSDK }) {
  const [productionDeployUrl, setProductionDeployUrl] = useState('');

  const configure = () => {
    return {
      // Parameters to be persisted as the app configuration.
      parameters: { productionDeployUrl },
      targetState: {
        EditorInterface: {
          notification: { sidebar: { position: 1 } },
        },
      },
    };
  };

  const onProductionDeployUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = e.target.value;
    setProductionDeployUrl(updatedValue);
  };

  useEffect(() => {
    sdk.app.onConfigure(configure);
  }, [productionDeployUrl]);

  useEffect(() => {
    // Ready to display our app (end loading state).
    sdk.app.getParameters().then((parameters) => {
      const productionDeployUrl = (R.propOr(
        '',
        'productionDeployUrl',
        parameters || {}
      ) as unknown) as string;
      setProductionDeployUrl(productionDeployUrl);
      sdk.app.setReady();
    });
  }, []);

  return (
    <div style={{ margin: 50 }}>
      <TextField
        name="urlInput"
        id="urlInput"
        value={productionDeployUrl}
        onChange={onProductionDeployUrlChange}
        labelText="Endpoint url for notification production deployment"></TextField>
      <div style={{ margin: 30 }} />
    </div>
  );
}
