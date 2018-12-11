import * as React from 'react';
import './app.scss';
import {AppRoot} from './components/app-root';

export interface AppProps {
  //
}

export class App extends React.PureComponent<AppProps, {}> {

  constructor(props: any) {
    super(props);
  }

  public render() {
    return <AppRoot />;
  }
}
