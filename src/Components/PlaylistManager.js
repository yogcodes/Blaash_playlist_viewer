import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PlaylistCard from "./PlaylistCard";
import { database, auth } from "../firebase/firebaseConfig.js";
import { get, ref, set } from "firebase/database";
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";
import "./PlaylistManager.css";
import { getAccesToken } from "../utls.js";

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
      return;
    }

    set(ref(database, `users/${auth.currentUser.uid}/playlists`), playlists)
      .then(() => {
        alert("Layout saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving layout:", error);
        alert("Failed to save layout.");
      });
  };

  const loadLayout = () => {
    if (!auth.currentUser) {
      alert("Please sign in to load the layout.");
      return;
    }

    get(ref(database, `users/${auth.currentUser.uid}/playlists`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setPlaylists(snapshot.val());
        } else {
          alert("No layout found for this user.");
        }
      })
      .catch((error) => {
        console.error("Error loading layout:", error);
      });
  };

  const handleGoogleSignIn = () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);

        const accessToken = credential.accessToken;
        console.log("Access Token:", accessToken);
        localStorage.setItem("access_token", accessToken);
        setUser(result.user);
        setIsLoggedIn(true);
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
        const ytPlaylists = data.items.map((item) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          videos: 0,
        }));
        setPlaylists([...ytPlaylists]);
        alert("Playlists imported successfully!");
      } else if (data.error) {
        console.error("YouTube API Error:", data.error.message);
        alert(`YouTube API Error: ${data.error.message}`);
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
    console.log("data.i", data.items);
    const videoCount = data.items ? data.items.length : 0;

    setPlaylists((prevPlaylists) =>
      prevPlaylists.map((playlist) =>
        playlist.id === id ? { ...playlist, videos: videoCount } : playlist
      )
    );

    setVideos(data.items || []);
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
                  <div
                    className="playlist-card"
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                  >
                    <img src={playlist.thumbnail} alt={playlist.title} />
                    <div className="card-details">
                      {console.log("playlist", playlist)}
                      <h4>{playlist.title}</h4>
                      <p>{playlist.videos} Videos</p>
                    </div>
                  </div>
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
