"use client"; // necessário para usar eventos e hooks

import { useState, useRef, useEffect, ChangeEvent } from "react";
import './globals.css';

export default function Player() {
  const musicas = [
    { arquivo: "/audio/Limp Bizkit - My Way.mp3", capa: "/icones/capa1.jpg" },
    { arquivo: "/audio/Metallica - All Nightmare.mp3", capa: "/icones/capa2.jpg" },
    { arquivo: "/audio/Papa Roach - Last Resort.mp3", capa: "/icones/capa3.jpg" },
  ];

  const [indice, setIndice] = useState(0);

  // estado que indica se está tocando (play / pause)
  const [tocando, setTocando] = useState(false);

  // estado do volume (0 a 1)
  const [volume, setVolume] = useState(0.5);
  
  // armazena o volume antes de mutar
  const [volumeAnterior, setVolumeAnterior] = useState(0.5); 

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTocando(false);
    setVolume(0.5);
    setVolumeAnterior(0.5); // Inicializa o volume anterior também

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
    
  }, []);

  // sincroniza o elemento <audio> sempre que o estado volume mudar
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
      // tenta tocar; se falhar (autoplay bloqueado) o estado ficará como false
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setTocando(true))
          .catch(() => {
            // autoplay bloqueado pelo navegador: apenas atualizamos o estado local
            // permanecemos em tocando = false, mas o usuário pode clicar novamente
            setTocando(false);
          });
      } else {
        // caso não retorne promise, assumimos que tocou
        setTocando(true);
      }
    }
  };

  const tocarMusica = (novoIndice: number) => {
    if (!audioRef.current) {
      setIndice(novoIndice);
      return;
    }

    setIndice(novoIndice);

    audioRef.current.src = musicas[novoIndice].arquivo;

    audioRef.current.volume = volume;

    audioRef.current.oncanplay = () => {
      const p = audioRef.current?.play();
      if (p && typeof p.then === "function") {
        p.then(() => setTocando(true)).catch(() => setTocando(false));
      } else {
        setTocando(true);
      }
      if (audioRef.current) audioRef.current.oncanplay = null;
    };
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
    // Se o usuário ajustar o slider, guardamos esse novo valor como o "anterior" caso ele mute depois
    if (v > 0) { 
      setVolumeAnterior(v);
    }
  };

  // Nova função para mutar e desmutar
  const mutarDesmutar = () => {
    if (volume > 0) {
      // Se não está mudo, salvamos o volume atual e mutamos
      setVolumeAnterior(volume);
      setVolume(0);
    } else {
      // Se está mudo (volume === 0), restauramos o volume anterior
      // Se o volume anterior por algum motivo também for 0, usamos 0.5 como padrão
      setVolume(volumeAnterior > 0 ? volumeAnterior : 0.5); 
    }
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
        {/* Adiciona o onClick e a lógica para trocar o ícone */}
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
    </main>
  );
}