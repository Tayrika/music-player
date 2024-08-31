import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Fetch access token
    axios.post('https://accounts.spotify.com/api/token', 
    'grant_type=client_credentials', 
    {
      headers: {
        'Authorization': 'Basic ' + btoa(`${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(response => {
      setAccessToken(response.data.access_token);
    }).catch(error => {
      console.log('Error fetching Spotify access token', error);
    });
  }, []);

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
            uri: track.preview_url,
            artist: track.artists[0].name,
            songTitle: track.name,
          })).filter(track => track.uri);
  
          setPlaylist(tracks);
          setCurrentTrackIndex(0);
          setCurrentTrackDetails({ artist: tracks[0].artist, songTitle: tracks[0].songTitle });
          setIsPlaying(true); // Automatically start playing the first track
        }
      } catch (error) {
        console.error('Error fetching jazz tracks', error);
      }
    };
  
    if (!playlist.length) {
      fetchRandomJazzTracks();
    } else {
      // Update current track details when the track index changes
      const currentTrack = playlist[currentTrackIndex];
      setCurrentTrackDetails({
        artist: currentTrack.artist,
        songTitle: currentTrack.songTitle,
      });
    }
  }, [accessToken, currentTrackIndex, playlist]);
  

  const playingButton = () => {
    const audioElement = document.getElementById("audio-player");

    if (!audioElement) {
      console.error("Audio element not found");
      return;
    }

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const previousButton = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const nextButton = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
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
        {!isPlaying ? (
          <button className="playButton" onClick={playingButton}>
          <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
            <AiFillPlayCircle />
          </IconContext.Provider>
        </button>
        ) : (
          <button className="playButton" onClick={playingButton}>
            <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
              <AiFillPauseCircle />
            </IconContext.Provider>
          </button>
        )}

        <button className="playButton" onClick={nextButton}>
          <IconContext.Provider value={{size: "3rem", color: "#27AE60"}}>
            <BiSkipNext />
          </IconContext.Provider>
        </button>
      </div>

      {/* Render the audio element */}
      {playlist.length > 0 && (
        <audio id="audio-player" src={playlist[currentTrackIndex].uri} controls autoPlay />
      )}
    </div>
  );
};

export default Player;
