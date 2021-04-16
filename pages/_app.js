import React from "react";
import App from "next/app";
import Head from "next/head";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "../components/clientRouter";

class MyApp extends App {
  render() {
    const { Component, pageProps, shopOrigin, templateID } = this.props;
    const config = { apiKey: API_KEY, shopOrigin };
    //console.log(Component, pageProps, shopOrigin);
    return (
      <React.Fragment>
        <Head>
          <title> HTML - Emailer </title>
          <meta charSet="utf-8" />
        </Head>
        <Provider config={config}>
          <ClientRouter />
          <AppProvider i18n={translations}>
            <Component
              shop_name={shopOrigin}
              {...pageProps}
              templateID={templateID}
            />
          </AppProvider>
        </Provider>
      </React.Fragment>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    shopOrigin: ctx.query.shop,
    templateID: ctx.query.templateID,
  };
};

export default MyApp;
