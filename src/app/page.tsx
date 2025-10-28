"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import './globals.css';

export default function Player() {
  const musicas = [
    { arquivo: "/audio/Limp Bizkit - My Way.mp3", capa: "/icones/capa1.jpg" },
    { arquivo: "/audio/Metallica - All Nightmare.mp3", capa: "/icones/capa2.jpg" },
    { arquivo: "/audio/Papa Roach - Last Resort.mp3", capa: "/icones/capa3.jpg" },
  ];

  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [volumeAnterior, setVolumeAnterior] = useState(0.5);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracaoTotal, setDuracaoTotal] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTocando(false);
    setVolume(0.5);
    setVolumeAnterior(0.5);

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
    
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const tocarOuPausar = () => {
    if (!audioRef.current) return;

    if (tocando) {
      audioRef.current.pause();
      setTocando(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setTocando(true))
          .catch(() => {
            setTocando(false);
          });
      } else {
        setTocando(true);
      }
    }
  };

  const tocarMusica = (novoIndice: number) => {
    if (!audioRef.current) {
      setIndice(novoIndice);
      return;
    }

    if (novoIndice === indice && tocando) {
      return;
    }

    setIndice(novoIndice);
    setTocando(false);
    setTempoAtual(0);
    setDuracaoTotal(0);

    audioRef.current.src = musicas[novoIndice].arquivo;
    audioRef.current.load();
    audioRef.current.volume = volume;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setTocando(true))
        .catch(() => setTocando(false));
    } else {
      setTocando(true);
    }
  };

  const proxima = () => {
    const novo = (indice + 1) % musicas.length;
    tocarMusica(novo);
  };

  const anterior = () => {
    const novo = (indice - 1 + musicas.length) % musicas.length;
    tocarMusica(novo);
  };

  const mudarVolume = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0) {
      setVolumeAnterior(v);
    }
  };

  const mutarDesmutar = () => {
    if (volume > 0) {
      setVolumeAnterior(volume);
      setVolume(0);
    } else {
      setVolume(volumeAnterior > 0 ? volumeAnterior : 0.5);
    }
  };

  const formatarTempo = (segundos: number) => {
    if (isNaN(segundos) || segundos < 0) return "00:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  const lidarComMetadados = () => {
    if (audioRef.current) {
      setDuracaoTotal(audioRef.current.duration);
    }
  };

  const lidarComTempoAtual = () => {
    if (audioRef.current) {
      setTempoAtual(audioRef.current.currentTime);
    }
  };

  const mudarTempo = (e: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const novoTempo = parseFloat(e.target.value);
      audioRef.current.currentTime = novoTempo;
      setTempoAtual(novoTempo);
    }
  };

  const retroceder10s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const avancar10s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.currentTime + 10;
    }
  };

  return (
    <main className="player">
      <h1>🎵 Player de Música</h1>

      <div className="album-cover">
        <img src={musicas[indice].capa} alt="Capa do álbum" />
      </div>

      <audio
        ref={audioRef}
        src={musicas[indice].arquivo}
        onLoadedMetadata={lidarComMetadados}
        onTimeUpdate={lidarComTempoAtual}
        onEnded={proxima}
      ></audio>

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

      <div className="time-controls">
        <span>{formatarTempo(tempoAtual)}</span>
        <input
          type="range"
          min="0"
          max={duracaoTotal || 0}
          value={tempoAtual}
          onChange={mudarTempo}
          className="seek-bar"
          step="0.1"
          disabled={duracaoTotal === 0}
        />
        <span>{formatarTempo(duracaoTotal)}</span>
      </div>

      <div className="skip-controls">
        <a onClick={retroceder10s} style={{ cursor: 'pointer' }}>
          <img src="https://img.icons8.com/ios-glyphs/90/ffffff/replay-10.png" alt="Retroceder 10s" />
        </a>
        <a onClick={avancar10s} style={{ cursor: 'pointer' }}>
          <img src="https://img.icons8.com/ios-glyphs/90/ffffff/forward-10.png" alt="Avançar 10s" />
        </a>
      </div>

      <div className="volume-control">
        <a onClick={mutarDesmutar} style={{ cursor: 'pointer' }}>
          <img src={volume === 0 ? "https://cdn-icons-png.flaticon.com/512/727/727240.png" : "https://cdn-icons-png.flaticon.com/512/727/727269.png"} alt="Volume/Mudo" />
        </a>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={mudarVolume}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div id="musica-atual">
        Tocando: {musicas[indice].arquivo.split("/").pop()}
      </div>

      <div className="playlist">
        <h2>Lista de Reprodução</h2>
        {musicas.map((musica, i) => (
          <div
            key={i}
            className={`playlist-item ${i === indice ? 'active' : ''}`}
            onClick={() => tocarMusica(i)}
          >
            <img src={musica.capa} alt="Capa" className="playlist-item-capa" />
            <span>{musica.arquivo.split("/").pop()?.replace('.mp3', '')}</span>
          </div>
        ))}
      </div>
    </main>
  );
}