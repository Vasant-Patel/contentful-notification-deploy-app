import React, { useEffect, useState } from 'react';
import { EntrySys, SidebarExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-fcss/dist/styles.css';

import * as R from 'ramda';
import axios from 'axios';

// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import { Button, Flex, FormLabel, HelpText, Tag } from '@contentful/forma-36-react-components';
import { Entry } from 'contentful';

const deployHelpText =
  'Will deploy all notifications that are marked "Ready for production" : Yes to production environment.';
const notReadyForProdHelpText =
  'set "Ready for production": Yes to be able to deploy to production';

export default function CopyButton({ sdk }: { sdk: SidebarExtensionSDK }) {
  const [error, setError] = useState<string>();
  const [entry, setEntry] = useState<Entry<Object>>();
  const [isReadyForProduction, setIsReadyForProduction] = useState<boolean>(false);
  const [isLoadingTest, setLoadingTest] = useState<boolean>(false);
  const [isLoadingProd, setLoadingProd] = useState<boolean>(false);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const updateEntry = async () => {
    const;
    const e = (await sdk.space.getEntry(sdk.ids.entry)) as Entry<Object>;
    setEntry(e);
  };

  useEffect(() => {
    sdk.window.updateHeight(250);
    updateEntry();
    const sysListener = sdk.entry.onSysChanged((_) => {
      updateEntry();
    });

    const readyForProdListener = sdk.entry.fields.readyForProduction.onValueChanged((param) => {
      setIsReadyForProduction(param);
    });
    return () => {
      readyForProdListener();
      sysListener();
    };
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }
    sdk.notifier.error(error);
  }, [error]);

  const deployToProduction = async () => {
    const endpointUrl = (R.propOr(
      null,
      'productionDeployUrl',
      sdk.parameters.installation
    ) as unknown) as string;

    if (!endpointUrl) {
      setError('Please set valid config from Manage Apps => Configure');
      return;
    }

    axios
      .get(endpointUrl)
      .then((r) => r.data)
      .then((r) => {
        console.log('Response => ', r);
      })
      .catch((e) => {
        setError(e.response?.message || e.message || e);
      });
  };

  const onDeployTest = async () => {
    try {
      setLoadingTest(true);
      await delay(5000);
      const entry = await sdk.space.getEntry(sdk.ids.entry);
      await sdk.space.publishEntry(entry);
      // refresh entry
      updateEntry();
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setLoadingTest(false);
    }
  };

  const onDeployProd = async () => {
    try {
      setLoadingProd(true);
      // first publish and deploy to test
      await onDeployTest();
      await delay(3000);
      await deployToProduction();
      sdk.notifier.success('Notifications deployed to production!');
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setLoadingProd(false);
    }
  };

  const entrySys = entry && ((entry?.sys as unknown) as EntrySys);
  const isLatest =
    entrySys && entrySys?.publishedAt && entrySys?.updatedAt === entrySys?.publishedAt;
  const statusText = isLatest ? 'PUBLISHED' : 'CHANGED';
  const helpText = isReadyForProduction ? deployHelpText : notReadyForProdHelpText;
  return (
    <div>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <FormLabel htmlFor="name">STATUS</FormLabel>
        <Flex
          htmlTag="label"
          paddingTop="spacingXs"
          paddingBottom="spacingXs"
          alignItems="center"></Flex>
        <div>
          <Tag tagType={isLatest ? 'positive' : 'secondary'}>{statusText}</Tag>
        </div>
      </Flex>
      <div style={{ margin: 8 }} />
      <Button
        buttonType="positive"
        isFullWidth={true}
        onClick={onDeployTest}
        loading={isLoadingTest}>
        Deploy to test env
      </Button>
      <div style={{ margin: 12 }} />
      <Button
        buttonType="negative"
        isFullWidth={true}
        onClick={onDeployProd}
        loading={isLoadingProd}
        disabled={!isReadyForProduction}>
        Deploy to production env
      </Button>
      <div style={{ margin: 8, justifyContent: 'center' }}>
        <HelpText>{helpText}</HelpText>
      </div>
    </div>
  );
}
