import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PlaylistCard from "./PlaylistCard";
import { database, auth } from "../firebase/firebaseConfig.js";
import { get, ref, set } from "firebase/database";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import "./PlaylistManager.css";
import { getAccesToken } from "../utls.js";

const ITEM_TYPE = "playlist";  

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [thumbnailTitle, setThumbnailTitle] = useState("");
  const [videoStatus, setVideoStatus] = useState("Active");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [videos, setVideos] = useState([]);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");

  const moveCard = (fromIndex, toIndex) => {
    const updatedPlaylists = [...playlists];
    const [moved] = updatedPlaylists.splice(fromIndex, 1);
    updatedPlaylists.splice(toIndex, 0, moved);
    setPlaylists(updatedPlaylists);
  };

  const saveLayout = () => {
    if (!auth.currentUser) {
      alert("Please sign in to save the layout.");
      console.log("User is not authenticated:", auth.currentUser);  
      return;
    }

    
    console.log("Saving playlists layout:", playlists);  

    set(ref(database, `users/${auth.currentUser.uid}/playlists`), playlists)
      .then(() => {
        alert("Layout saved successfully!");
        localStorage.setItem("playlists", JSON.stringify(playlists));
      })
      .catch((error) => {
        console.error("Error saving layout:", error);
        alert("Failed to save layout.");
      });
  };

  const loadLayout = () => {
    if (!auth.currentUser) {
      alert("Please sign in to load the layout.");
      console.log("User is not authenticated:", auth.currentUser);  
      return;
    }

    console.log(`Loading playlists layout for user: ${auth.currentUser.uid}`);  

    get(ref(database, `users/${auth.currentUser.uid}/playlists`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const playlistsFromDB = snapshot.val();
          setPlaylists(playlistsFromDB);
          console.log("Loaded playlists from Firebase:", playlistsFromDB);
          localStorage.setItem("playlists", JSON.stringify(playlistsFromDB)); 
        } else {
          alert("No layout found for this user.");
        }
      })
      .catch((error) => {
        console.error("Error loading layout:", error);
        alert("Failed to load layout.");
      });
  };


  useEffect(() => {
    const storedPlaylists = localStorage.getItem("playlists");
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists)); 
    }

    if (auth.currentUser) {
      loadLayout(); 
    }
  }, []); 

  const handleGoogleSignIn = () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        localStorage.setItem("access_token", accessToken);
        setUser(result.user);
        setIsLoggedIn(true);

        loadLayout(); 
      })
      .catch((error) => {
        console.error("Authentication Error:", error);
      });
  };

  const handleYTImport = async () => {
    if (!auth.currentUser) {
      alert("Please sign in first.");
      return;
    }

    setIsLoadingPlaylists(true);
    try {
      const accessToken = await getAccesToken();

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const ytPlaylists = await Promise.all(
          data.items.map(async (item) => {
            const playlistId = item.id;
            const videoCount = await fetchPlaylistVideoCount(accessToken, playlistId);
            return {
              id: playlistId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.default.url,
              videos: videoCount,
            };
          })
        );

        setPlaylists([...ytPlaylists]);
        alert("Playlists imported successfully!");
      } else {
        alert("No playlists found on YouTube.");
      }
    } catch (error) {
      console.error("Error importing playlists:", error);
      alert("Failed to import playlists from YouTube.");
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const fetchPlaylistVideoCount = async (accessToken, playlistId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      return data.items ? data.items.length : 0;
    } catch (error) {
      console.error("Error fetching video count for playlist:", error);
      return 0;
    }
  };

  const updatePlaylist = () => {
    alert(`Playlist updated: ${thumbnailTitle}, Status: ${videoStatus}`);
  };

  const handlePlaylistClick = async (id) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}`,
      {
        headers: { Authorization: `Bearer ${await getAccesToken()}` },
      }
    );
    const data = await response.json();
    const videoCount = data.items ? data.items.length : 0;

    setPlaylists((prevPlaylists) =>
      prevPlaylists.map((playlist) =>
        playlist.id === id ? { ...playlist, videos: videoCount } : playlist
      )
    );

    setVideos(data.items || []);
  };

  const PlaylistCardComponent = ({ playlist, index }) => {
    const [, drag] = useDrag({
      type: ITEM_TYPE,
      item: { index },
    });

    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      hover: (item) => {
        if (item.index !== index) {
          moveCard(item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <div
        className="playlist-card"
        ref={(node) => drag(drop(node))}  
        key={playlist.id}
        onClick={() => handlePlaylistClick(playlist.id)}
      >
        <img src={playlist.thumbnail} alt={playlist.title} />
        <div className="card-details">
          <h4>{playlist.title}</h4>
          <p>{playlist.videos} Videos</p>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="playlist-manager">
        {!isLoggedIn ? (
          <button onClick={handleGoogleSignIn} disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Login with Google"}
          </button>
        ) : (
          <>
            <h4 className="Product-heading">Product Playlists</h4>
            <div className="main-container">
              <div className="playlist-container">
                {playlists.map((playlist, index) => (
                  <PlaylistCardComponent key={playlist.id} playlist={playlist} index={index} />
                ))}
              </div>

              <div className="playlist-details">
                <h3>Thumbnail Title</h3>
                <input
                  type="text"
                  value={thumbnailTitle}
                  onChange={(e) => setThumbnailTitle(e.target.value)}
                  placeholder="Enter thumbnail title"
                />

                <h3>Video Status</h3>
                <div className="radio-buttons">
                  <label>
                    <input
                      type="radio"
                      value="Active"
                      checked={videoStatus === "Active"}
                      onChange={() => setVideoStatus("Active")}
                    />
                    Active
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="Inactive"
                      checked={videoStatus === "Inactive"}
                      onChange={() => setVideoStatus("Inactive")}
                    />
                    Inactive
                  </label>
                </div>

                <div className="product-list">
                  {videos.map((video) => (
                    <div className="product-item" key={video.id}>
                      <img
                        src={video.snippet.thumbnails.default.url}
                        alt={video.snippet.title}
                      />
                      <div>
                        <h4>{video.snippet.title}</h4>
                        <p>Products Attached: 5</p>
                      </div>
                      <input type="checkbox" />
                    </div>
                  ))}
                </div>

                <button onClick={handleYTImport} disabled={isLoadingPlaylists}>
                  {isLoadingPlaylists ? "Importing..." : "Import from YouTube"}
                </button>
              </div>
            </div>

            <div className="buttons">
              <button onClick={saveLayout}>Save Layout</button>
              <button onClick={loadLayout}>Load Layout</button>
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default PlaylistManager;
