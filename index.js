import * as Y from "yjs";
import { UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { color } from "three/tsl";

let model;
let container;
let camera, scene, renderer;
let controls;
let currentUserName = "";
async function threejsSetup() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(0, 0, 0);
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 0, 0.25);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.target.set(0, 0.1, 0);
  controls.maxPolarAngle = Math.PI / 2;
  controls.maxDistance = 10;
  controls.minDistance = 1;

  const loader = new GLTFLoader();
  loader.load("GLB Models/Precedent_Rooftop_Unit.glb", (gltf) => {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    scene.add(model);
    console.log("model loaded");
  });

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
const tabButtons = document.querySelectorAll(".tab-button");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(button);
    if (button.value == 0) {
      button.style.backgroundColor = "#32c9e0";
      tabButtons[1].style.backgroundColor = "#30f0f0";
    } else {
      button.style.backgroundColor = "#32c9e0";
      tabButtons[0].style.backgroundColor = "#30f0f0";
    }

    const tabId = button.getAttribute("data-tab");

    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
  });
});

async function collaboration() {
  const ydoc = new Y.Doc();
  /*   let ymap = ydoc.getMap("stateMap");
  let value = 0;
  ymap.set("state", value); */
  const yText = ydoc.getText("chatMessages");
  const provider = new WebsocketProvider(
    "ws://localhost:5173/",
    "chat-room",
    ydoc
  );

  /*  const elem = document.getElementById("click");
  const data = document.getElementById("data"); */
  /*  const undoBtn = document.getElementById("undo");
  const redoBtn = document.getElementById("redo"); */
  function getOrCreateSessionID() {
    let sessionID =
      localStorage.getItem("sessionID") ||
      Math.random().toString(36).substring(2, 8);
    localStorage.setItem("sessionID", sessionID);

    return sessionID;
  }
  document.getElementById("share").addEventListener("click", () => {
    const sessionID = getOrCreateSessionID();
    const sessionLink = `http://localhost:5173//${sessionID}`;
    document.getElementById("sessionIdDisplay").innerText = sessionLink;

    document.getElementById("sessionModal").style.display = "block";
    let copySessionID = document.getElementById("copySessionLink");
    copySessionID.innerHTML = "Copy link";
    copySessionID.addEventListener("click", () => {
      navigator.clipboard.writeText(sessionLink);
      copySessionID.innerHTML = "Copied";
    });

    /*alert("Session shared! link copied to clipboard"); */
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("sessionModal").style.display = "none";
  });
  const list = document.getElementById("participants");
  const sessionID = getOrCreateSessionID();
  const participants = ydoc.getMap(sessionID);

  const participantsName = ydoc.getMap("participants");
  function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`; // Soft pastel colors
  }

  document.addEventListener("DOMContentLoaded", () => {
    const usernameModal = document.getElementById("usernameModal");
    const joinBtn = document.getElementById("joinSession");
    usernameModal.style.display = "block";

    joinBtn.addEventListener("click", () => {
      const userName = document.getElementById("usernameInput").value.trim();
      if (userName) {
        currentUserName = userName;
        usernameModal.style.display = "none";
        participantsName.set(currentUserName, {
          color: getRandomColor(),
          joinedAt: Date.now(),
        });
        addUserToSession(userName);
      } else {
        alert("Please enter a name!");
      }
    });
  });

  function addUserToSession(userName) {
    const li = document.createElement("li");
    li.textContent = userName;
    list.appendChild(li);

    participants.set(userName, { joinedAt: Date.now() });
  }
  participants.observe(() => {
    list.innerHTML = ""; // Clear list before re-rendering
    Array.from(participants.keys()).forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
    });
  });
  /* let ymap = ydoc.getMap(sessionID);

    elem.addEventListener("click", () => {
    value += 1;
    ymap.set("state", value);
    ymapRemote.set("state", value);
  });
  ymap.observe(() => {
    data.innerHTML = ymap.get("state");
  }); */

  const cameraState = ydoc.getMap("cameraState");
  cameraState.set("position", {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });
  cameraState.set("rotation", {
    x: camera.rotation.x,
    y: camera.rotation.y,
    z: camera.rotation.z,
  });
  controls.addEventListener("change", () => {
    const prevPosition = cameraState.get("position");
    const prevRotation = cameraState.get("rotation");

    const newPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    const newRotation = {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    };
    if (
      JSON.stringify(prevPosition) !== JSON.stringify(newPosition) ||
      JSON.stringify(prevRotation) !== JSON.stringify(newRotation)
    ) {
      cameraState.set("position", newPosition);
      cameraState.set("rotation", newRotation);
    }
  });

  let isUndoRedo = false;

  cameraState.observe(() => {
    if (isUndoRedo) return; // Prevent infinite loop

    const position = cameraState.get("position");
    const rotation = cameraState.get("rotation");

    if (position && rotation) {
      camera.position.set(position.x, position.y, position.z);
      camera.rotation.set(rotation.x, rotation.y, rotation.z);
      controls.update();
    }
  });

  document.getElementById("send-btn").addEventListener("click", () => {
    const inputField = document.getElementById("chat-input");
    const message = inputField.value.trim();

    if (message) {
      yText.insert(yText.length, `${currentUserName}: ${message}\n`);
      inputField.value = "";
    }
  });
  /*  yText.observe(() => {
    document.getElementById("chat-box").innerText = yText.toString();
  }); */
  yText.observe(() => {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = ""; // Clear previous messages

    const messages = yText.toString().split("\n"); // Convert to list

    messages.forEach((msg) => {
      const [userName, text] = msg.split(": "); // Assuming messages are formatted as "user: text"
      const userInfo = participantsName.get(userName) || { color: "#ffffff" };
      console.log(userName);
      const messageDiv = document.createElement("div");
      messageDiv.innerText = msg;
      messageDiv.style.color = userInfo.color;
      console.log(msg);
      // Right-align current session user, left-align others
      messageDiv.style.textAlign =
        userName === currentUserName ? "right" : "left";

      chatBox.appendChild(messageDiv);
    });
  });

  /*   const undoManager = new UndoManager([cameraState], { captureTimeout: 0 });
  undoBtn.addEventListener("click", () => {
    if (undoManager.canUndo()) {
      console.log("undo clicked", undoManager);
      isUndoRedo = true;
      undoManager.undo();
      isUndoRedo = false;
    } else {
      alert("Undo stack is empty");
    }
  });

  redoBtn.addEventListener("click", () => {
    if (undoManager.canRedo()) {
      isUndoRedo = true;
      undoManager.redo();
      isUndoRedo = false;
    } else {
      alert("Redo stack is empty");
    }
  }); */
}

threejsSetup();
collaboration();
