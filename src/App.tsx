/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import BoletoReader from './BoletoReader';

function App() {
  const [boletoCode, setBoletoCode] = useState<string>('');
  const [stop, setStop] = useState<boolean>(true);



  const __onDetectCode = (result: string, check: string[]) => {
    setBoletoCode(result);
  }

  return (
    <div className="App">
      <h1>Escanear Boleto</h1>
      <h3>{boletoCode ? boletoCode : 'Escanear boleto'}</h3>
      <BoletoReader onDetectCode={__onDetectCode} stop={stop}/>
      <button onClick={() => {
        console.log('parar')
        setStop(!stop)
      }}>{stop ? 'LER': 'PARAR LEITURA' }</button>
    </div>
  );
}

export default App;
