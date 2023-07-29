import logo from './logo.svg';
import './App.css';
import ReactGA from 'react-ga';

ID = 'G-W2K3RBN9YT'
ReactGA.initialize(ID);
const link = "https://www.googletagmanager.com/gtag/js?id=" + ID

function App() {
  return (
    <div className="App">
      <script async src={link}></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments)}
        gtag('js', new Date());
        gtag('config', {ID});
      </script>

      <header className="App-header">
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
