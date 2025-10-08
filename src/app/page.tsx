"use client"; // necessário para usar eventos e hooks

import { useState, useRef, ChangeEvent } from "react";
import './globals.css';

export default function Player() {
  const musicas = [
    { arquivo: "/audio/Limp Bizkit - My Way.mp3", capa: "/icones/capa1.jpg" },
    { arquivo: "/audio/Metallica - All Nightmare.mp3", capa: "/icones/capa2.jpg" },
    { arquivo: "/audio/Papa Roach - Last Resort.mp3", capa: "/icones/capa3.jpg" },
  ];

  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tocarOuPausar = () => {
    if (!audioRef.current) return;

    if (tocando) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setTocando(!tocando);
  };

  const tocarMusica = (novoIndice: number) => {
    if (!audioRef.current) return;

    audioRef.current.src = musicas[novoIndice].arquivo;

    // tocar somente quando o áudio estiver carregado
    audioRef.current.oncanplay = () => {
      audioRef.current?.play();
      setTocando(true);
      audioRef.current!.oncanplay = null; // limpa o listener para não acumular
    };
  };

  const proxima = () => {
    const novo = (indice + 1) % musicas.length;
    setIndice(novo);
    tocarMusica(novo);
  };

  const anterior = () => {
    const novo = (indice - 1 + musicas.length) % musicas.length;
    setIndice(novo);
    tocarMusica(novo);
  };

  const mudarVolume = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.volume = parseFloat(e.target.value);
  };

  return (
    <main className="player">
      <h1>🎵 Player de Música</h1>

      <div className="album-cover">
        <img src={musicas[indice].capa} alt="Capa do álbum" />
      </div>

      <audio ref={audioRef} src={musicas[indice].arquivo}></audio>

      <div className="controls">
        <a onClick={anterior}>
          <img src="/icones/Voltar.png" alt="Anterior" />
        </a>

        <a onClick={tocarOuPausar}>
          <img
            src={tocando ? "/icones/Pause.png" : "/icones/Play.png"}
            alt="Play/Pause"
          />
        </a>

        <a onClick={proxima}>
          <img src="/icones/Avancar.png" alt="Próxima" />
        </a>
      </div>

      <div className="volume-control">
        <img src="/icones/Volume.png" alt="Volume" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="0.5"
          onChange={mudarVolume}
        />
      </div>

      <div id="musica-atual">
        Tocando: {musicas[indice].arquivo.split("/").pop()}
      </div>
    </main>
  );
}