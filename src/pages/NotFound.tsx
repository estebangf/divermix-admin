import logo from '../logo.svg';


const NotFound: React.FC = () => {

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          PAGINA NO ENCONTRADA
        </p>
        <a
          className="App-link"
          href="/"
        >
          Home
        </a>
      </header>
    </div>
    )
}

export default NotFound;