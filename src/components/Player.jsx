import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import { IconContext } from "react-icons";
import "./Style.css";

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrackDetails, setCurrentTrackDetails] = useState({ artist: '', songTitle: '' });

  // Ref for the audio player
  const audioRef = useRef(null);

  // Fetch Spotify Access Token on component mount
  useEffect(() => {
    axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
      .then(response => {
        setAccessToken(response.data.access_token);
      })
      .catch(error => {
        console.error('Error fetching Spotify access token', error);
      });
  }, []);

  // Fetch tracks when access token is available
  useEffect(() => {
    const fetchRandomJazzTracks = async () => {
      try {
        if (accessToken) {
          const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            params: {
              q: 'genre:jazz',
              type: 'track',
              limit: 50,
            }
          });

          const tracks = response.data.tracks.items.map(track => ({
            uri: track.preview_url,  // short 30-second preview URL
            artist: track.artists[0].name,
            songTitle: track.name,
          })).filter(track => track.uri);

          setPlaylist(tracks);
          setCurrentTrackIndex(0);
          setCurrentTrackDetails({
            artist: tracks[0].artist,
            songTitle: tracks[0].songTitle,
          });
        }
      } catch (error) {
        console.error('Error fetching jazz tracks', error);
      }
    };

    if (accessToken && playlist.length === 0) {
      fetchRandomJazzTracks();
    }
  }, [accessToken, playlist.length]);

  // Play track when index changes
  useEffect(() => {
    if (playlist.length > 0) {
      const currentTrack = playlist[currentTrackIndex];
      setCurrentTrackDetails({
        artist: currentTrack.artist,
        songTitle: currentTrack.songTitle,
      });

      // Auto-play new track if audioRef exists
      if (audioRef.current) {
        audioRef.current.src = currentTrack.uri;
        audioRef.current.play().catch(error => console.error("Playback error:", error));
        setIsPlaying(true);
      }
    }
  }, [currentTrackIndex, playlist]);

  const playingButton = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Playback error:", error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const previousButton = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const nextButton = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  return (
    <div className="component">
      <h2>🎧 Playing Now</h2>
      <img className="musicCover" src="https://picsum.photos/200/200" alt="music cover" />

      <div>
        <h3 className="title">{currentTrackDetails.songTitle || 'Music Title'}</h3>
        <p className="subtitle">{currentTrackDetails.artist || 'Artist'}</p>
      </div>

      <div>
        <button className="playButton" onClick={previousButton}>
          <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
            <BiSkipPrevious />
          </IconContext.Provider>
        </button>

        <button className="playButton" onClick={playingButton}>
          <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
            {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
          </IconContext.Provider>
        </button>

        <button className="playButton" onClick={nextButton}>
          <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
            <BiSkipNext />
          </IconContext.Provider>
        </button>
      </div>

      {/* Render the audio element */}
      <audio ref={audioRef} controls autoPlay />
    </div>
  );
};

export default Player;
