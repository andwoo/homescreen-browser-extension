import * as React from 'react';
import SaveStorageEntry from '../../interfaces/options/OptionsEntry';
import * as Constants from '../../constants/StorageValues';
import * as Storage from '@browser-extension/utility-storage';
import TextInput from '../common/TextInput';

interface SubRedditOptionsState {
  subReddits: Array<string>;
}

const style = { paddingTop: '1.5rem', paddingBottom: '1.5rem' };

export default class SubRedditOptions extends React.Component<{}, SubRedditOptionsState> implements SaveStorageEntry {
  constructor(props) {
    super(props);
    this.state = {
      subReddits: Array(Constants.MaximumSubreddits).fill(''),
    };
  }

  componentDidMount = async (): Promise<void> => {
    await this.load();
  };

  load = async (): Promise<void> => {
    const subRedditStorage: Storage.StorageResponse = await Storage.LoadFromStorage(Constants.StorageKeySubReddits);
    if (subRedditStorage.success && subRedditStorage.data.length) {
      this.setState({
        subReddits: this.mergeArrays(this.state.subReddits, subRedditStorage.data as Array<string>),
      });
    }
  };

  save = async (): Promise<void> => {
    Storage.SaveToStorage(Constants.StorageKeySubReddits, this.state.subReddits);
  };

  mergeArrays = (source: Array<string>, mergeWith: Array<string>): Array<string> => {
    const merged: Array<string> = [...source];
    for (let i = 0; i < merged.length && i < mergeWith.length; ++i) {
      merged[i] = mergeWith[i];
    }
    return merged;
  };

  handleOnSubRedditChanged = (index: number, value: string): void => {
    const subReddits: Array<string> = this.state.subReddits;
    subReddits[index] = value;
    this.setState({
      subReddits: subReddits,
    });
  };

  render(): JSX.Element {
    const inputs: Array<React.ReactFragment> = this.state.subReddits.map((data: string, index: number) => {
      return (
        <TextInput
          label={`Subreddit ${index + 1}:`}
          value={data}
          onChange={(value: string): void => this.handleOnSubRedditChanged(index, value)}
          key={index}
        />
      );
    });

    return (
      <div className="panel is-success">
        <p className="panel-heading">SubReddits</p>
        <div className="section" style={style}>
          {inputs}
        </div>
      </div>
    );
  }
}
