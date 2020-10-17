import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  useExchange,
  ReadyState,
  Channel,
  Exchange,
  TSubscription,
  useWebSocket,
} from '../.';

const App = () => {
  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: '1rem',
        height: '100vh',
        background: '#222',
        color: '#eee',
      }}
    >
      <WSTest />
      {/* <Deribit /> */}
    </div>
  );
};

type WSReq_Subscribe = {
  jsonrpc: '2.0';
  method: string;
  params: { channels: string[] };
};
type WSReq = WSReq_Subscribe;
type WSRes_Subscribe = {
  jsonrpc: '2.0';
  result: string[];
};
type WSRes = WSRes_Subscribe;

const WSTest = () => {
  const { readyState, sendMessage, lastMessage } = useWebSocket<WSReq, WSRes>(
    'wss://test.deribit.com/ws/api/v2',
    {
      shouldReconnect: true,
    }
  );

  React.useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage({
        jsonrpc: '2.0',
        method: 'public/subscribe',
        params: {
          channels: ['ticker.BTC-PERPETUAL.raw'],
        },
      })
        .then(res => {
          console.log('ws res', res);
        })
        .catch(error => {
          console.log('ws error', error);
        });
    }
  }, [readyState]);

  React.useEffect(() => {
    if (lastMessage != null) console.log('lastMessage', lastMessage);
  }, [readyState, lastMessage]);

  return <div>WS Test: {ReadyState[readyState]}</div>;
};

const SUBSCRIPTIONS: TSubscription[] = [
  {
    exchange: Exchange.DERIBIT,
    channel: Channel.TICKER,
    instrument: 'BTC-PERPETUAL',
  },
  {
    exchange: Exchange.DERIBIT,
    channel: Channel.TRADES,
    instrument: 'BTC-PERPETUAL',
    options: {
      limit: 20,
    },
  },
];

const Deribit = () => {
  const { readyState, lastPrice, trades } = useExchange(
    Exchange.DERIBIT,
    SUBSCRIPTIONS
  );
  return (
    <div>
      <div>Deribit [{ReadyState[readyState]}]</div>
      <div>Last price: {lastPrice}</div>
      {trades == null && <div>Loading trades...</div>}
      {trades != null &&
        trades.map((t, i) => (
          <div key={t.id}>
            {i + 1}: {JSON.stringify(t)}
          </div>
        ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
