/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import Quagga from 'quagga';
import './BoletoReader.css'

interface BoletoReaderProps {
    onDetectCode(barcode: string, check: string[]): void;
    stop?: boolean;
}

const BoletoReader: React.FC<BoletoReaderProps> = ({ onDetectCode, stop }) => {
  const calcularVerificadorMod10 = (codigoBarraSessao: string) => {
    if (codigoBarraSessao === "") {
        return "";
    }
    let digitoVerificador = 0;
    let numeroPar = true;
    for (let i = codigoBarraSessao.length; i > 0; i--) {
        const digito = parseInt(codigoBarraSessao[i - 1]);
        if (numeroPar) {
            digitoVerificador += Math.floor((digito * 2) / 10) + ((digito * 2) % 10);
        } else {
            digitoVerificador += digito;
        }
        numeroPar = !numeroPar;
    }
    digitoVerificador = digitoVerificador % 10;
    if (digitoVerificador !== 0) {
        digitoVerificador = 10 - digitoVerificador;
    }
    return String(digitoVerificador);
  }

  const LinhaDigitavelConsumo = (codigoBarra: string) => {
    let blocoUm = codigoBarra.slice(0, 11)
    let digitoVerificadorUm = calcularVerificadorMod10(blocoUm)
    let blocoDois = codigoBarra.slice(11, 22)
    let digitoVerificadorDois = calcularVerificadorMod10(blocoDois)
    let blocoTres = codigoBarra.slice(22, 33)
    let digitoVerificadorTres = calcularVerificadorMod10(blocoTres)
    let blocoQuatro = codigoBarra.slice(33, 44)
    let digitoVerificadorQuatro = calcularVerificadorMod10(blocoQuatro)

    return blocoUm
        + digitoVerificadorUm + " "
        + blocoDois
        + digitoVerificadorDois + " "
        + blocoTres
        + digitoVerificadorTres + " "
        + blocoQuatro
        + digitoVerificadorQuatro
  }

  const LinhaDigitavelBoleto = (codigoBarra: string) => {
    let codigoBanco = codigoBarra.slice(0, 3)
    let codigoMoeda = codigoBarra.slice(3, 4)
    let campoLivreBlocoUm = codigoBarra.slice(19, 24)
    let digitoVerificadorUm = calcularVerificadorMod10(`${codigoBanco}${codigoMoeda}${campoLivreBlocoUm}`)
    let campoLivreBlocoDois = codigoBarra.slice(24, 34)
    let digitoVerificadorDois = calcularVerificadorMod10(campoLivreBlocoDois)
    let campoLivreBlocoTres = codigoBarra.slice(34, 44)
    let digitoVerificadorTres = calcularVerificadorMod10(campoLivreBlocoTres)
    let digitoVerificadorQuatro = codigoBarra.slice(4, 5)
    let fatorVencimento = codigoBarra.slice(5, 9)
    let valor = codigoBarra.slice(9, 19)

    return codigoBanco
        + codigoMoeda
        + campoLivreBlocoUm
        + digitoVerificadorUm + " "
        + campoLivreBlocoDois
        + digitoVerificadorDois + " "
        + campoLivreBlocoTres
        + digitoVerificadorTres + " "
        + digitoVerificadorQuatro + " "
        + fatorVencimento
        + valor
  }

  const RetornarLinhaDigitavel = (codigoBarra: string) => {
    let codigoBarraFormatado = codigoBarra.replace(/\./g, '').replace(/ /g, '')
    if (codigoBarraFormatado.length !== 44) {
        return "boleto inválido"
    }
    else {
        if (codigoBarraFormatado.slice(0, 1) !== '8') {
            return LinhaDigitavelBoleto(codigoBarraFormatado)
        }
        else {
            return LinhaDigitavelConsumo(codigoBarraFormatado)
        }
    }
  }

  const __onDetectCode = (result: any, check: string[]) => {
    var code = result.codeResult.code;
    var linhadigitavel = RetornarLinhaDigitavel(code)
    if (linhadigitavel.includes('boleto')) {
      return
    }
    check.push(linhadigitavel);
    onDetectCode(linhadigitavel, check);
  }

  useEffect(() => {
      const check: string[] = []
    if (stop) {
        Quagga.stop();
    } else {
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: {min: 1280},
                    height: {min: 720},
                    facingMode: "environment",
                    aspectRatio: { min: 1, max: 2 }
                },
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 4,
            decoder: {
                readers: ['i2of5_reader'],
            },
            locate: true,
            singleChannel: true
        }, function (err: any) {
            if (err) {
                console.log(err);
                return
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();
        });

        Quagga.onDetected((result: any) => __onDetectCode(result, check));
    }
  }, [stop])

  useEffect(() => {
    return () => {
        Quagga.stop();
    }
  }, []); 

  return (
    <div id="interactive" className="viewport" />
  );
}

export default BoletoReader;
