// ─────────────────────────────────────────────────────────────────────────────
// PADI — Interactive Video Food Catalogue

import { useEffect, useRef, useState } from "react";
import { db } from "./lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

// ── Replace with your Cloudinary cloud name ──────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "dvqinmzsm";
const CLOUDINARY_UPLOAD_PRESET = "padi_foods";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const VC_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

/* ── Grid (Student View) ── */
.vc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  padding: 0;
}
.vc-grid-item {
  position: relative;
  aspect-ratio: 9 / 12;
  overflow: hidden;
  background: var(--surface2);
  cursor: pointer;
}
.vc-grid-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s;
}
.vc-grid-item:hover .vc-grid-thumb {
  transform: scale(1.04);
}
.vc-grid-play {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,.5);
  border-radius: 6px;
  padding: 3px 7px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
.vc-grid-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,.85));
  padding: 28px 10px 10px;
}
.vc-grid-name {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.vc-grid-price {
  font-size: 12px;
  font-weight: 700;
  color: var(--brand2, #FF8C42);
  margin-top: 2px;
}
.vc-grid-vendor {
  font-size: 10px;
  color: rgba(255,255,255,.6);
  margin-top: 1px;
}
.vc-grid-add {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--brand, #FF5A1F);
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255,90,31,.4);
  transition: transform .15s;
}
.vc-grid-add:active {
  transform: scale(.88);
}

/* ── Video Player Modal ── */
.vc-player-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 400;
  display: flex;
  flex-direction: column;
}
.vc-player-video {
  width: 100%;
  flex: 1;
  object-fit: cover;
}
.vc-player-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(rgba(0,0,0,.6), transparent);
  z-index: 10;
}
.vc-player-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,.4);
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vc-player-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 16px 32px;
  background: linear-gradient(transparent, rgba(0,0,0,.9));
  z-index: 10;
}
.vc-player-vendor {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.vc-player-vendor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand, #FF5A1F), var(--brand2, #FF8C42));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  color: #fff;
}
.vc-player-vendor-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.9);
}
.vc-player-food-name {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 6px;
}
.vc-player-desc {
  font-size: 13px;
  color: rgba(255,255,255,.75);
  line-height: 1.5;
  margin-bottom: 14px;
}
.vc-player-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vc-player-price {
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: var(--brand2, #FF8C42);
}
.vc-player-add {
  background: linear-gradient(135deg, var(--brand, #FF5A1F), var(--brand2, #FF8C42));
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 13px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255,90,31,.4);
  transition: transform .15s;
}
.vc-player-add:active {
  transform: scale(.96);
}
.vc-player-pause-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  pointer-events: none;
  animation: fadeHint .8s ease forwards;
}
@keyframes fadeHint {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

/* ── Record Modal (Vendor) ── */
.vc-record-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.8);
  backdrop-filter: blur(8px);
  z-index: 400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.vc-record-sheet {
  background: var(--surface, #16161C);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 430px;
  padding: 24px 20px 40px;
  max-height: 92vh;
  overflow-y: auto;
}
.vc-record-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border, #28283A);
  margin: 0 auto 20px;
}
.vc-record-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}
.vc-record-sub {
  font-size: 13px;
  color: var(--muted, #64647A);
  margin-bottom: 20px;
}
.vc-camera {
  width: 100%;
  aspect-ratio: 9 / 14;
  border-radius: 18px;
  overflow: hidden;
  background: #000;
  position: relative;
  margin-bottom: 16px;
}
.vc-camera video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vc-camera-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted, #64647A);
}
.vc-camera-placeholder-icon {
  font-size: 48px;
}
.vc-preview {
  width: 100%;
  aspect-ratio: 9 / 14;
  border-radius: 18px;
  overflow: hidden;
  background: #000;
  margin-bottom: 16px;
  position: relative;
}
.vc-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vc-preview-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0,192,127,.9);
  color: #fff;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}
.vc-rec-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto 20px;
  transition: all .2s;
}
.vc-rec-btn.idle {
  background: rgba(255,255,255,.15);
}
.vc-rec-btn.idle:hover {
  background: rgba(255,255,255,.25);
}
.vc-rec-btn-inner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--brand, #FF5A1F);
  transition: all .2s;
}
.vc-rec-btn.recording .vc-rec-btn-inner {
  border-radius: 8px;
  width: 28px;
  height: 28px;
  background: var(--red, #FF4444);
}
.vc-rec-timer {
  text-align: center;
  font-size: 13px;
  color: var(--muted, #64647A);
  margin-bottom: 16px;
  font-weight: 600;
}
.vc-rec-timer.active {
  color: var(--red, #FF4444);
  font-weight: 700;
}
.vc-input {
  background: var(--surface2, #1C1C28);
  border: 1.5px solid var(--border, #26263A);
  border-radius: 13px;
  padding: 14px 16px;
  color: var(--text, #F0F0F8);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  outline: none;
  width: 100%;
  transition: border-color .15s;
}
.vc-input:focus {
  border-color: var(--brand, #FF5A1F);
}
.vc-input::placeholder {
  color: var(--muted, #64647A);
}
.vc-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted, #64647A);
  letter-spacing: .5px;
  margin-bottom: 6px;
  display: block;
}
.vc-wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}
.vc-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.vc-btn-primary {
  background: linear-gradient(135deg, var(--brand, #FF5A1F), var(--brand2, #FF8C42));
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: opacity .15s;
  box-shadow: 0 8px 24px rgba(255,90,31,.3);
}
.vc-btn-primary:disabled {
  opacity: .5;
}
.vc-btn-ghost {
  background: var(--surface2, #1C1C28);
  color: var(--text, #F0F0F8);
  border: 1px solid var(--border, #26263A);
  border-radius: 14px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}
.vc-upload-progress {
  background: var(--surface2, #1C1C28);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.vc-upload-bar-bg {
  height: 6px;
  background: var(--border, #26263A);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}
.vc-upload-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--brand, #FF5A1F), var(--brand2, #FF8C42));
  border-radius: 3px;
  transition: width .3s;
}

/* ── Filter bar ── */
.vc-filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
}
.vc-filter-bar::-webkit-scrollbar {
  display: none;
}
.vc-filter-chip {
  background: var(--surface2, #1C1C28);
  border: 1px solid var(--border, #26263A);
  border-radius: 100px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s;
  color: var(--text, #F0F0F8);
}
.vc-filter-chip.active {
  background: rgba(255,90,31,.12);
  border-color: var(--brand, #FF5A1F);
  color: var(--brand, #FF5A1F);
  font-weight: 700;
}

/* ── Empty ── */
.vc-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted, #64647A);
}
.vc-empty-icon {
  font-size: 52px;
  margin-bottom: 12px;
}
.vc-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #F0F0F8);
  margin-bottom: 4px;
}

/* ── Loading skeleton ── */
.vc-skeleton {
  background: linear-gradient(
    90deg,
    var(--surface2, #1C1C28) 25%,
    var(--border, #26263A) 50%,
    var(--surface2, #1C1C28) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Nigerian Food",
  "Grills & BBQ",
  "Healthy",
  "Snacks",
  "Drinks",
  "Rice dishes",
  "Soups",
  "Other",
];

const MAX_DURATION = 30;

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function showErrorBox(message) {
  return (
    <div
      style={{
        background: "rgba(255,68,68,.1)",
        border: "1px solid rgba(255,68,68,.2)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: "#FF4444",
        marginBottom: 14,
      }}
    >
      {message}
    </div>
  );
}

// ─── Upload video to Cloudinary ──────────────────────────────────────────────
async function uploadToCloudinary(blob, onProgress) {
  const formData = new FormData();
  formData.append("file", blob, "food-video.webm");
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "padi/foods");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);

          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            thumbnail: data.secure_url.replace(
              "/upload/",
              "/upload/so_0,w_400,h_533,c_fill/f_jpg/"
            ),
            duration: data.duration,
          });
        } catch {
          reject(new Error("Invalid upload response"));
        }
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO PLAYER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VideoPlayerModal({ item, onClose, onAddToCart }) {
  const videoRef = useRef(null);
  const hintTimeoutRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
    return () => clearTimeout(hintTimeoutRef.current);
  }, []);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();
        setPaused(false);
      } catch {}
    } else {
      videoRef.current.pause();
      setPaused(true);
    }

    setShowHint(true);
    clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => setShowHint(false), 800);
  };

  const handleAdd = () => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const initials = item.vendorName?.slice(0, 2).toUpperCase() || "VN";

  return (
    <div className="vc-player-overlay">
      <style>{VC_CSS}</style>

      <video
        ref={videoRef}
        className="vc-player-video"
        src={item.videoUrl}
        loop
        playsInline
        onClick={togglePlay}
        style={{ cursor: "pointer" }}
      />

      {showHint && (
        <div className="vc-player-pause-hint">{paused ? "▶" : "⏸"}</div>
      )}

      <div className="vc-player-top">
        <button className="vc-player-back" onClick={onClose}>
          ✕
        </button>

        <div
          style={{
            background: "rgba(0,0,0,.4)",
            borderRadius: 100,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {paused ? "⏸ Paused" : "▶ Playing"}
        </div>
      </div>

      <div className="vc-player-bottom">
        <div className="vc-player-vendor">
          <div className="vc-player-vendor-avatar">{initials}</div>
          <div className="vc-player-vendor-name">{item.vendorName}</div>
        </div>

        <div className="vc-player-food-name">{item.name}</div>

        {item.description ? (
          <div className="vc-player-desc">{item.description}</div>
        ) : null}

        <div className="vc-player-footer">
          <div className="vc-player-price">{formatPrice(item.price)}</div>
          <button className="vc-player-add" onClick={handleAdd}>
            {added ? "✓ Added!" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO CATALOGUE SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export function VideoCatalogueScreen({ onAddToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [playing, setPlaying] = useState(null);
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    const q = query(
      collection(db, "foodVideos"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setItems(data);

      const extractedCategories = [
        "All",
        ...new Set(data.map((item) => item.category).filter(Boolean)),
      ];
      setCategories(extractedCategories);
      setLoading(false);
    });

    return unsub;
  }, []);

  const filteredItems =
    filter === "All"
      ? items
      : items.filter((item) => item.category === filter);

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <style>{VC_CSS}</style>

      <div className="listing-header">
        <div style={{ flex: 1 }}>
          <div className="h3">Food Catalogue 🎬</div>
          <div
            style={{
              color: "var(--muted)",
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Tap to watch · See exactly what you're ordering
          </div>
        </div>
      </div>

      <div className="vc-filter-bar">
        {categories.map((cat) => (
          <div
            key={cat}
            className={`vc-filter-chip ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="vc-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ aspectRatio: "9 / 12" }} className="vc-skeleton" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="vc-empty">
          <div className="vc-empty-icon">🎬</div>
          <div className="vc-empty-title">No food videos yet</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Vendors are still uploading their food catalogue. Check back soon!
          </div>
        </div>
      ) : (
        <div className="vc-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="vc-grid-item"
              onClick={() => setPlaying(item)}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="vc-grid-thumb"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--surface2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                  }}
                >
                  🍽️
                </div>
              )}

              <div className="vc-grid-play">
                ▶ {item.duration ? `${Math.round(item.duration)}s` : "Video"}
              </div>

              <button
                className="vc-grid-add"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
              >
                +
              </button>

              <div className="vc-grid-info">
                <div className="vc-grid-name">{item.name}</div>
                <div className="vc-grid-price">{formatPrice(item.price)}</div>
                <div className="vc-grid-vendor">{item.vendorName}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {playing && (
        <VideoPlayerModal
          item={playing}
          onClose={() => setPlaying(null)}
          onAddToCart={(selectedItem) => {
            onAddToCart(selectedItem);
            setPlaying(null);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR VIDEO UPLOADER
// ─────────────────────────────────────────────────────────────────────────────
export function VendorVideoUploader({ vendor, onClose, onUploaded }) {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [stage, setStage] = useState("setup"); // setup | ready | recording | preview | uploading | done
  const [stream, setStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  const clearRecordingTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopCamera = () => {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const cleanupPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setError("");

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }

      setStage("ready");
    } catch {
      setError("Camera access denied. Please allow camera access and try again.");
    }
  };

  const stopRecording = () => {
    clearRecordingTimer();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = () => {
    if (!stream) return;

    setError("");
    chunksRef.current = [];

    let recorder;

    try {
      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
    } catch {
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
      } catch {
        setError("Your device does not support video recording in this browser.");
        return;
      }
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);

      cleanupPreviewUrl();
      const previewUrl = URL.createObjectURL(blob);
      previewUrlRef.current = previewUrl;

      if (previewRef.current) {
        previewRef.current.src = previewUrl;
        previewRef.current.play().catch(() => {});
      }

      setStage("preview");
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();

    setRecordingTime(0);
    setStage("recording");

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const reRecord = async () => {
    cleanupPreviewUrl();
    setRecordedBlob(null);
    setRecordingTime(0);
    setError("");
    setStage("setup");
    await startCamera();
  };

  const handleUpload = async () => {
    if (!recordedBlob || !form.name.trim() || !form.price) return;

    setStage("uploading");
    setUploadProgress(0);
    setError("");

    try {
      const cloudinaryData = await uploadToCloudinary(
        recordedBlob,
        setUploadProgress
      );

      await addDoc(collection(db, "foodVideos"), {
        vendorId: vendor?.uid || "",
        vendorName: vendor?.businessName || "Vendor",
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        category: form.category,
        videoUrl: cloudinaryData.url,
        thumbnail: cloudinaryData.thumbnail,
        publicId: cloudinaryData.publicId,
        duration: cloudinaryData.duration,
        status: "active",
        likes: 0,
        orders: 0,
        createdAt: serverTimestamp(),
      });

      setStage("done");
      onUploaded?.();
    } catch {
      setError("Upload failed. Please check your internet and try again.");
      setStage("preview");
    }
  };

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      stopCamera();
      cleanupPreviewUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  return (
    <div className="vc-record-overlay">
      <style>{VC_CSS}</style>

      <div className="vc-record-sheet">
        <div className="vc-record-handle" />

        {stage === "setup" && (
          <>
            <div className="vc-record-title">Add Food Video 🎬</div>
            <div className="vc-record-sub">
              Record a short video of your food so students can see exactly
              what they're ordering!
            </div>

            <div className="vc-camera">
              <div className="vc-camera-placeholder">
                <div className="vc-camera-placeholder-icon">📸</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  Camera Preview
                </div>
                <div style={{ fontSize: 12 }}>Max 30 seconds</div>
              </div>
            </div>

            {error ? showErrorBox(error) : null}

            <button className="vc-btn-primary" onClick={startCamera}>
              📷 Open Camera
            </button>

            <button className="vc-btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {(stage === "ready" || stage === "recording") && (
          <>
            <div className="vc-record-title">
              {stage === "recording" ? "🔴 Recording..." : "Ready to Record"}
            </div>

            <div className="vc-camera">
              <video
                ref={videoRef}
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {stage === "recording" && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(255,68,68,.9)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                  {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
                </div>
              )}
            </div>

            {stage === "recording" && (
              <div
                style={{
                  background: "var(--surface2)",
                  borderRadius: 4,
                  height: 4,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--red, #FF4444)",
                    width: `${(recordingTime / MAX_DURATION) * 100}%`,
                    transition: "width 1s linear",
                    borderRadius: 4,
                  }}
                />
              </div>
            )}

            <div
              className={`vc-rec-timer ${
                stage === "recording" ? "active" : ""
              }`}
            >
              {stage === "recording"
                ? `⏱ ${formatTime(recordingTime)} — Tap stop when done`
                : "Tap the button to start recording"}
            </div>

            <div
              className={`vc-rec-btn ${
                stage === "recording" ? "recording" : "idle"
              }`}
              onClick={stage === "recording" ? stopRecording : startRecording}
            >
              <div className="vc-rec-btn-inner" />
            </div>

            <button
              className="vc-btn-ghost"
              onClick={() => {
                clearRecordingTimer();
                stopCamera();
                setStage("setup");
              }}
            >
              Cancel
            </button>
          </>
        )}

        {stage === "preview" && (
          <>
            <div className="vc-record-title">Preview Your Video</div>
            <div className="vc-record-sub">
              Looks good? Fill in the details below.
            </div>

            <div className="vc-preview">
              <video
                ref={previewRef}
                loop
                playsInline
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div className="vc-preview-badge">✓ Recorded</div>
            </div>

            <div className="vc-wrap">
              <label className="vc-label">Food Name *</label>
              <input
                className="vc-input"
                placeholder="e.g. Jollof Rice + Chicken"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="vc-row">
              <div className="vc-wrap">
                <label className="vc-label">Price (₦) *</label>
                <input
                  className="vc-input"
                  type="number"
                  placeholder="1500"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>

              <div className="vc-wrap">
                <label className="vc-label">Category</label>
                <select
                  className="vc-input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="vc-wrap">
              <label className="vc-label">Description</label>
              <textarea
                className="vc-input"
                rows={2}
                placeholder="What's in this dish? Ingredients, portions..."
                style={{ resize: "none", lineHeight: 1.5 }}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {error ? showErrorBox(error) : null}

            <button
              className="vc-btn-primary"
              onClick={handleUpload}
              disabled={!form.name.trim() || !form.price}
            >
              🚀 Upload Food Video
            </button>

            <button className="vc-btn-ghost" onClick={reRecord}>
              🔄 Re-record
            </button>
          </>
        )}

        {stage === "uploading" && (
          <>
            <div className="vc-record-title">Uploading... ☁️</div>
            <div className="vc-record-sub">Please don't close this screen</div>

            <div style={{ textAlign: "center", fontSize: 64, margin: "24px 0" }}>
              📤
            </div>

            <div className="vc-upload-progress">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                <span>Uploading to Cloudinary</span>
                <span style={{ color: "var(--brand, #FF5A1F)" }}>
                  {uploadProgress}%
                </span>
              </div>

              <div className="vc-upload-bar-bg">
                <div
                  className="vc-upload-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--muted, #64647A)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {uploadProgress < 50
                ? "Uploading video..."
                : uploadProgress < 90
                ? "Processing video..."
                : "Almost done..."}
            </div>
          </>
        )}

        {stage === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(0,192,127,.12)",
                border: "2px solid rgba(0,192,127,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>

            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Video Published! 🎉
            </div>

            <div
              style={{
                fontSize: 14,
                color: "var(--muted, #64647A)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              <strong>{form.name}</strong> is now live in the food catalogue.
              Students can watch and order it instantly!
            </div>

            <button className="vc-btn-primary" onClick={onClose}>
              Done ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}