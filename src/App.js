import logo from './logo.svg';
import './App.css';

import ReactGA from 'react-ga';

ReactGA.initialize("G-W2K3RBN9YT")
ReactGA.pageview(window.location.pathname + window.location.search);

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-W2K3RBN9YT"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments)}
        gtag('js', new Date());

        gtag('config', 'G-W2K3RBN9YT');
      </script>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
